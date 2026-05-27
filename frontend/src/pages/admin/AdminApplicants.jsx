import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

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
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => navigate(`/candidate/${applicant?._id}`, { state: { jobId: job?._id, applicationId: app?._id } })}
                    className="group grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 bg-surface/60 border border-border rounded-2xl hover:border-accent/20 hover:bg-surface backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <div className="col-span-1 lg:col-span-5 flex items-center gap-4">
                      <Avatar className="w-14 h-14 border border-border bg-surface-elevated">
                        <AvatarImage src={applicant?.profile?.profilePhoto} />
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors truncate">
                          {applicant?.fullname || "Candidate"}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">{applicant?.email || ""}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {job?.title ? job.title : "Job"} {job?.company?.name ? `· ${job.company.name}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(app.status)} className="capitalize px-3 py-1">
                          {statusLabel(app.status)}
                        </Badge>
                        {typeof app.atsScore === "number" && (
                          <Badge variant="outline" className="px-3 py-1">
                            ATS {app.atsScore}%
                          </Badge>
                        )}
                        {typeof app.matchScore === "number" && (
                          <Badge variant="outline" className="px-3 py-1">
                            Match {app.matchScore}%
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Click to open profile
                      </div>
                    </div>
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

