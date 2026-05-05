import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import GlassCard from './common/GlassCard';
import { Brain, Zap, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const ResumeAnalysisCard = ({ data, isLoading, refetch }) => {
    const reanalyzeMutation = useMutation({
        mutationFn: () => apiClient.post('/api/resume/parse'), // Assume backend endpoint
        onSuccess: () => {
            toast.success('Resume re-analyzed!');
            refetch();
        },
        onError: (error) => toast.error('Re-analysis failed'),
    });

    if (isLoading) {
        return (
            <GlassCard className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-12 w-20 rounded-2xl" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </GlassCard>
        );
    }

    if (!data || !data.finalScore) {
        return (
            <GlassCard className="text-center py-12">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Resume Analysis</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Upload your resume to get AI-powered insights and ATS scoring.
                </p>
                <Button className="btn-neon-outline" onClick={() => refetch()}>
                    Refresh
                </Button>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="space-y-6 hover:shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl">
                        <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h3 className="font-display font-semibold text-xl text-foreground">Resume Analysis</h3>
                        <p className="text-sm text-muted-foreground">AI-powered ATS insights</p>
                    </div>
                </div>
                <Badge variant="secondary" className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30 text-green-400">
                    <Zap className="w-3 h-3 mr-1" /> AI Powered
                </Badge>
            </div>

            {/* Score */}
            <div className="text-center p-6 bg-gradient-to-b from-surface/50 to-transparent rounded-2xl border border-border/50">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                        {data.finalScore}
                    </span>
                    <span className="text-xl text-muted-foreground">/100</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center">
                    <span>Rule: {data.ruleScore}</span>
                    <span>•</span>
                    <span>AI: {data.aiScore}</span>
                </div>
                <div className="w-full h-2 bg-surface-elevated rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${data.finalScore}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                    <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Strengths ({data.strengths?.length || 0})
                    </h4>
                    <ul className="space-y-2 text-sm">
                        {data.strengths?.slice(0, 5).map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-foreground">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                                {strength}
                            </li>
                        )) || <p className="text-muted-foreground italic">No strengths identified</p>}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div>
                    <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Weaknesses ({data.weaknesses?.length || 0})
                    </h4>
                    <ul className="space-y-2 text-sm">
                        {data.weaknesses?.slice(0, 5).map((weakness, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-foreground/90">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                                {weakness}
                            </li>
                        )) || <p className="text-muted-foreground italic">No weaknesses identified</p>}
                    </ul>
                </div>
            </div>

            {/* Suggestions */}
            {data.suggestions?.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Actionable Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.suggestions.slice(0, 5).map((suggestion, idx) => (
                            <Badge 
                                key={idx} 
                                className="bg-gradient-to-r from-yellow-500/20 hover:from-yellow-500/30 to-orange-500/20 hover:to-orange-500/30 border-yellow-500/30 text-yellow-200 hover:text-yellow-100 transition-all cursor-pointer px-3 py-1.5 text-xs font-medium"
                                onClick={() => navigator.clipboard.writeText(suggestion).then(() => toast.success('Copied!'))}
                            >
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                <Button className="flex-1 btn-neon-outline" onClick={() => reanalyzeMutation.mutate()}>
                    Re-analyze Resume
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-[#0a0a0a]">
                    Apply Now
                </Button>
            </div>
        </GlassCard>
    );
};

export default ResumeAnalysisCard;
