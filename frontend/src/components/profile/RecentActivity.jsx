import React from 'react';
import { motion } from 'framer-motion';
import { Activity, FileSearch, Send, Eye, MessageSquare } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const RecentActivity = () => {
    const activities = [
        { id: 1, icon: FileSearch, color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10', title: 'Resume analyzed by AI', time: '2 hours ago' },
        { id: 2, icon: Send, color: 'text-purple-400', bg: 'bg-purple-400/10', title: 'Applied to Frontend Developer at TechCorp', time: 'Yesterday' },
        { id: 3, icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-400/10', title: 'Profile viewed by 3 recruiters', time: '2 days ago' },
        { id: 4, icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10', title: 'AI generated interview questions', time: '1 week ago' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="h-full"
        >
            <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground">Recent Activity</h3>
                </div>

                <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {activities.map((activity, index) => (
                        <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                            
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 bg-surface shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 relative">
                                <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center`}>
                                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                </div>
                            </div>
                            
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm shadow hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-foreground mb-1">{activity.title}</span>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                            </div>
                            
                        </div>
                    ))}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default RecentActivity;
