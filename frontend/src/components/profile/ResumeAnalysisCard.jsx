import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { aiService } from '../../services/ai.service';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Key, Target, FileSearch, Sparkles, BrainCircuit } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useSelector } from 'react-redux';

const CircularProgress = ({ value, label, size = 120, strokeWidth = 8, color = "#00ff88" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center group" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-white/5"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground font-display drop-shadow-md">
                    {value}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 group-hover:text-foreground transition-colors">{label}</span>
            </div>
        </div>
    );
};

const MetricCard = ({ icon: Icon, value, label, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 hover:border-white/10 transition-all relative overflow-hidden group h-full"
    >
        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-${color}`} />
        <Icon className={`w-6 h-6 mb-3 text-${color}`} />
        <span className="text-3xl font-bold text-foreground font-display drop-shadow-sm">{value}%</span>
        <span className="text-xs text-muted-foreground text-center mt-1 uppercase tracking-wider">{label}</span>
    </motion.div>
);

const ResumeAnalysisCard = () => {
    const { user } = useSelector(store => store.auth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!user?.profile?.resume) {
                setLoading(false);
                return;
            }
            try {
                const res = await aiService.getResumeAnalysis();
                if (res.success && res.analysis) {
                    setData({
                        score: res.analysis.atsScore || 0,
                        atsScore: res.analysis.atsScore || 0,
                        strengths: res.analysis.strengths || [],
                        weaknesses: res.analysis.weaknesses || [],
                        improvements: res.analysis.recommendations || [],
                        predictedRole: res.analysis.predictedRole || "Not specified",
                        matchedSkills: res.analysis.skills || []
                    });
                } else {
                    setError("No deterministic resume analysis found. Please trigger an analysis first.");
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setError("No deterministic resume analysis found. Please trigger an analysis first.");
                } else {
                    setError(err.message || "Something went wrong while analyzing the resume.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [user?.profile?.resume]);

    if (loading) {
        return (
            <GlassCard className="animate-pulse space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-white/10" />
                    <div className="h-6 bg-white/10 rounded w-1/3"></div>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="h-[140px] w-[140px] bg-white/10 rounded-full mx-auto md:mx-0 shrink-0"></div>
                    <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <div className="h-32 bg-white/10 rounded-2xl border border-white/5"></div>
                        <div className="h-32 bg-white/10 rounded-2xl border border-white/5"></div>
                    </div>
                </div>
                <div className="h-40 bg-white/10 rounded-2xl mt-6"></div>
            </GlassCard>
        );
    }

    if (!user?.profile?.resume) {
        return (
            <GlassCard className="text-center py-16 flex flex-col items-center justify-center h-full border-dashed border-white/10 bg-white/[0.02]">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 border border-accent/20 relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-accent/20 animate-pulse" />
                    <FileSearch className="w-10 h-10 text-accent relative z-10" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground">AI Resume Analysis</h3>
                <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
                    Upload your resume in the profile card to unlock deep AI insights, ATS scoring, and optimization recommendations.
                </p>
            </GlassCard>
        );
    }

    if (error) {
        return (
            <GlassCard className="border-red-500/30 bg-red-500/5 py-16 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-5" />
                <h3 className="text-xl font-display font-bold text-red-200">Analysis Failed</h3>
                <p className="text-sm text-red-400/80 mt-2 max-w-sm mx-auto">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-xl text-sm font-medium transition-colors border border-red-500/30"
                >
                    Try Again
                </button>
            </GlassCard>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <GlassCard className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff88] via-cyan-400 to-purple-500" />
                <div className="absolute top-0 right-0 p-40 bg-accent/5 rounded-full blur-3xl -z-10 group-hover:bg-accent/10 transition-colors duration-700" />
                
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/30 text-accent shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-bold text-foreground">AI Resume Analysis</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Powered by Llama 3.3 Versatile</p>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center mb-10">
                    <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 rounded-full blur-2xl bg-[#00ff88]/10" />
                        <CircularProgress value={data.score || 0} label="Resume Score" size={140} color="#00ff88" strokeWidth={10} />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 gap-5 w-full h-full">
                        <MetricCard icon={Target} value={data.atsScore || 0} label="ATS Score" color="blue-400" delay={0.3} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Predicted Role & Skills */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] mb-4 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Predicted Role & Skills
                        </h4>
                        <div className="mb-4">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Role: </span>
                            <span className="text-sm font-medium text-white">{data.predictedRole || "Not specified"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Matched Skills:</span>
                            <div className="flex flex-wrap gap-2">
                                {data.matchedSkills?.length > 0 ? data.matchedSkills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-[#00ff88]/10 text-[#00ff88] rounded text-xs border border-[#00ff88]/20">{skill}</span>
                                )) : <span className="text-sm text-foreground/80">No skills matched</span>}
                            </div>
                        </div>
                    </div>

                    {/* Missing Skills / Weaknesses */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4" /> Missing / Weaknesses
                        </h4>
                        <ul className="space-y-3">
                            {data.weaknesses?.slice(0, 4).map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_5px_#fbbf24]" />
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* AI Suggestions */}
                {data.improvements?.length > 0 && (
                    <div className="bg-accent/5 p-6 rounded-2xl border border-accent/20 relative overflow-hidden group/ai">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover/ai:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-accent mb-4 uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" /> AI Improvement Suggestions
                        </h4>
                        <ul className="space-y-3 relative z-10">
                            {data.improvements.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                                    <span className="mt-1 text-accent shrink-0">→</span>
                                    <span className="leading-relaxed font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
};

export default ResumeAnalysisCard;
