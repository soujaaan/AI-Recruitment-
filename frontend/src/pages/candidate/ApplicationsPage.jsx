import React, { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/shared/Navbar'
import SectionHeader from '@/components/common/SectionHeader'
import GlassCard from '@/components/common/GlassCard'
import EmptyState from '@/components/common/EmptyState'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Briefcase, MapPin, Calendar, ArrowRight, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MatchSkillsDisplay from '@/components/recruitment/MatchSkillsDisplay'
import { interviewService } from '@/services/interview.service'

const StatusBadge = ({ status }) => {
    const variants = {
        applied: 'bg-surface-elevated text-muted-foreground border-border',
        shortlisted: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]',
        'interview scheduled': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/30'
    };

    const labels = {
        applied: 'Applied',
        shortlisted: 'Shortlisted',
        'interview scheduled': 'Interview Scheduled',
        rejected: 'Rejected'
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variants[status] || variants.applied}`}>
            {status === 'shortlisted' && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />}
            {labels[status] || status}
        </span>
    );
};

const ApplicationsPage = () => {
    const navigate = useNavigate();
    const { allAppliedJobs } = useSelector(store => store.job);
    const { isLoading } = useGetAppliedJobs();
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        interviewService
            .getMyInterviews()
            .then(setInterviews)
            .catch(() => setInterviews([]));
    }, []);

    const formatCountdown = (target) => {
        const now = Date.now();
        const diffMs = new Date(target).getTime() - now;
        if (diffMs <= 0) return 'Starting soon';
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours <= 0) return `Available in ${minutes}m`;
        return `Available in ${hours}h ${minutes}m`;
    };

    const getMeetingState = (iv) => {
        const state = iv?.meetingAccess?.state;
        if (state === 'active') return 'active';
        if (state === 'expired') return 'expired';
        return 'locked';
    };

    const stats = [
        { label: 'Total', value: allAppliedJobs.length, color: 'text-foreground' },
        { label: 'Shortlisted', value: allAppliedJobs.filter(a => a.status === 'shortlisted').length, color: 'text-[#00ff88]' },
        { label: 'Rejected', value: allAppliedJobs.filter(a => a.status === 'rejected').length, color: 'text-red-400' }
    ];

    const titleObj = {
        normal: "Your",
        highlight: "Applications"
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        label="01 — Applications"
                        title={titleObj}
                        subtitle="Track all your job applications and their current status in one place."
                    />

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.map((stat, index) => (
                            <GlassCard key={index} animate delay={index * 0.05} className="text-center py-4">
                                <p className={`font-display font-bold text-3xl ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                            </GlassCard>
                        ))}
                    </div>

                    {interviews.length > 0 && (
                        <div className="mt-12">
                            <p className="section-label mb-6">02 — Upcoming Interviews</p>
                            <div className="space-y-3">
                                {interviews.map((iv) => {
                                    const state = getMeetingState(iv);
                                    const isActive = state === 'active';
                                    const isLocked = state === 'locked';
                                    const isExpired = state === 'expired';

                                    let label = 'Join Meeting';
                                    if (isLocked) {
                                        label = iv.meetingAccess?.startsAt
                                            ? formatCountdown(iv.meetingAccess.startsAt)
                                            : 'Opens 1 hour before interview';
                                    } else if (isExpired) {
                                        label = 'Meeting Ended';
                                    }

                                    return (
                                        <GlassCard key={iv._id} className="p-5">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
                                                        <Video className="w-4 h-4 text-blue-400" />
                                                        {iv.job?.title}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {new Date(iv.scheduledAt).toLocaleString()} · {iv.job?.company?.name}
                                                    </p>
                                                    {iv.notes && <p className="text-xs text-muted-foreground mt-2">{iv.notes}</p>}
                                                </div>
                                                {iv.meetingLink && (
                                                    <button
                                                        type="button"
                                                        disabled={!isActive}
                                                        onClick={async () => {
                                                            try {
                                                                const link = await interviewService.getMeetingLink(iv._id);
                                                                if (link) {
                                                                    window.open(link, '_blank', 'noopener,noreferrer');
                                                                }
                                                            } catch (err) {
                                                                // fallback to browser alert to avoid new dependency
                                                                // eslint-disable-next-line no-alert
                                                                alert(err.message || 'Unable to join meeting right now.');
                                                            }
                                                        }}
                                                        className={`inline-flex items-center justify-center min-w-[140px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                            isActive
                                                                ? 'btn-neon'
                                                                : isExpired
                                                                ? 'border border-border/70 bg-surface/40 text-xs text-muted-foreground cursor-default'
                                                                : 'border border-border/60 bg-surface/40 text-xs text-muted-foreground cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mr-2 animate-pulse" />
                                                        )}
                                                        {label}
                                                    </button>
                                                )}
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-12">
                        <p className="section-label mb-6">{interviews.length > 0 ? '03' : '02'} — Application History</p>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="rounded-2xl border border-border bg-surface/40 h-20 animate-pulse" />
                                ))}
                            </div>
                        ) : allAppliedJobs.length === 0 ? (
                            <EmptyState
                                title="No applications yet"
                                description="Start browsing jobs and apply to see your applications here."
                                action={
                                    <button
                                        onClick={() => navigate('/jobs')}
                                        className="mt-4 btn-neon px-6 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                                    >
                                        Browse Jobs <ArrowRight className="w-4 h-4" />
                                    </button>
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {allAppliedJobs.map((app, index) => (
                                    <motion.div
                                        key={app._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <div
                                            className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer"
                                            onClick={() => navigate(`/jobs/${app.job?._id}`)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h4 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
                                                            {app.job?.title}
                                                        </h4>
                                                        <StatusBadge status={app.status} />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Briefcase className="w-3.5 h-3.5" />
                                                            {app.job?.company?.name}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {app.job?.location}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {app.job?.salary && (
                                                        <p className="text-sm text-accent/80 mt-1">{app.job.salary}</p>
                                                    )}
                                                    {(app.matchScore !== undefined || app.matchedSkills?.length) && (
                                                        <div className="mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
                                                            <MatchSkillsDisplay
                                                                matchScore={app.matchScore}
                                                                matchedSkills={app.matchedSkills}
                                                                missingSkills={app.missingSkills}
                                                                compact
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all shrink-0" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ApplicationsPage;

