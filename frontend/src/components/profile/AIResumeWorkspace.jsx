import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../redux/resumeSlice';
import { Link } from 'react-router-dom';
import GlassCard from '../common/GlassCard';
import { Sparkles, Briefcase, Code, FolderGit2, GraduationCap, ChevronRight, CheckCircle2, FileText } from 'lucide-react';

const AIResumeWorkspace = () => {
    const dispatch = useDispatch();
    const { profile, loading } = useSelector(state => state.resume);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Determine if profile is empty
    const hasProfileData = profile && (
        profile?.summary || 
        (profile?.skills && profile.skills.length > 0) || 
        (profile?.experience && profile.experience.length > 0) ||
        (profile?.projects && profile.projects.length > 0) ||
        (profile?.education && (profile.education?.graduation?.college || profile.education?.postGraduation?.college))
    );

    if (loading && !profile) {
        return (
            <GlassCard className="p-8 text-center animate-pulse h-64 flex flex-col justify-center items-center">
                <div className="w-10 h-10 rounded-full bg-[#00ff88]/20 animate-spin border-t-2 border-[#00ff88] mb-4"></div>
                <p className="text-muted-foreground">Syncing AI Workspace...</p>
            </GlassCard>
        );
    }

    if (!hasProfileData) {
        return (
            <GlassCard className="p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group border-dashed border-white/20">
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mb-6 border border-[#00ff88]/20 relative">
                    <Sparkles className="w-8 h-8 text-[#00ff88] relative z-10" />
                    <div className="absolute inset-0 bg-[#00ff88]/20 blur-xl rounded-full" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-3">AI Resume Workspace</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Build your professional profile to unlock AI-powered resume insights, ATS scoring, and recruiter matching.
                </p>
                <Link 
                    to="/profile/build-resume"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 hover:from-[#00ff88]/30 hover:to-[#00ff88]/20 text-[#00ff88] px-8 py-3.5 rounded-xl font-medium transition-all duration-300 border border-[#00ff88]/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                >
                    Build Resume <ChevronRight className="w-4 h-4" />
                </Link>
            </GlassCard>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <GlassCard className="relative overflow-hidden group">
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff88] via-cyan-400 to-purple-500" />
                
                {/* Workspace Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                    <div className="absolute top-0 right-0 p-32 bg-[#00ff88]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                                AI Resume Workspace
                                <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Structured Professional Identity</p>
                        </div>
                    </div>
                    <Link 
                        to="/profile/build-resume"
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
                    >
                        Edit Profile
                    </Link>
                </div>

                <div className="p-6 md:p-8 space-y-10">
                    {/* Summary Section */}
                    {profile.summary && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] uppercase tracking-wider mb-3">
                                <FileText className="w-4 h-4" /> Professional Summary
                            </h4>
                            <p className="text-foreground/90 text-sm leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                                {profile.summary}
                            </p>
                        </div>
                    )}

                    {/* Tech Stack */}
                    {profile.skills?.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] uppercase tracking-wider mb-3">
                                <Code className="w-4 h-4" /> Tech Stack
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-[#00ff88]/10 text-[#00ff88] rounded-lg text-sm border border-[#00ff88]/20 font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {profile.experience?.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] uppercase tracking-wider mb-4">
                                <Briefcase className="w-4 h-4" /> Experience
                            </h4>
                            <div className="space-y-4">
                                {(profile?.experience || []).map((exp, i) => (
                                    <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-white/10 last:before:bottom-auto last:before:h-full">
                                        <div className="absolute left-[-4px] top-2.5 w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                                        <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                                                <div>
                                                    <h5 className="text-foreground font-semibold text-lg">{exp.title}</h5>
                                                    <span className="text-muted-foreground text-sm">{exp.company} {exp.location && `• ${exp.location}`}</span>
                                                </div>
                                                <div className="text-sm text-muted-foreground font-medium bg-white/5 px-3 py-1 rounded-full w-fit">
                                                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                                </div>
                                            </div>
                                            
                                            {exp.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                                                    {exp.skills.map((s, idx) => (
                                                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-md text-foreground/80">{s}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {exp.responsibilities && (
                                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mt-2">
                                                    {exp.responsibilities}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {profile.projects?.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] uppercase tracking-wider mb-4">
                                <FolderGit2 className="w-4 h-4" /> Projects
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(profile?.projects || []).map((proj, i) => (
                                    <div key={i} className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col h-full">
                                        <h5 className="text-foreground font-semibold mb-1 flex items-center justify-between">
                                            {proj.title}
                                            {proj.duration && <span className="text-xs text-muted-foreground font-normal bg-white/5 px-2 py-0.5 rounded">{proj.duration}</span>}
                                        </h5>
                                        
                                        <div className="flex gap-3 mb-3 text-sm">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-[#00ff88] hover:underline">GitHub</a>}
                                            {proj.live && <a href={proj.live} target="_blank" rel="noreferrer" className="text-[#00ff88] hover:underline">Live Demo</a>}
                                        </div>

                                        {proj.description && (
                                            <p className="text-sm text-foreground/80 leading-relaxed mb-4 flex-grow whitespace-pre-wrap">
                                                {proj.description}
                                            </p>
                                        )}

                                        {proj.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-white/5">
                                                {proj.skills.map((s, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-foreground/80">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {(profile.education?.graduation?.college || profile.education?.postGraduation?.college || profile.education?.higherSecondary?.school || profile.education?.secondary?.school) && (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[#00ff88] uppercase tracking-wider mb-4">
                                <GraduationCap className="w-4 h-4" /> Education
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    profile.education?.postGraduation?.college && { ...profile.education.postGraduation, level: 'Post Graduation' },
                                    profile.education?.graduation?.college && { ...profile.education.graduation, level: 'Graduation' },
                                    profile.education?.higherSecondary?.school && { ...profile.education.higherSecondary, title: profile.education.higherSecondary.school, subtitle: `${profile.education.higherSecondary.stream} • ${profile.education.higherSecondary.board}`, year: profile.education.higherSecondary.passingYear, score: profile.education.higherSecondary.score, level: 'Higher Secondary (12th)' },
                                    profile.education?.secondary?.school && { ...profile.education.secondary, title: profile.education.secondary.school, subtitle: profile.education.secondary.board, year: profile.education.secondary.passingYear, score: profile.education.secondary.score, level: 'Secondary (10th)' },
                                ].filter(Boolean).map((edu, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <div>
                                            <h5 className="text-foreground font-medium text-sm">
                                                {edu.degree ? `${edu.degree} in ${edu.specialization}` : edu.title}
                                            </h5>
                                            <span className="text-muted-foreground text-xs">
                                                {edu.college ? `${edu.college}, ${edu.university}` : edu.subtitle}
                                            </span>
                                            <div className="mt-1 text-[10px] font-semibold text-[#00ff88] uppercase tracking-wider">{edu.level}</div>
                                        </div>
                                        <div className="mt-2 sm:mt-0 text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                                            <span className="text-sm font-medium text-foreground bg-white/5 px-2 py-0.5 rounded">
                                                {edu.startYear ? `${edu.startYear} - ${edu.endYear}` : `Class of ${edu.year}`}
                                            </span>
                                            {(edu.cgpa || edu.score) && (
                                                <span className="text-xs text-muted-foreground sm:mt-1">
                                                    Score: {edu.cgpa || edu.score}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default AIResumeWorkspace;
