import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import GlassCard from "../common/GlassCard";
import { Sparkles, Lightbulb } from "lucide-react";

const AIInterviewPanel = ({ questions = [], onGenerate, loading = false }) => {
    return (
        <GlassCard glow>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Interview prep</p>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold font-display text-foreground">AI Interview Questions</h3>
                            <Badge variant="green" className="hidden sm:inline-flex">AI</Badge>
                        </div>
                    </div>
                </div>
                <Button onClick={onGenerate} disabled={loading} className="btn-neon-outline">
                    {loading ? "Generating..." : "Generate"}
                </Button>
            </div>

            <div className="mt-6 space-y-3">
                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
                        <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Generate role-specific interview questions to coach candidates better.</p>
                    </div>
                ) : (
                    questions.map((question, index) => (
                        <div
                            key={`${question.question}-${index}`}
                            className="rounded-xl border border-border bg-surface-elevated p-5 hover:border-accent/20 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-foreground">{question.question}</p>
                                <Badge variant="outline">{question.difficulty || "medium"}</Badge>
                            </div>
                            {question.idealAnswerPoints?.length ? (
                                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    {question.idealAnswerPoints.map((point) => <li key={point}>{point}</li>)}
                                </ul>
                            ) : null}
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
};

export default AIInterviewPanel;

