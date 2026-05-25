import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, X, FileText, Download, User, ArrowLeft, MessageSquare } from 'lucide-react';
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
            case 'applied':
            default: return 'outline';
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
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:border-accent focus:ring-accent/20 outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </motion.div>

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
                            filteredApplications.map((app, index) => (
                                <motion.div
                                    key={app._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 bg-surface/60 border border-border rounded-2xl hover:border-accent/20 hover:bg-surface backdrop-blur-sm transition-all"
                                >
                                    {/* Left: Candidate Info */}
                                    <div className="col-span-1 lg:col-span-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors" onClick={() => navigate(`/candidate/${app.applicant._id}`, {
                                        state: {
                                            jobId: job?._id,
                                            applicationId: app?._id,
                                        },
                                    })}>
                                        <Avatar className="w-14 h-14 border border-border bg-surface-elevated">
                                            <AvatarImage src={app.applicant?.profile?.profilePhoto} />
                                        </Avatar>
                                        <div>
                                            <h4 className="font-display font-semibold text-lg text-foreground hover:text-accent transition-colors">
                                                {app.applicant?.fullname}
                                            </h4>
                                            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                                                <p>{app.applicant?.email}</p>
                                                <p>{app.applicant?.profile?.phoneNumber || "No phone number"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center: Intelligence panel */}
                                    <div className="col-span-1 lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                                        <div className="flex items-center gap-6 mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</span>
                                                <span className={`text-xl font-bold ${app.atsScore > 75 ? 'text-[#00ff88]' : app.atsScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {app.atsScore || 0}%
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Match Score</span>
                                                <span className={`text-xl font-bold ${app.matchScore > 75 ? 'text-[#00ff88]' : app.matchScore > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {app.matchScore ?? 0}%
                                                </span>
                                            </div>
                                        </div>

                                        <MatchSkillsDisplay
                                            matchScore={app.matchScore}
                                            matchedSkills={app.matchedSkills}
                                            missingSkills={app.missingSkills}
                                            compact
                                        />

                                        {app.candidateProfile?.experience?.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {app.candidateProfile.experience[0]?.title} at {app.candidateProfile.experience[0]?.company}
                                                {app.candidateProfile.experience.length > 1 && ` · +${app.candidateProfile.experience.length - 1} more`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="col-span-1 lg:col-span-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t lg:border-t-0 border-border pt-4 lg:pt-0">
                                        <div className="flex items-center gap-2 mr-auto sm:mr-4">
                                            <Badge variant={getStatusVariant(app.status)} className="capitalize px-3 py-1">
                                                {app.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {/* Resume Actions */}
                                            {getResumeUrl(app) && (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleViewResume(app)}
                                                        title="View Resume"
                                                        className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDownloadResume(app, app.applicant?.fullname)}
                                                        title="Download Resume"
                                                        className="text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Status Actions */}
                                            {app.status !== 'shortlisted' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                                                    title="Accept / Shortlist"
                                                    className="text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            
                                            {app.status !== 'rejected' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                    title="Reject"
                                                    className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {/* Chat Action */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleStartChat(app.applicant._id)}
                                                title="Message Candidate"
                                                className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            
                                            {/* Profile Action */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(`/candidate/${app.applicant._id}`)}
                                                title="View Profile"
                                                className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                                            >
                                                <User className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default JobApplicants;
