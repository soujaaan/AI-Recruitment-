import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Calendar, Download, FileText, Check, X, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/shared/Navbar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import useChatStore from "@/store/chatStore";
import MatchSkillsDisplay from "@/components/recruitment/MatchSkillsDisplay";
import ScheduleInterviewDialog from "@/components/recruitment/ScheduleInterviewDialog";

const CandidateProfile = () => {
    const { candidateId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const activeJobId = location.state?.jobId;
    const applicationId = location.state?.applicationId;



    
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [startingChat, setStartingChat] = useState(false);
    const [generatingQuestions, setGeneratingQuestions] = useState(false);
    const [interviewQuestions, setInterviewQuestions] = useState([]);
    const [showQuestions, setShowQuestions] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const res = await apiClient.get(`/api/candidates/${candidateId}`);
                if (res.data?.success) {
                    setCandidate(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch candidate:", err);
                setError(err.response?.data?.message || "Failed to load candidate profile. They may not have applied to your jobs.");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [candidateId]);

    const handleStartChat = async () => {
        if (!candidate || startingChat) return;
        setStartingChat(true);
        
        // Find if we have a related job
        const relevantApp = candidate?.applications?.find(app => app._id === candidate?.recruiterAnalytics?.relevantApplicationId) || candidate?.applications?.[0];
        const resolvedJobId = activeJobId || relevantApp?.jobId || relevantApp?.job?._id;


        console.log("Candidate:", candidate);
        console.log("Job ID:", resolvedJobId);



        try {
            const res = await apiClient.post("/api/chat/start", {
                candidateId: candidate.basicInfo._id,
                jobId: resolvedJobId
            });
            
            if (res.data?.success) {
                const { roomId, room } = res.data.data;
                useChatStore.getState().upsertRoom(room);
                useChatStore.getState().setActiveRoomId(roomId);
                toast.success("Conversation started");
                navigate(`/messages?room=${roomId}`);
            }
        } catch (error) {
            console.error("Chat initiation error:", error);
            const errMsg = error.response?.data?.message || "Failed to start chat. Ensure candidate has an active application to your job.";
            toast.error(errMsg);
        } finally {
            setStartingChat(false);
        }
    };

    const handleGenerateInterviewQuestions = async () => {
        const jobId = activeJobId || candidate?.recruiterAnalytics?.relevantJobId;
        if (!jobId) {
            toast.error("No job context found. Open this profile from a job's applicants list.");
            return;
        }

        setGeneratingQuestions(true);
        try {
            const res = await apiClient.post("/api/ai/interview-questions/generate", {
                jobId,
                candidateId,
                interviewStyle: "mixed",
                storeLog: true,
            });
            if (res.data?.success) {
                setInterviewQuestions(res.data.questions || []);
                setShowQuestions(true);
                toast.success(`Generated ${res.data.questions?.length || 0} interview questions`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate interview questions");
        } finally {
            setGeneratingQuestions(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!candidate?.recruiterAnalytics?.relevantApplicationId) {
            toast.error("No active application found to update.");
            return;
        }
        
        setUpdatingStatus(true);
        try {
            await apiClient.post(`/api/v1/application/status/${candidate.recruiterAnalytics.relevantApplicationId}/update`, { status: newStatus });
            
            // Optimistic update
            setCandidate(prev => ({
                ...prev,
                applications: prev.applications.map(app => 
                    app._id === prev.recruiterAnalytics.relevantApplicationId ? { ...app, status: newStatus } : app
                )
            }));
            
            toast.success(`Candidate marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDownloadResume = () => {
        const resumeUrl =
            candidate?.recruiterAnalytics?.resumeUrl ||
            candidate?.detailedProfile?.resumePdfUrl ||
            candidate?.basicInfo?.resume;
        if (!resumeUrl) {
            toast.error("No resume available");
            return;
        }
        const link = document.createElement("a");
        link.href = resumeUrl;
        link.download = `${candidate?.basicInfo?.fullname || "Candidate"}_Resume.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const refreshCandidate = async () => {
        const res = await apiClient.get(`/api/candidates/${candidateId}`);
        if (res.data?.success) setCandidate(res.data.data);
    };

    if (loading) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen text-foreground">
                <Navbar />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-accent/20 rounded-full"></div>
                        <p className="text-muted-foreground text-sm">Loading Candidate Profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen text-foreground">
                <Navbar />
                <div className="flex justify-center items-center h-[70vh]">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold">Access Denied</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    const basic = candidate.basicInfo;
    const detailed = candidate.detailedProfile || {};
    const analytics = candidate.recruiterAnalytics;
    const analysis = candidate.resumeAnalysis;
    const relevantApp = candidate.applications?.find(app => app._id === analytics?.relevantApplicationId) || candidate.applications?.[0];

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-foreground pb-20">
            <Navbar />
            
            <div className="max-w-6xl mx-auto px-6 pt-10">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(-1)} 
                    className="mb-6 -ml-4 text-muted-foreground hover:text-accent hover:bg-accent/10"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                {/* Header Card */}
                <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden">
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <Avatar className="w-24 h-24 border-2 border-border">
                        <AvatarImage src={basic.profilePhoto} />
                        <AvatarFallback className="text-3xl">{basic.fullname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-foreground">
                                    {basic.fullname}
                                </h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    {detailed.summary || basic.bio || "Candidate Profile"}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                                    {basic.location && <span>📍 {basic.location}</span>}
                                    {basic.email && <span>📧 {basic.email}</span>}
                                    {basic.phoneNumber && <span>📱 {basic.phoneNumber}</span>}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button className="btn-neon gap-2 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]" onClick={handleStartChat} disabled={startingChat}>
                                    {startingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />} Message
                                </Button>
                                <Button variant="outline" className="gap-2" onClick={handleDownloadResume}>
                                    <Download className="w-4 h-4" /> Resume
                                </Button>
                                
                                {relevantApp && relevantApp.status !== 'shortlisted' && (
                                    <Button 
                                        variant="outline" 
                                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 gap-2"
                                        onClick={() => handleUpdateStatus('shortlisted')}
                                        disabled={updatingStatus}
                                    >
                                        <Check className="w-4 h-4" /> Shortlist
                                    </Button>
                                )}
                                
                                {relevantApp && relevantApp.status !== 'rejected' && (
                                    <Button 
                                        variant="outline" 
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2"
                                        onClick={() => handleUpdateStatus('rejected')}
                                        disabled={updatingStatus}
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </Button>
                                )}
                                
                                {(activeJobId || analytics?.relevantJobId) && (
                                    <ScheduleInterviewDialog
                                        candidateId={candidateId}
                                        jobId={activeJobId || analytics.relevantJobId}
                                        applicationId={applicationId || analytics.relevantApplicationId}
                                        candidateName={basic.fullname}
                                        onScheduled={refreshCandidate}
                                        trigger={
                                            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2">
                                                <Calendar className="w-4 h-4" /> Schedule Interview
                                            </Button>
                                        }
                                    />
                                )}
                                <Button
                                    variant="outline"
                                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2"
                                    onClick={handleGenerateInterviewQuestions}
                                    disabled={generatingQuestions}
                                >
                                    {generatingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Generate Interview Questions
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Skills Section */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                Top Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(detailed.skills?.length > 0 ? detailed.skills : basic.skills)?.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 text-sm rounded-lg bg-accent/10 text-accent border border-accent/20">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience Section */}
                        {detailed.experience?.length > 0 && (
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-6">Experience Timeline</h3>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                    {detailed.experience.map((exp, idx) => (
                                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-accent">
                                                <div className="w-3 h-3 bg-accent rounded-full"></div>
                                            </div>
                                            
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-foreground">{exp.title}</h4>
                                                    <span className="text-xs text-muted-foreground">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                                                </div>
                                                <p className="text-sm font-medium text-accent mb-2">{exp.company}</p>
                                                <p className="text-sm text-muted-foreground">{exp.responsibilities}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education Section */}
                        {(detailed.education?.graduation || detailed.education?.postGraduation) && (
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Education</h3>
                                <div className="space-y-4">
                                    {[detailed.education.postGraduation, detailed.education.graduation].filter(Boolean).map((edu, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="font-bold">{edu.degree} {edu.specialization && `in ${edu.specialization}`}</h4>
                                            <p className="text-accent text-sm mt-1">{edu.college || edu.university}</p>
                                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                                <span>{edu.startYear} - {edu.endYear}</span>
                                                <span>Score: {edu.cgpa}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects Section */}
                        {detailed.projects?.length > 0 && (
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Notable Projects</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {detailed.projects.map((proj, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col h-full">
                                            <h4 className="font-bold text-foreground">{proj.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-2 flex-1">{proj.description}</p>
                                            
                                            {proj.skills && (
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {proj.skills.map((s, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">{s}</span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {(proj.github || proj.live) && (
                                                <div className="flex gap-3 mt-4 pt-4 border-t border-white/10 text-sm">
                                                    {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> GitHub</a>}
                                                    {proj.live && <a href={proj.live} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Live Demo</a>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>

                    {/* Right Column: AI Analytics & ATS Info */}
                    <div className="space-y-8">
                        
                        {/* AI Summary Card */}
                        <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Recruiter Intelligence</h3>

                            <div className="grid grid-cols-2 gap-4 my-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">ATS Score</span>
                                    <p className={`text-2xl font-bold ${analytics.atsPercentage >= 75 ? 'text-[#00ff88]' : analytics.atsPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {analytics.atsPercentage ?? 0}%
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">Match Score</span>
                                    <p className={`text-2xl font-bold ${analytics.matchPercentage >= 75 ? 'text-[#00ff88]' : analytics.matchPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {analytics.matchPercentage ?? 0}%
                                    </p>
                                </div>
                            </div>

                            <MatchSkillsDisplay
                                matchScore={analytics.matchPercentage}
                                matchedSkills={analytics.matchedSkills}
                                missingSkills={analytics.missingSkills}
                                compact
                            />

                            <div className="space-y-4 mt-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Ranking Category</span>
                                    <Badge variant={analytics.matchPercentage >= 75 ? 'default' : 'outline'} className={analytics.matchPercentage >= 75 ? 'bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/20 border-none' : ''}>
                                        {analytics.aiRanking}
                                    </Badge>
                                </div>

                                {analysis?.strengths?.length > 0 && (
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Key Strengths</span>
                                        <ul className="text-sm space-y-1">
                                            {analysis.strengths.slice(0, 3).map((s, i) => (
                                                <li key={i} className="flex gap-2"><Check className="w-4 h-4 text-green-500 shrink-0"/> {s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis?.weaknesses?.length > 0 && (
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Potential Concerns</span>
                                        <ul className="text-sm space-y-1">
                                            {analysis.weaknesses.slice(0, 3).map((w, i) => (
                                                <li key={i} className="flex gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0"/> {w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Interview Questions */}
                        {(showQuestions && interviewQuestions.length > 0) && (
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    AI Interview Questions
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {interviewQuestions.map((q, idx) => (
                                        <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[10px] capitalize">{q.type}</Badge>
                                                {q.category && <span className="text-[10px] text-muted-foreground">{q.category}</span>}
                                            </div>
                                            <p className="text-sm">{q.question}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Previous Interview Question Logs */}
                        {candidate.interviewLogs?.length > 0 && !showQuestions && (
                            <div className="bg-surface border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Previous Interview Prep</h3>
                                <div className="space-y-3">
                                    {candidate.interviewLogs.slice(0, 3).map((log, idx) => (
                                        <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-medium">{log.jobTitle || "Interview"}</h4>
                                                <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{log.questions?.length || 0} questions generated</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div className="bg-surface border border-border rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4">Links</h3>
                            <div className="space-y-2">
                                {basic.linkedin && (
                                    <a href={basic.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                                        <span className="text-sm font-medium">LinkedIn Profile</span>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                                    </a>
                                )}
                                {basic.github && (
                                    <a href={basic.github} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                                        <span className="text-sm font-medium">GitHub Profile</span>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                                    </a>
                                )}
                                {detailed.personalInfo?.portfolio && (
                                    <a href={detailed.personalInfo.portfolio} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                                        <span className="text-sm font-medium">Personal Portfolio</span>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                                    </a>
                                )}
                                {!basic.linkedin && !basic.github && !detailed.personalInfo?.portfolio && (
                                    <div className="text-sm text-muted-foreground text-center py-2">No links provided</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfile;
