import { Question } from "../models/question.model.js";
import { AssessmentAttempt } from "../models/assessmentAttempt.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Resume } from "../models/resume.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

// Helper for shuffling array
const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

export const startAssessment = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const jobId = req.params.jobId;

    if (req.user?.role?.toLowerCase() !== "candidate") {
        throw new ApiError(403, "Only candidates can take assessments");
    }

    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found");
    if (job.isActive === false) throw new ApiError(400, "Job is not active");

    console.log("Authenticated user:", req.user);
    console.log("Fetched job:", job);

    // Check if already applied
    const existingApp = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApp) throw new ApiError(400, "You have already applied for this job");

    // Check if there is an in-progress attempt
    let attempt = await AssessmentAttempt.findOne({ 
        job: jobId, 
        candidate: userId, 
        status: "in-progress" 
    }).populate("questions.question");

    if (attempt) {
        // Return existing attempt to resume
        return sendSuccess(res, 200, { attempt }, "Resumed existing assessment attempt");
    }

    // Temporary Stabilization Fix: Return all questions instead of fragile regex
    let pool = await Question.find();

    console.log("Questions found:", pool.length);

    if (pool.length < (job.assessmentQuestionCount || 10)) {
        // Fallback to random generic questions to ensure we have enough
        const generic = await Question.find({ _id: { $nin: pool.map(p => p._id) } });
        pool = [...pool, ...generic];
    }

    // Shuffle and pick
    const selectedQuestions = shuffleArray(pool).slice(0, job.assessmentQuestionCount || 10);
    
    if (selectedQuestions.length === 0) {
        throw new ApiError(500, "No questions available for this role");
    }

    const attemptQuestions = selectedQuestions.map(q => ({
        question: q._id,
        points: q.points
    }));

    const maxScore = selectedQuestions.reduce((acc, q) => acc + q.points, 0);

    attempt = await AssessmentAttempt.create({
        candidate: userId,
        job: jobId,
        status: "in-progress",
        questions: attemptQuestions,
        maxScore,
        startedAt: new Date(),
        durationLimit: job.assessmentDuration || 15
    });

    await attempt.populate("questions.question");

    // Strip out correct answers before sending to client
    const sanitizedAttempt = attempt.toObject();
    sanitizedAttempt.questions = sanitizedAttempt.questions.map(q => {
        delete q.question.correctAnswer; // Prevent cheating
        // Shuffle options for MCQ
        if (q.question.type === "mcq" && q.question.options) {
            q.question.options = shuffleArray([...q.question.options]);
        }
        return q;
    });

    return sendSuccess(res, 201, { attempt: sanitizedAttempt }, "Assessment started successfully");
});

export const submitAssessment = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.id;
    const { attemptId } = req.params;
    const { answers } = req.body; // Array of { questionId, answer }

    const attempt = await AssessmentAttempt.findOne({
        _id: attemptId,
        candidate: userId,
        status: "in-progress"
    }).populate("questions.question");

    if (!attempt) {
        throw new ApiError(404, "Active assessment attempt not found or already completed");
    }

    const job = await Job.findById(attempt.job);
    if (!job) throw new ApiError(404, "Job no longer exists");

    const now = new Date();
    const durationSecs = Math.floor((now - attempt.startedAt) / 1000);
    const limitSecs = attempt.durationLimit * 60;
    
    // Add 10 seconds grace period
    if (durationSecs > limitSecs + 10) {
        attempt.status = "timeout";
    } else {
        attempt.status = "completed";
    }

    let earnedScore = 0;
    const evaluatedAnswers = [];

    // Evaluate answers
    for (const qObj of attempt.questions) {
        const question = qObj.question;
        const subAnswer = answers.find(a => String(a.questionId) === String(question._id));
        const candidateAnswer = subAnswer ? subAnswer.answer : "";

        let isCorrect = false;
        let score = 0;

        if (question.type === "mcq") {
            isCorrect = String(candidateAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
            score = isCorrect ? question.points : 0;
        } else if (question.type === "text") {
            // Basic text evaluation: keyword matching or semantic
            // For now, simple length/keyword check as a placeholder for AI
            const ansLower = String(candidateAnswer).toLowerCase();
            if (ansLower.length > 20) {
                isCorrect = true;
                score = question.points; // Give full points for effort in basic text evaluation
            }
        }

        earnedScore += score;
        evaluatedAnswers.push({
            question: question._id,
            answer: candidateAnswer,
            isCorrect,
            score
        });
    }

    attempt.answers = evaluatedAnswers;
    attempt.score = earnedScore;
    attempt.completedAt = now;
    attempt.duration = durationSecs;

    // AI Ranking Logic (Mocked logic combining score + time)
    const scorePercentage = (earnedScore / attempt.maxScore) * 100;
    let aiRanking = "Average Fit";
    if (scorePercentage >= 90) aiRanking = "Highly Recommended";
    else if (scorePercentage >= 70) aiRanking = "Recommended";
    else if (scorePercentage < 40) aiRanking = "Weak Match";

    attempt.aiEvaluation = `Candidate scored ${scorePercentage.toFixed(1)}%. Ranked as ${aiRanking}.`;

    await attempt.save();

    // Now CREATE the Application!
    const userResume = await Resume.findOne({ userId });
    
    // Simulate ATS Score combining assessment and basic random match
    const finalAtsScore = Math.min(100, Math.floor(scorePercentage * 0.7 + Math.random() * 30));
    
    // Calculate time efficiency (100% means very fast)
    const timeEfficiency = Math.max(0, 100 - (durationSecs / limitSecs * 100));

    const application = await Application.create({
        job: job._id,
        applicant: userId,
        status: "applied",
        resumeId: userResume ? userResume._id : null,
        atsScore: finalAtsScore,
        assessmentAttempt: attempt._id,
        assessmentScore: earnedScore,
        aiRanking,
        aiEvaluationSummary: attempt.aiEvaluation,
        timeEfficiency: Math.floor(timeEfficiency)
    });

    // Add to job
    job.applications = [...new Set([...(job.applications || []), application._id])];
    await job.save();

    return sendSuccess(res, 200, { application, attempt }, "Assessment submitted and application created successfully");
});

// Admin Question Management
export const createQuestion = asyncHandler(async (req, res) => {
    const { role, question, type, options, correctAnswer, points, difficulty, skill } = req.body;
    
    const newQ = await Question.create({
        role, question, type, options, correctAnswer, points, difficulty, skill
    });

    return sendSuccess(res, 201, { question: newQ }, "Question created");
});

export const getQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, { questions }, "Questions fetched");
});

export const deleteQuestion = asyncHandler(async (req, res) => {
    await Question.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, null, "Question deleted");
});
