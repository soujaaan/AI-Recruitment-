import React from 'react'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import EmptyState from './common/EmptyState'
import { Briefcase, MapPin, Clock } from 'lucide-react'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    useGetAppliedJobs();

    const statusVariant = (status) => {
        switch (status) {
            case 'shortlisted': return 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-surface-elevated text-muted-foreground border-border';
        }
    };

    return (
        <div className="space-y-3">
            {allAppliedJobs.length <= 0 ? (
                <EmptyState title="No applications yet" description="Start applying to jobs to see them here." />
            ) : (
                allAppliedJobs.map((appliedJob) => (
                    <div
                        key={appliedJob._id}
                        className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                    {appliedJob?.job?.title}
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        {appliedJob?.job?.company?.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {appliedJob?.job?.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(appliedJob.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <Badge
                                className={`${statusVariant(appliedJob?.status)} border`}
                            >
                                {appliedJob.status}
                            </Badge>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default AppliedJobTable

