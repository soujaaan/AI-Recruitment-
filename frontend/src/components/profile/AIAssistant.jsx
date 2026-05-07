import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const AIAssistant = () => {
    const [query, setQuery] = useState('');

    const suggestions = [
        "Improve my resume",
        "Generate interview questions",
        "Recommend skills",
        "Analyze ATS score"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-full"
        >
            <GlassCard className="h-full flex flex-col relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">AI Copilot</h3>
                        <p className="text-xs text-accent">Ask me anything about your career</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-muted-foreground">
                        <p>Hi! I'm your AI career assistant. How can I help you today?</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setQuery(suggestion)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-accent/50 hover:text-accent transition-colors flex items-center gap-1.5 text-muted-foreground"
                            >
                                <Sparkles className="w-3 h-3 text-accent" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-6 relative z-10">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Ask AI anything..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-surface-elevated border border-white/10 rounded-full py-3 px-5 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all pr-12"
                        />
                        <button className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-accent text-[#0a0a0a] hover:scale-105 transition-transform">
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default AIAssistant;
