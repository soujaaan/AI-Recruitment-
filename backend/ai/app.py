import os
import json
import pickle
from functools import lru_cache

from flask import Flask, request, jsonify
from flask_cors import CORS

from utils import clean_text

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return {"status": "ATS ML Service Running"}



def _model_path(name: str) -> str:
    return os.path.join(MODEL_DIR, name)


@lru_cache(maxsize=1)
def load_models():
    """Load all models once at startup."""
    required = [
        "clf.pkl",
        "tfidf.pkl",
        "encoder.pkl",
        "prototypes.pkl",
        "ats_scorer.pkl",
    ]
    missing = [p for p in required if not os.path.exists(_model_path(p))]
    if missing:
        raise FileNotFoundError(f"Missing required model artifacts in {MODEL_DIR}: {missing}")

    clf = pickle.load(open(_model_path("clf.pkl"), "rb"))
    tfidf = pickle.load(open(_model_path("tfidf.pkl"), "rb"))
    encoder = pickle.load(open(_model_path("encoder.pkl"), "rb"))
    prototypes = pickle.load(open(_model_path("prototypes.pkl"), "rb"))
    ats_scorer = pickle.load(open(_model_path("ats_scorer.pkl"), "rb"))

    return {
        "clf": clf,
        "tfidf": tfidf,
        "encoder": encoder,
        "prototypes": prototypes,
        "ats_scorer": ats_scorer,
    }


def preprocess_resume_text(resume_text: str) -> str:
    return clean_text(resume_text)


def keyword_overlap(tokens, keywords_set):
    if not tokens:
        return 0.0
    if not keywords_set:
        return 0.0
    tokens_set = set(tokens)
    inter = tokens_set.intersection(keywords_set)
    return len(inter)


def extract_skills_deterministic(resume_text: str, predicted_role: str, prototypes):
    """Prototype comparison-based skill extraction without hallucinations."""
    cleaned = preprocess_resume_text(resume_text)
    tokens = cleaned.split() if cleaned else []

    # prototypes expected structure: {role: {keywords/prototypes...}}
    # We handle a few likely shapes deterministically.
    matched = set()
    role_proto = None
    if isinstance(prototypes, dict):
        role_proto = prototypes.get(predicted_role) or prototypes.get(str(predicted_role).lower())

    # Collect prototype keywords if present
    proto_keywords = set()
    if isinstance(role_proto, dict):
        for k, v in role_proto.items():
            if isinstance(v, (list, set, tuple)):
                proto_keywords.update([str(x).lower() for x in v])
            elif isinstance(v, str):
                proto_keywords.update([v.lower()])
    elif isinstance(role_proto, (list, set, tuple)):
        proto_keywords.update([str(x).lower() for x in role_proto])

    if not proto_keywords:
        # Fall back to using top tfidf terms from resume itself that appear in any prototype keywords
        # Deterministic: no scoring, just intersection with global prototype keywords
        global_keywords = set()
        if isinstance(prototypes, dict):
            for _, rp in prototypes.items():
                if isinstance(rp, dict):
                    for _, v in rp.items():
                        if isinstance(v, (list, set, tuple)):
                            global_keywords.update([str(x).lower() for x in v])
                elif isinstance(rp, (list, set, tuple)):
                    global_keywords.update([str(x).lower() for x in rp])
        proto_keywords = global_keywords

    # Matched skills are intersection with prototype keywords
    for tok in tokens:
        if tok in proto_keywords:
            matched.add(tok)

    matchedSkills = sorted(matched)

    # Missing skills: subset from prototype keywords not matched (cap)
    missing = sorted(list(proto_keywords.difference(matched)))
    missingSkills = missing[:20]

    return matchedSkills[:20], missingSkills


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        payload = request.get_json(force=True) or {}
        resume_text = payload.get("resumeText") or payload.get("resume_text")
        if not resume_text or not str(resume_text).strip():
            return jsonify({"error": "resumeText is required"}), 400

        models = load_models()

        cleaned = preprocess_resume_text(resume_text)
        tfidf_vec = models["tfidf"].transform([cleaned])

        # Role prediction
        pred_idx = models["clf"].predict(tfidf_vec)[0]
        # encoder decode
        try:
            predictedRole = models["encoder"].inverse_transform([pred_idx])[0]
        except Exception:
            predictedRole = str(pred_idx)

        # ATS score regression
        # Some scorers expect sparse arrays; tfidf_vec is fine for most sklearn regressors.
        ats_raw = models["ats_scorer"].predict(tfidf_vec)[0]
        atsScore = float(max(0, min(100, ats_raw)))

        # Similarity (cosine similarity) approximation using tfidf cosine to role prototype centroid if available
        similarity = 0.0
        try:
            # prototypes may store role vectors/centroids; handle deterministic retrieval
            proto = models["prototypes"].get(predictedRole) if isinstance(models["prototypes"], dict) else None
            if proto is not None:
                # if proto is a vectorizer-space sparse/dense vector
                import numpy as np
                from sklearn.metrics.pairwise import cosine_similarity

                proto_vec = proto
                # If proto is stored as sparse matrix/list of floats
                if not hasattr(proto_vec, "shape") and isinstance(proto_vec, (list, tuple)):
                    proto_vec = np.array(proto_vec)
                # If dict stores under keys
                if isinstance(proto, dict) and "vector" in proto:
                    proto_vec = proto["vector"]

                # Ensure 2D
                sim = cosine_similarity(tfidf_vec, proto_vec)
                similarity = float(sim[0][0])
        except Exception:
            similarity = 0.0

        # Keyword match score (deterministic): overlap between resume tokens and prototype keywords
        matchedSkills, missingSkills = extract_skills_deterministic(resume_text, predictedRole, models["prototypes"])
        keywordMatch = 0.0
        if matchedSkills:
            keywordMatch = float(min(100, (len(matchedSkills) / max(1, len(matchedSkills) + len(missingSkills))) * 100))

        # Deterministic insights
        strengths = []
        weaknesses = []
        recommendations = []

        if atsScore >= 80:
            strengths.append("Strong resume alignment with the target role")
        elif atsScore >= 60:
            strengths.append("Good baseline alignment; targeted improvements recommended")
        else:
            weaknesses.append("Resume alignment appears weak; focus on role-specific keywords")

        if keywordMatch < 30:
            recommendations.append("Improve keyword coverage by adding role-relevant terms from the ATS keyword set")

        # Example deterministic domain checks
        lowered = cleaned
        tech_hints = {
            "docker": "Add Docker exposure if applicable to your experience",
            "aws": "Add AWS exposure (projects, certifications, or deployments)",
            "kubernetes": "Add Kubernetes usage details if you have container orchestration experience",
            "react": "Highlight React projects (components, state management, performance)",
            "node": "Clarify Node.js backend work (APIs, database, performance)",
            "python": "If relevant, include Python usage in projects and tooling",
        }
        for key, rec in tech_hints.items():
            if key not in lowered:
                # only add weak recs if ats is not already great
                if atsScore < 85:
                    recommendations.append(rec)

        # Deduplicate
        recommendations = list(dict.fromkeys(recommendations))[:6]

        if not weaknesses and missingSkills:
            weaknesses.append("Missing role-specific skills detected in the resume")

        return jsonify({
            "atsScore": int(round(atsScore)),
            "predictedRole": predictedRole,
            "skills": matchedSkills,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations
        })

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Port 5000 required
    app.run(host="0.0.0.0", port=5000, debug=False)

