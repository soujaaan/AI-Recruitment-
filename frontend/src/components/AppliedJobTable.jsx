import React from 'react'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import EmptyState from './common/EmptyState'
import { Briefcase, MapPin, Clock } from 'lucide-react'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.application);
    useGetAppliedJobs();

    return (
        <div className="space-y-3">
            {allAppliedJobs.length <= 0 ? (
                <EmptyState title="No applications yet" description="Start applying to jobs to see them here." />
            ) : (
                allAppliedJobs.map((appliedJob, index) => (
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
                                variant={
                                    appliedJob?.status === 'accepted' ? 'green' :
                                    appliedJob?.status === 'rejected' ? 'destructive' :
                                    appliedJob?.status === 'interview' ? 'secondary' :
                                    'outline'
                                }
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

