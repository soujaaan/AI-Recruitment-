import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Mail, Phone, Clock, ChevronDown, ChevronUp, Briefcase, Sparkles, Trophy, Calendar, Eye } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import MatchSkillsDisplay from "@/components/recruitment/MatchSkillsDisplay";

const ATS_STATUSES = ["applied", "shortlisted", "interview", "hired", "rejected"];

const isValidAtsStatus = (status) => ATS_STATUSES.includes(String(status || "").toLowerCase());

const statusBadgeVariant = (status) => {
  switch (status) {
    case "shortlisted":
      return "green";
    case "rejected":
      return "destructive";
    case "hired":
      return "green";
    case "interview":
      return "outline";
    case "applied":
    default:
      return "outline";
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "applied":
      return "Applied";
    case "shortlisted":
      return "Shortlisted";
    case "interview":
      return "Interview";
    case "hired":
      return "Hired";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

const AdminApplicants = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFromUrlRaw = searchParams.get("status");
  const statusFromUrl = isValidAtsStatus(statusFromUrlRaw) ? String(statusFromUrlRaw).toLowerCase() : null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCardIds, setExpandedCardIds] = useState({});
  const toggleExpand = (appId) => {
    setExpandedCardIds(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFromUrl) params.status = statusFromUrl;
      const res = await apiClient.get("/api/v1/applications", { params });
      const apps = res.data?.data?.applications || res.data?.applications || res.data?.data || res.data;
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load applicants");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFromUrl]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const visibleApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) => {
      const applicant = app.applicant || app.candidate;
      const name = applicant?.fullname || "";
      const email = applicant?.email || "";
      const jobTitle = app.job?.title || "";
      const companyName = app.job?.company?.name || "";
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery]);

  const onStatusChange = (next) => {
    const value = String(next);
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") nextParams.delete("status");
    else nextParams.set("status", value);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-foreground">
      <Navbar />
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-6 -ml-4 text-muted-foreground hover:text-accent hover:bg-accent/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <SectionHeader
            label="01 — ATS Pipeline"
            title={<>Review <span className="gradient-text">Applicants</span></>}
            subtitle={statusFromUrl ? `Showing ${statusLabel(statusFromUrl)} candidates across your jobs.` : "Showing all candidates across your jobs."}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 bg-surface border-border focus:border-accent focus:ring-accent/20"
                placeholder="Search by candidate, email, job, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFromUrl || "all"}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full sm:w-auto bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:border-accent focus:ring-accent/20 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </motion.div>

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
            ) : visibleApplications.length === 0 ? (
              <EmptyState
                title="No applicants found"
                description="Try another pipeline stage or adjust your search."
              />
            ) : (
              visibleApplications.map((app, index) => {
                const applicant = app.applicant || app.candidate;
                const job = app.job;

                const isExpanded = !!expandedCardIds[app._id];
                const isRejected = app.status === 'rejected';
                const isHired = app.status === 'hired';

                const statusRingColor = 
                    app.status === 'shortlisted' ? 'ring-2 ring-emerald-500' :
                    app.status === 'interview' ? 'ring-2 ring-indigo-500' :
                    app.status === 'hired' ? 'ring-2 ring-accent' :
                    app.status === 'rejected' ? 'ring-2 ring-red-500/40' : 'ring-1 ring-border';

                const latestRole = app.candidateProfile?.headline || applicant?.profile?.headline || (app.candidateProfile?.experience?.[0] ? `${app.candidateProfile.experience[0].title} at ${app.candidateProfile.experience[0].company}` : "Candidate Profile");

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
                        className="col-span-1 lg:col-span-5 flex items-center gap-4 cursor-pointer"
                        onClick={() => navigate(`/candidate/${applicant?._id}`, { state: { jobId: job?._id, applicationId: app?._id } })}
                      >
                        <Avatar className={`w-14 h-14 ${statusRingColor} bg-surface-elevated`}>
                          <AvatarImage src={applicant?.profile?.profilePhoto} />
                        </Avatar>
                        <div className="min-w-0">
                          <h4 className="font-display font-semibold text-base text-foreground group-hover:text-accent transition-colors truncate">
                            {applicant?.fullname || "Candidate"}
                          </h4>
                          <p className="text-xs text-accent mt-0.5 truncate font-medium">
                            {latestRole}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            💼 {job?.title ? job.title : "Job"} {job?.company?.name ? `· ${job.company.name}` : ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" /> {applicant?.email}</span>
                            {applicant?.profile?.phoneNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" /> {applicant?.profile?.phoneNumber}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Zone 2: ATS Intelligence */}
                      <div className="col-span-1 lg:col-span-4 flex flex-col gap-1.5 border-t lg:border-t-0 lg:border-l border-border/80 pt-4 lg:pt-0 lg:pl-6 h-full justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                          {typeof app.atsScore === "number" && (
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ATS:</span>
                              <span className={`text-sm font-bold ${app.atsScore >= 75 ? 'text-[#00ff88]' : app.atsScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {app.atsScore}%
                              </span>
                            </div>
                          )}
                          {typeof app.matchScore === "number" && (
                            <div className="flex items-baseline gap-1">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Match:</span>
                              <span className={`text-sm font-bold ${app.matchScore >= 75 ? 'text-[#00ff88]' : app.matchScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {app.matchScore}%
                              </span>
                            </div>
                          )}
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

                      {/* Zone 3: Actions Info */}
                      <div className="col-span-1 lg:col-span-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t lg:border-t-0 border-border/80 pt-4 lg:pt-0 pl-0 lg:pl-6">
                        <Badge variant={statusBadgeVariant(app.status)} className="capitalize px-3 py-1.5 text-xs font-semibold mr-auto lg:mr-2">
                          {statusLabel(app.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/candidate/${applicant?._id}`, { state: { jobId: job?._id, applicationId: app?._id } })}
                          className="text-xs py-1 h-8 px-2.5 rounded-lg flex items-center gap-1 font-medium border border-border/60 hover:text-accent hover:border-accent/30"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Button>
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

export default AdminApplicants;

