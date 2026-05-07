import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const aiService = {
    async getResumeAnalysis() {
        try {
            const response = await apiClient.get("/api/ai/resume-analysis");
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async analyzeResume(resumeText) {
        try {
            const response = await apiClient.post("/api/ai/analyze-resume", { resumeText });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async matchJob(candidateProfile, jobDescription) {
        try {
            const response = await apiClient.post("/api/ai/match-job", { candidateProfile, jobDescription });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async generateInterviewQuestions(role) {
        try {
            const response = await apiClient.post("/api/ai/interview-questions", { role });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async evaluateAnswers(answers) {
        try {
            const response = await apiClient.post("/api/ai/evaluate-answers", { answers });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
