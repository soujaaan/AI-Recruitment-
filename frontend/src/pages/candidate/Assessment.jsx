import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/common/LoadingScreen';

const Assessment = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // mapping of questionId -> answer string
    const [timeLeft, setTimeLeft] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    const timerRef = useRef(null);

    // Initialize or Resume Assessment
    useEffect(() => {
        const startAssessment = async () => {
            try {
                setLoading(true);
                const res = await apiClient.post(`/api/v1/assessment/start/${jobId}`);
                console.log("Assessment API response:", res.data);
                const attemptData = res.data?.data?.attempt || res.data?.attempt;
                setAttempt(attemptData);
                
                // Initialize answers state if returning
                const initialAnswers = {};
                // If we want to persist local state, we could use localStorage, but for now just empty
                setAnswers(initialAnswers);

                // Setup Timer
                const startedAt = new Date(attemptData.startedAt).getTime();
                const durationMs = attemptData.durationLimit * 60 * 1000;
                const endTime = startedAt + durationMs;

                const updateTimer = () => {
                    const now = new Date().getTime();
                    const diff = endTime - now;
                    if (diff <= 0) {
                        clearInterval(timerRef.current);
                        setTimeLeft(0);
                        handleSubmit(true); // auto submit
                    } else {
                        setTimeLeft(Math.floor(diff / 1000));
                    }
                };
                
                updateTimer();
                timerRef.current = setInterval(updateTimer, 1000);

            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load assessment. You may have already applied.");
            } finally {
                setLoading(false);
            }
        };

        startAssessment();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [jobId]);

    // Anti-cheat: Warning on tab switch
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isFinished && attempt) {
                toast.warning("Warning: Switching tabs during assessment is recorded.", {
                    duration: 5000,
                    icon: <AlertCircle className="text-amber-500" />
                });
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isFinished, attempt]);

    const handleAnswerChange = (val) => {
        const qId = attempt.questions[activeQuestionIndex].question._id;
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!attempt) return;
        
        // Confirm if not auto submit
        if (!autoSubmit && Object.keys(answers).length < attempt.questions.length) {
            const confirm = window.confirm("You have unanswered questions. Are you sure you want to submit?");
            if (!confirm) return;
        }

        try {
            setSubmitting(true);
            if (timerRef.current) clearInterval(timerRef.current);

            const payload = Object.keys(answers).map(qId => ({
                questionId: qId,
                answer: answers[qId]
            }));

            await apiClient.post(`/api/v1/assessment/submit/${attempt._id}`, { answers: payload });
            setIsFinished(true);
            toast.success("Assessment submitted successfully!");
            
            setTimeout(() => {
                navigate('/applications');
            }, 3000);

        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit assessment.");
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (loading) return <LoadingScreen label="Preparing your assessment..." />;

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-surface border border-border p-8 rounded-2xl">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Cannot Start Assessment</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => navigate(-1)} className="w-full btn-neon">Go Back</Button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-surface border border-border p-8 rounded-2xl"
                >
                    <CheckCircle2 className="w-16 h-16 text-[#00ff88] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Assessment Complete!</h2>
                    <p className="text-muted-foreground mb-6">Your answers have been submitted. The AI is evaluating your profile and application.</p>
                    <p className="text-sm text-accent animate-pulse">Redirecting to your applications...</p>
                </motion.div>
            </div>
        );
    }

    const currentQuestionObj = attempt?.questions[activeQuestionIndex];
    const currentQuestion = currentQuestionObj?.question;
    const currentAnswer = answers[currentQuestion?._id] || "";

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row font-sans">
            {/* Left Sidebar - Navigator */}
            <div className="w-full md:w-64 bg-surface border-r border-border flex flex-col h-auto md:h-screen sticky top-0">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground font-display">Assessment</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {attempt?.questions.length} Questions
                    </p>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-5 md:grid-cols-4 gap-2">
                        {attempt?.questions.map((q, idx) => {
                            const isAnswered = !!answers[q.question._id];
                            const isActive = idx === activeQuestionIndex;
                            return (
                                <button
                                    key={q.question._id}
                                    onClick={() => setActiveQuestionIndex(idx)}
                                    className={`
                                        h-10 rounded-lg text-sm font-medium transition-all
                                        ${isActive ? 'bg-accent text-[#0a0a0a]' : 
                                          isAnswered ? 'bg-accent/20 text-accent border border-accent/30' : 
                                          'bg-surface-elevated text-muted-foreground border border-border hover:border-accent/50'}
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Header with Timer */}
                <header className="h-20 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    <div className="text-sm font-medium text-muted-foreground">
                        Question {activeQuestionIndex + 1} of {attempt?.questions.length}
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${timeLeft < 300 ? 'border-red-500/50 bg-red-500/10 text-red-500' : 'border-accent/30 bg-accent/10 text-accent'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                </header>

                {/* Question Body */}
                <main className="flex-1 max-w-3xl w-full mx-auto p-8 flex flex-col justify-center">
                    <motion.div
                        key={activeQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs text-muted-foreground mb-4 uppercase tracking-wider">
                                {currentQuestion?.skill || "General"} • {currentQuestion?.difficulty}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-display text-foreground leading-relaxed">
                                {currentQuestion?.question}
                            </h1>
                        </div>

                        <div className="space-y-4">
                            {currentQuestion?.type === "mcq" && currentQuestion.options ? (
                                <div className="space-y-3">
                                    {currentQuestion.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswerChange(opt)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                currentAnswer === opt
                                                    ? 'border-accent bg-accent/10 text-accent'
                                                    : 'border-border bg-surface hover:border-accent/50 text-foreground'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    value={currentAnswer}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    placeholder="Type your answer here..."
                                    className="w-full h-48 bg-surface border border-border rounded-xl p-4 text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none"
                                />
                            )}
                        </div>
                    </motion.div>
                </main>

                {/* Footer Controls */}
                <footer className="h-24 border-t border-border bg-surface/50 backdrop-blur-md sticky bottom-0 z-10 flex items-center justify-between px-8">
                    <Button
                        variant="outline"
                        onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                        disabled={activeQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    {activeQuestionIndex === attempt?.questions.length - 1 ? (
                        <Button 
                            onClick={() => handleSubmit(false)}
                            disabled={submitting}
                            className="btn-neon"
                        >
                            {submitting ? "Submitting..." : "Submit Assessment"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setActiveQuestionIndex(Math.min(attempt.questions.length - 1, activeQuestionIndex + 1))}
                            className="bg-foreground text-background hover:bg-foreground/90"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default Assessment;
