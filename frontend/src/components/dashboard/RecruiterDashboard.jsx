import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../common/SectionHeader'
import GlassCard from '../common/GlassCard'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Briefcase, Building2, Users, ArrowRight, Plus, ListFilter, UserCheck, Calendar, UserX, Trophy } from 'lucide-react'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { toMongoIdString } from '@/utils/mongoId'

const RecruiterDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const { data: adminJobsData } = useGetAllAdminJobs();
    const adminJobs = adminJobsData?.jobs || [];
    const metrics = adminJobsData?.metrics || {};

    const totalApplicants =
        metrics.totalApplicants ??
        adminJobs.reduce((acc, job) => acc + (job.applicantCount ?? 0), 0);

    const topJob = adminJobs.reduce(
        (best, job) => ((job?.applicantCount ?? 0) > (best?.applicantCount ?? 0) ? job : best),
        null
    );
    const topJobId = topJob ? toMongoIdString(topJob._id) : null;

    const stats = [
        { label: "Posted Jobs", value: adminJobs.length, icon: Briefcase, destination: '/admin/jobs' },
        { label: "Total Applicants", value: totalApplicants, icon: Users, destination: '/admin/applicants' },
        { label: "Shortlisted", value: metrics.shortlisted ?? 0, icon: UserCheck, destination: '/admin/applicants?status=shortlisted' },
        { label: "Interviews", value: metrics.interviewsScheduled ?? 0, icon: Calendar, destination: '/admin/applicants?status=interview' },
        { label: "Hired", value: metrics.hired ?? 0, icon: Trophy, destination: '/admin/applicants?status=hired' },
        { label: "Rejected", value: metrics.rejected ?? 0, icon: UserX, destination: '/admin/applicants?status=rejected' },
        { label: "Companies", value: user?.companies?.length || 0, icon: Building2, destination: '/admin/companies' },
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    label="01 — Dashboard"
                    title={`Hello, ${user?.fullname?.split(' ')[0] || 'Recruiter'}`}
                    subtitle="Manage your companies, post jobs, and review applicants."
                />

                {/* Stats */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    {stats.map((stat, index) => (
                        <GlassCard
                            key={index}
                            hover={false}
                            animate
                            delay={index * 0.1}
                            role="link"
                            tabIndex={0}
                            aria-label={`${stat.label}: ${stat.value}`}
                            onClick={() => navigate(stat.destination)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(stat.destination);
                                }
                            }}
                            className="group h-full flex flex-col justify-between gap-6 cursor-pointer bg-surface/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_28px_rgba(0,255,136,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_0_22px_rgba(0,255,136,0.16)]"
                        >
                            {/* Hover glow layer */}
                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute -inset-8 bg-gradient-to-br from-accent/12 via-accent/0 to-transparent blur-2xl" />
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${Number(stat.value) > 0 ? 'bg-accent animate-pulse' : 'bg-accent/30'}`}
                                        />
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">{stat.label}</p>
                                    </div>
                                </div>

                                <ArrowRight
                                    className="w-4 h-4 text-muted-foreground opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="relative w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-y-[-2px]">
                                    <stat.icon className="w-5 h-5 text-accent" />
                                </div>

                                <div className="text-right">
                                    <p className="font-display font-bold text-3xl text-foreground tabular-nums leading-none">
                                        {stat.value}
                                    </p>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        {Number(stat.value) > 0 ? 'Review in ATS' : 'Start managing'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                                    {stat.label === 'Posted Jobs' ? 'Recruit faster' : 'Actionable insights'}
                                </span>
                                <span className="text-accent/90 font-medium uppercase tracking-wider">Open</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-12">
                    <p className="section-label mb-6">02 — Quick Actions</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/admin/jobs/create')}>
                            <Plus className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">Post a Job</h4>
                            <p className="text-sm text-muted-foreground mt-1">Create a new opening</p>
                        </GlassCard>
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/admin/jobs')}>
                            <ListFilter className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">Manage Jobs</h4>
                            <p className="text-sm text-muted-foreground mt-1">Edit or review postings</p>
                        </GlassCard>
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/admin/companies')}>
                            <Building2 className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">Companies</h4>
                            <p className="text-sm text-muted-foreground mt-1">Manage your organizations</p>
                        </GlassCard>
                    </div>
                </div>

                {/* Recent Jobs */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <p className="section-label">03 — Recent Postings</p>
                        <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10" onClick={() => navigate('/admin/jobs')}>
                            View all <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {adminJobs.length === 0 ? (
                        <GlassCard className="text-center py-12">
                            <p className="text-muted-foreground">No jobs posted yet.</p>
                            <Button className="mt-4 btn-neon" onClick={() => navigate('/admin/jobs/create')}>
                                Post First Job
                            </Button>
                        </GlassCard>
                    ) : (
                        <div className="space-y-3">
                            {adminJobs.slice(0, 5).map((job) => {
                                const jobId = toMongoIdString(job._id);
                                return (
                                <div
                                    key={jobId}
                                    className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer"
                                    onClick={() => navigate(`/admin/jobs/${jobId}/applicants`)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                                {job.title}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {job.company?.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {job.applicantCount ?? 0} applicants
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="green">{job.jobType}</Badge>
                                            <Badge variant="outline">{job.status || 'active'}</Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default RecruiterDashboard

