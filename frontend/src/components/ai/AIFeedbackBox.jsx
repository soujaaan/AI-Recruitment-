import React from 'react'
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'
import GlassCard from '../common/GlassCard'

const AIFeedbackBox = ({ feedback = [] }) => {
    if (!feedback.length) return null;

    return (
        <GlassCard animate glow className="border-accent/20">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">AI Feedback</h3>
            </div>

            <div className="space-y-4">
                {feedback.map((item, index) => (
                    <div key={index} className="flex gap-3">
                        <div className="mt-0.5">
                            {item.type === 'strength' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : item.type === 'weakness' ? (
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Lightbulb className="w-4 h-4 text-accent" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-foreground font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    )
}

export default AIFeedbackBox

