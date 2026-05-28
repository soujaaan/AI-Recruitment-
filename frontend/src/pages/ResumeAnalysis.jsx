import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import UploadBox from "@/components/resume-analysis/UploadBox";
import ATSScoreCard from "@/components/resume-analysis/ATSScoreCard";
import SkillsCard from "@/components/resume-analysis/SkillsCard";
import WeaknessCard from "@/components/resume-analysis/WeaknessCard";
import SuggestionsCard from "@/components/resume-analysis/SuggestionsCard";
import { aiService } from "@/services/ai.service";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ResumeAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return "Please select a PDF file.";
    if (selectedFile.type !== "application/pdf") return "Only PDF files are allowed.";
    if (selectedFile.size > MAX_SIZE_BYTES) return "File size must be less than 5MB.";
    return "";
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setFile(null);
      setAnalysis(null);
      setError(validationError);
      return;
    }
    setError("");
    setAnalysis(null);
    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await aiService.analyzeResumePdf(file);
      setAnalysis(data?.analysis || null);
      toast.success("Resume analyzed successfully.");
    } catch (err) {
      const message = err?.message || "Resume analysis failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">AI Resume Analysis</h1>
          <p className="mt-2 text-muted-foreground">Upload your resume and get ATS-friendly feedback instantly.</p>
        </div>

        <UploadBox file={file} loading={loading} error={error} onFileSelect={handleFileSelect} onSubmit={handleAnalyze} />

        {analysis ? (
          <div className="mt-8 space-y-6">
            <ATSScoreCard score={analysis.atsScore} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SkillsCard
                technicalSkills={analysis.technicalSkills || []}
                missingKeywords={analysis.missingKeywords || []}
              />
              <WeaknessCard strengths={analysis.strengths || []} weaknesses={analysis.weaknesses || []} />
            </div>
            <SuggestionsCard suggestions={analysis.suggestions || []} />
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default ResumeAnalysis;
