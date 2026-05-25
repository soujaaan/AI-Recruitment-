import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import useGetApplicants from '@/hooks/useGetApplicants'
import EmptyState from '../common/EmptyState'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Mail, Phone, FileText, Calendar, ChevronDown, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useJobMutations } from '@/hooks/useJobMutations'

const statusOptions = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['rejected'],
  rejected: [],
};

const statusBadgeVariant = (status) => {
  switch (status) {
    case 'applied': return 'outline';
    case 'shortlisted': return 'green';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'applied': return 'Applied';
    case 'shortlisted': return 'Shortlisted';
    case 'rejected': return 'Rejected';
    default: return status;
  }
};

const ApplicantsTable = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { applicants } = useSelector(store => store.application);
    const { updateApplicationStatus } = useJobMutations();
    const [updatingId, setUpdatingId] = useState(null);
    useGetApplicants(params.id);

    const handleStatusChange = async (applicationId, newStatus, currentStatus) => {
        const allowed = statusOptions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            toast.error(`Cannot transition from ${currentStatus} to ${newStatus}`);
            return;
        }
        setUpdatingId(applicationId);
        try {
            await updateApplicationStatus.mutateAsync({ applicationId, status: newStatus });
            toast.success(`Status updated to ${statusLabel(newStatus)}`);
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const validApplicants = applicants?.filter(app => app && (app.candidate || app.applicant)) || [];

    return (
        <div className="space-y-3">
            {validApplicants.length <= 0 ? (
                <EmptyState title="No applicants yet" description="Share the job posting to attract candidates." />
            ) : (
                validApplicants.map((applicant) => {
                    const candidateUser = applicant.candidate || applicant.applicant;
                    return (
                        <div
                            key={applicant._id}
                            onClick={() => navigate(`/candidate/${candidateUser._id}`, { state: { jobId: params.id } })}
                            className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 cursor-pointer hover:border-accent/40 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] hover:bg-surface hover:scale-[1.01] transition-all duration-200"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-12 h-12 border border-border">
                                        <AvatarImage src={candidateUser?.profile?.profilePhoto} alt={candidateUser?.fullname} />
                                    </Avatar>
                                    <div>
                                        <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                            {candidateUser?.fullname}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {candidateUser?.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                {candidateUser?.phoneNumber}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(applicant.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                    {candidateUser?.profile?.resume ? (
                                        <a
                                            href={candidateUser?.profile?.resume}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Resume
                                        </a>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No resume</span>
                                    )}

                                    {/* Status Update Dropdown */}
                                    <div className="relative">
                                        {updatingId === applicant._id ? (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-muted-foreground text-sm">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Updating...
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={applicant.status}
                                                    onChange={(e) => handleStatusChange(applicant._id, e.target.value, applicant.status)}
                                                    className="appearance-none bg-surface border border-border rounded-lg px-3 py-1.5 pr-8 text-sm text-foreground focus:border-accent focus:ring-accent/20 cursor-pointer hover:border-accent/30 transition-colors"
                                                >
                                                    <option value="applied">Applied</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                            </div>
                                        )}
                                    </div>

                                    <Badge variant={statusBadgeVariant(applicant.status)}>
                                        {statusLabel(applicant.status)}
                                    </Badge>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/candidate/${candidateUser._id}`, { state: { jobId: params.id } });
                                        }}
                                        className="ml-2 flex items-center justify-center px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all gap-1.5 text-sm font-medium"
                                        title="View Profile"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Profile</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ApplicantsTable

