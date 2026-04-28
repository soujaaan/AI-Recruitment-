import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../common/SectionHeader'
import GlassCard from '../common/GlassCard'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Briefcase, Building2, Users, ArrowRight, Plus, ListFilter } from 'lucide-react'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'

const RecruiterDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const { data: adminJobsData } = useGetAllAdminJobs();
    const adminJobs = adminJobsData?.jobs || [];

    const stats = [
        { label: "Posted Jobs", value: adminJobs.length, icon: Briefcase },
        { label: "Total Applicants", value: adminJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0), icon: Users },
        { label: "Companies", value: user?.companies?.length || 0, icon: Building2 },
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
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <GlassCard key={index} animate delay={index * 0.1} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                <stat.icon className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
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
                            {adminJobs.slice(0, 5).map((job, index) => (
                                <div
                                    key={job._id}
                                    className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer"
                                    onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
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
                                                    {job.applications?.length || 0} applicants
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="green">{job.jobType}</Badge>
                                            <Badge variant="outline">{job.status || 'active'}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default RecruiterDashboard

