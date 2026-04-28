import { apiClient, getApiErrorMessage } from "@/lib/api";

const unwrap = (response) => response.data;

export const aiService = {
    async analyzeResume(resumeText) {
        try {
            const response = await apiClient.post("/ai/analyze-resume", { resumeText });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async matchJob(candidateProfile, jobDescription) {
        try {
            const response = await apiClient.post("/ai/match-job", { candidateProfile, jobDescription });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async generateInterviewQuestions(role) {
        try {
            const response = await apiClient.post("/ai/interview-questions", { role });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
    async evaluateAnswers(answers) {
        try {
            const response = await apiClient.post("/ai/evaluate-answers", { answers });
            return unwrap(response);
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
