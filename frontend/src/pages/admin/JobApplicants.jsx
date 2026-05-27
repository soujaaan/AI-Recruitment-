import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, X, FileText, Download, User, ArrowLeft, MessageSquare, ChevronDown, ChevronUp, Clock, Trophy, Calendar, Sparkles, Briefcase, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import SectionHeader from '@/components/common/SectionHeader';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import EmptyState from '@/components/common/EmptyState';
import useChatStore from '@/store/chatStore';
import MatchSkillsDisplay from '@/components/recruitment/MatchSkillsDisplay';
import ScheduleInterviewDialog from '@/components/recruitment/ScheduleInterviewDialog';
import { isValidMongoId, toMongoIdString } from '@/utils/mongoId';

const JobApplicants = () => {
    const { id: rawJobId } = useParams();
    const jobId = toMongoIdString(rawJobId);
    const navigate = useNavigate();
    
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("match");
    const [skillFilter, setSkillFilter] = useState("");
    const [minMatchScore, setMinMatchScore] = useState("");
    const [minAtsScore, setMinAtsScore] = useState("");
    const [expandedCardIds, setExpandedCardIds] = useState({});
    const toggleExpand = (appId) => {
        setExpandedCardIds(prev => ({ ...prev, [appId]: !prev[appId] }));
    };

    const fetchApplicants = useCallback(async () => {
        if (!isValidMongoId(jobId)) {
            setError("Invalid job ID in URL. Open applicants from your jobs list.");
            setApplications([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = { sortBy };
            if (skillFilter.trim()) params.skill = skillFilter.trim();
            if (minMatchScore !== "") params.minMatchScore = minMatchScore;
            if (minAtsScore !== "") params.minAtsScore = minAtsScore;

            const response = await apiClient.get(`/api/applications/job/${jobId}`, { params });
            const apps = response.data?.data || response.data;
            setApplications(Array.isArray(apps) ? apps : []);
            if (apps?.length > 0) {
                setJob(apps[0].job);
            }
        } catch (err) {
            console.error("Failed to fetch applicants:", err);
            setError(err?.response?.data?.message || "Failed to load applicants");
        } finally {
            setLoading(false);
        }
    }, [jobId, sortBy, skillFilter, minMatchScore, minAtsScore]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await apiClient.post(`/api/v1/application/status/${applicationId}/update`, { status: newStatus });
            setApplications(prev => prev.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));
            toast.success(`Application marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleStartChat = async (candidateId) => {
        if (!job) return;
        try {
            const recruiterId = job.created_by || job.recruiterId; // Handle both schemas
            const res = await apiClient.post("/api/chat/create-room", {
                candidateId,
                recruiterId: recruiterId,
                jobId: job._id
            });
            if (res.data?.success) {
                const room = res.data.data;
                useChatStore.getState().upsertRoom(room);
                useChatStore.getState().setActiveRoomId(room._id);
                navigate("/messages");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start chat");
        }
    };

    const getResumeUrl = (app) =>
        app.resumeUrl ||
        app.candidateProfile?.resumePdfUrl ||
        app.applicant?.profile?.resume ||
        "";

    const handleViewResume = (app) => {
        const resumeUrl = getResumeUrl(app);
        if (!resumeUrl) {
            toast.error("No resume available");
            return;
        }
        window.open(resumeUrl, "_blank");
    };

    const handleDownloadResume = (app, candidateName) => {
        const resumeUrl = getResumeUrl(app);
        if (!resumeUrl) {
            toast.error("No resume available");
            return;
        }
        const link = document.createElement("a");
        link.href = resumeUrl;
        link.download = `${candidateName || "Candidate"}_Resume.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'shortlisted': return 'green';
            case 'rejected': return 'destructive';
            case 'interview': return 'purple';
            case 'hired': return 'green';
            case 'applied':
            default: return 'outline';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'applied': return 'Applied';
            case 'shortlisted': return 'Shortlisted';
            case 'interview': return 'Interview Scheduled';
            case 'hired': return 'Hired';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    const filteredApplications = applications
        .filter(app => {
            const nameMatch = app.applicant?.fullname?.toLowerCase().includes(searchQuery.toLowerCase());
            const emailMatch = app.applicant?.email?.toLowerCase().includes(searchQuery.toLowerCase());
            return nameMatch || emailMatch;
        })
        .filter(app => statusFilter === "all" || app.status === statusFilter)
        .sort((a, b) => {
            if (sortBy === "match") return (b.matchScore || 0) - (a.matchScore || 0);
            if (sortBy === "ats") return (b.atsScore || 0) - (a.atsScore || 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-foreground">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/admin/jobs')} 
                        className="mb-6 -ml-4 text-muted-foreground hover:text-accent hover:bg-accent/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Button>

                    <SectionHeader
                        label="01 — Applicants"
                        title={<>Manage <span className="gradient-text">Candidates</span></>}
                        subtitle={job ? `Reviewing applicants for ${job.title}` : "Review and manage applicants for this role."}
                    />

                    {/* Filters & Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-surface border-border focus:border-accent focus:ring-accent/20"
                                placeholder="Search candidates by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <Input
                                className="w-full sm:w-36 bg-surface border-border"
                                placeholder="Filter skill..."
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                            />
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                className="w-full sm:w-28 bg-surface border-border"
                                placeholder="Min match %"
                                value={minMatchScore}
                                onChange={(e) => setMinMatchScore(e.target.value)}
                            />
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                className="w-full sm:w-28 bg-surface border-border"
                                placeholder="Min ATS %"
                                value={minAtsScore}
                                onChange={(e) => setMinAtsScore(e.target.value)}
                            />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:border-accent focus:ring-accent/20 outline-none"
                            >
                                <option value="match">Highest Match Score</option>
                                <option value="ats">Highest ATS Score</option>
                                <option value="date">Most Recent</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Pipeline Stage Tabs */}
                    {(() => {
                        const countAll = applications.length;
                        const countApplied = applications.filter(a => a.status === 'applied').length;
                        const countShortlisted = applications.filter(a => a.status === 'shortlisted').length;
                        const countInterview = applications.filter(a => a.status === 'interview').length;
                        const countHired = applications.filter(a => a.status === 'hired').length;
                        const countRejected = applications.filter(a => a.status === 'rejected').length;

                        return (
                            <div className="mt-8 flex flex-wrap gap-2 border-b border-border/40 pb-3">
                                {[
                                    { id: 'all', label: 'All Candidates', count: countAll, color: 'text-muted-foreground' },
                                    { id: 'applied', label: 'Applied', count: countApplied, color: 'text-blue-400' },
                                    { id: 'shortlisted', label: 'Shortlisted', count: countShortlisted, color: 'text-emerald-400' },
                                    { id: 'interview', label: 'Interview Scheduled', count: countInterview, color: 'text-indigo-400' },
                                    { id: 'hired', label: 'Hired', count: countHired, color: 'text-accent' },
                                    { id: 'rejected', label: 'Rejected', count: countRejected, color: 'text-red-400' },
                                ].map((tab) => {
                                    const isActive = statusFilter === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setStatusFilter(tab.id)}
                                            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                                isActive
                                                    ? 'bg-surface border-accent text-accent shadow-[0_0_10px_rgba(0,255,136,0.05)]'
                                                    : 'bg-surface/30 border-border/80 text-muted-foreground hover:border-border hover:text-foreground'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-background/60 border border-border/40 ${tab.color}`}>
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Content */}
                    <div className="mt-8 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20 text-muted-foreground">
                                <div className="animate-pulse flex items-center gap-2">
                                    <div className="w-4 h-4 bg-accent/50 rounded-full" />
                                    <span>Loading applicants...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center">
                                {error}
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <EmptyState
                                title="No applicants found"
                                description="Adjust your filters or wait for more candidates to apply."
                            />
                        ) : (
                            filteredApplications.map((app, index) => {
                                const isExpanded = !!expandedCardIds[app._id];
                                const isRejected = app.status === 'rejected';
                                const isHired = app.status === 'hired';

                                const statusRingColor = 
                                    app.status === 'shortlisted' ? 'ring-2 ring-emerald-500' :
                                    app.status === 'interview' ? 'ring-2 ring-indigo-500' :
                                    app.status === 'hired' ? 'ring-2 ring-accent' :
                                    app.status === 'rejected' ? 'ring-2 ring-red-500/40' : 'ring-1 ring-border';

                                const latestRole = app.candidateProfile?.headline || app.applicant?.profile?.headline || (app.candidateProfile?.experience?.[0] ? `${app.candidateProfile.experience[0].title} at ${app.candidateProfile.experience[0].company}` : "Candidate Profile");

                                return (
                                    <motion.div
                                        key={app._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`group flex flex-col p-5 bg-surface/50 border rounded-2xl transition-all ${
                                            isRejected ? 'opacity-65 border-border/40' : 
                                            isHired ? 'border-accent/40 shadow-[0_0_15px_rgba(0,255,136,0.05)]' : 
                                            'border-border hover:border-accent/20 hover:bg-surface'
                                        }`}
                                    >
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                            {/* Zone 1: Candidate Identity */}
                                            <div 
                                                className="col-span-1 lg:col-span-4 flex items-center gap-4 cursor-pointer"
                                                onClick={() => navigate(`/candidate/${app.applicant._id}`, {
                                                    state: {
                                                        jobId: job?._id,
                                                        applicationId: app?._id,
                                                    },
                                                })}
                                            >
                                                <Avatar className={`w-14 h-14 ${statusRingColor} bg-surface-elevated`}>
                                                    <AvatarImage src={app.applicant?.profile?.profilePhoto} />
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h4 className="font-display font-semibold text-base text-foreground group-hover:text-accent transition-colors truncate">
                                                        {app.applicant?.fullname}
                                                    </h4>
                                                    <p className="text-xs text-accent mt-0.5 truncate font-medium">
                                                        {latestRole}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        <span>Applied {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" /> {app.applicant?.email}</span>
                                                        {app.applicant?.profile?.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" /> {app.applicant?.profile?.phoneNumber}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zone 2: ATS Intelligence */}
                                            <div className="col-span-1 lg:col-span-4 flex flex-col gap-1.5 border-t lg:border-t-0 lg:border-l border-border/80 pt-4 lg:pt-0 lg:pl-6 h-full justify-center">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ATS:</span>
                                                        <span className={`text-sm font-bold ${app.atsScore >= 75 ? 'text-[#00ff88]' : app.atsScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {app.atsScore || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Match:</span>
                                                        <span className={`text-sm font-bold ${app.matchScore >= 75 ? 'text-[#00ff88]' : app.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {app.matchScore ?? 0}%
                                                        </span>
                                                    </div>
                                                    {app.aiRanking && (
                                                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0.2 border-none ${
                                                            app.aiRanking === 'Highly Recommended' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                                                            app.aiRanking === 'Recommended' ? 'bg-emerald-500/5 text-emerald-400/80' :
                                                            app.aiRanking === 'Average Fit' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            {app.aiRanking}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(app._id); }} 
                                                    className="text-accent hover:text-accent hover:bg-accent/10 mt-1 flex items-center gap-1 text-xs py-1 px-2 h-7 w-fit rounded-lg border border-accent/10 hover:border-accent/30"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                                                </Button>
                                            </div>

                                            {/* Zone 3: Recruiter Actions */}
                                            <div className="col-span-1 lg:col-span-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t lg:border-t-0 border-border/80 pt-4 lg:pt-0">
                                                <Badge variant={getStatusVariant(app.status)} className="capitalize px-2.5 py-1 text-xs font-semibold mr-auto lg:mr-2">
                                                    {getStatusLabel(app.status)}
                                                </Badge>

                                                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end" onClick={(e) => e.stopPropagation()}>
                                                    {/* Utility buttons */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleStartChat(app.applicant._id)}
                                                        title="Message Candidate"
                                                        className="text-muted-foreground hover:text-accent hover:bg-accent/10 w-8 h-8 rounded-lg border border-border/60"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>

                                                    {getResumeUrl(app) && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleViewResume(app)}
                                                            title="View Resume"
                                                            className="text-muted-foreground hover:text-accent hover:bg-accent/10 w-8 h-8 rounded-lg border border-border/60"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    {/* Status Pipeline Buttons */}
                                                    {app.status === 'applied' && (
                                                        <>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                                                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium"
                                                            >
                                                                <Check className="w-3.5 h-3.5" /> Shortlist
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium"
                                                            >
                                                                <X className="w-3.5 h-3.5" /> Reject
                                                            </Button>
                                                        </>
                                                    )}

                                                    {app.status === 'shortlisted' && (
                                                        <>
                                                            <ScheduleInterviewDialog
                                                                candidateId={app.applicant._id}
                                                                jobId={job?._id}
                                                                applicationId={app._id}
                                                                candidateName={app.applicant?.fullname}
                                                                onScheduled={fetchApplicants}
                                                                trigger={
                                                                    <Button 
                                                                        size="sm"
                                                                        className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium"
                                                                    >
                                                                        <Calendar className="w-3.5 h-3.5" /> Schedule
                                                                    </Button>
                                                                }
                                                            />
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'hired')}
                                                                className="bg-accent text-black hover:bg-accent/90 text-xs py-1 h-8 px-3 rounded-lg flex items-center gap-1 font-semibold"
                                                            >
                                                                <Trophy className="w-3.5 h-3.5" /> Hire
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium"
                                                            >
                                                                <X className="w-3.5 h-3.5" /> Reject
                                                            </Button>
                                                        </>
                                                    )}

                                                    {app.status === 'interview' && (
                                                        <>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'hired')}
                                                                className="bg-accent text-black hover:bg-accent/90 text-xs py-1 h-8 px-3 rounded-lg flex items-center gap-1 font-semibold"
                                                            >
                                                                <Trophy className="w-3.5 h-3.5" /> Hire
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium"
                                                            >
                                                                <X className="w-3.5 h-3.5" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drawer Section — Collapsible details */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-foreground">
                                                {/* Expanded Column 1: Skills & AI Summary */}
                                                <div className="space-y-4">
                                                    {app.aiEvaluationSummary && (
                                                        <div>
                                                            <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                                <Sparkles className="w-3 h-3 text-accent" /> AI Insights Summary
                                                            </h5>
                                                            <p className="text-xs text-muted-foreground leading-relaxed bg-surface-elevated/40 border border-border/40 p-2.5 rounded-lg">
                                                                "{app.aiEvaluationSummary}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    <MatchSkillsDisplay
                                                        matchScore={app.matchScore}
                                                        matchedSkills={app.matchedSkills}
                                                        missingSkills={app.missingSkills}
                                                        compact
                                                    />
                                                </div>

                                                {/* Expanded Column 2: Work Experience */}
                                                <div className="border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6 space-y-4">
                                                    <div>
                                                        <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                                            <Briefcase className="w-3 h-3 text-accent" /> Work History
                                                        </h5>
                                                        {app.candidateProfile?.experience?.length > 0 ? (
                                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                                {app.candidateProfile.experience.map((exp, idx) => (
                                                                    <div key={idx} className="p-2 border border-border/40 bg-surface-elevated/30 rounded-lg text-xs">
                                                                        <div className="flex justify-between items-start font-medium text-foreground">
                                                                            <span>{exp.title}</span>
                                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                                                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-accent mt-0.5">{exp.company}</div>
                                                                        {exp.responsibilities && (
                                                                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                                                {exp.responsibilities}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No professional work history specified.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default JobApplicants;
