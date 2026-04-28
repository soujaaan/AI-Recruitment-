import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { aiService } from "@/services/ai.service";
import { setAIError, setAILoading, setAIResponse } from "@/redux/aiSlice";

const updateAIState = (dispatch, key, value) => {
    dispatch(setAIResponse({ key, value }));
};

export const useAnalyzeResumeMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (resumeText) => aiService.analyzeResume(resumeText),
        onMutate: () => dispatch(setAILoading(true)),
        onSuccess: (data) => updateAIState(dispatch, "resumeAnalysis", data?.data || data),
        onError: (error) => dispatch(setAIError(error.message)),
        onSettled: () => dispatch(setAILoading(false)),
    });
};

export const useMatchJobMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: ({ candidateProfile, jobDescription }) => aiService.matchJob(candidateProfile, jobDescription),
        onMutate: () => dispatch(setAILoading(true)),
        onSuccess: (data) => updateAIState(dispatch, "jobMatch", data?.data || data),
        onError: (error) => dispatch(setAIError(error.message)),
        onSettled: () => dispatch(setAILoading(false)),
    });
};

export const useInterviewQuestionsMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (role) => aiService.generateInterviewQuestions(role),
        onMutate: () => dispatch(setAILoading(true)),
        onSuccess: (data) => updateAIState(dispatch, "interviewQuestions", data?.data?.questions || data?.questions || []),
        onError: (error) => dispatch(setAIError(error.message)),
        onSettled: () => dispatch(setAILoading(false)),
    });
};

export const useEvaluateAnswersMutation = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (answers) => aiService.evaluateAnswers(answers),
        onMutate: () => dispatch(setAILoading(true)),
        onSuccess: (data) => updateAIState(dispatch, "answerFeedback", data?.data || data),
        onError: (error) => dispatch(setAIError(error.message)),
        onSettled: () => dispatch(setAILoading(false)),
    });
};
