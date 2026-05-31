import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../common/SectionHeader'
import GlassCard from '../common/GlassCard'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Briefcase, MapPin, Clock, ArrowRight, FileText, Sparkles, CheckCircle2, Bell } from 'lucide-react'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { useNotifications } from '@/hooks/useNotifications'

const CandidateDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const { data: appliedJobsData } = useGetAppliedJobs();
    const appliedJobs = appliedJobsData?.applications || [];
    const { notifications, unreadCount } = useNotifications();

    const stats = [
        { label: "Applications", value: appliedJobs.length, icon: FileText, onClick: () => navigate('/profile') },
        { label: "Interviews", value: appliedJobs.filter(a => a.status === 'interview' || a.status === 'interview scheduled').length, icon: Sparkles, onClick: () => navigate('/dashboard') },
        { label: "Unread Alerts", value: unreadCount, icon: Bell, onClick: () => navigate('/notifications') },
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    label="01 — Dashboard"
                    title={`Hello, ${user?.fullname?.split(' ')[0] || 'Candidate'}`}
                    subtitle="Track your applications, discover new roles, and prepare with AI."
                />

                {/* Stats */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <GlassCard key={index} animate delay={index * 0.1} className={`flex items-center gap-4 cursor-pointer hover:border-accent/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.12)] transition-all`} onClick={stat.onClick}>
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
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/jobs')}>
                            <Briefcase className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">Browse Jobs</h4>
                            <p className="text-sm text-muted-foreground mt-1">Explore new opportunities</p>
                        </GlassCard>
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/profile')}>
                            <FileText className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">My Profile</h4>
                            <p className="text-sm text-muted-foreground mt-1">Update your resume & info</p>
                        </GlassCard>
                        <GlassCard className="cursor-pointer" onClick={() => navigate('/browse')}>
                            <Sparkles className="w-6 h-6 text-accent mb-3" />
                            <h4 className="font-display font-semibold text-foreground">AI Match</h4>
                            <p className="text-sm text-muted-foreground mt-1">Find your best fit roles</p>
                        </GlassCard>
                    </div>
                </div>

                {/* Recent Applications & Alerts Grid */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Applications (Left column, span 2) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <p className="section-label">03 — Recent Applications</p>
                            <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10" onClick={() => navigate('/profile')}>
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {appliedJobs.length === 0 ? (
                            <GlassCard className="text-center py-12">
                                <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                                <Button className="mt-4 btn-neon" onClick={() => navigate('/jobs')}>
                                    Browse Jobs
                                </Button>
                            </GlassCard>
                        ) : (
                            <div className="space-y-3">
                                {appliedJobs.slice(0, 5).map((app, index) => (
                                    <div
                                        key={app._id}
                                        className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 hover:bg-surface transition-all cursor-pointer"
                                        onClick={() => navigate(`/description/${app.job?._id}`)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                                    {app.job?.title}
                                                </h4>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3.5 h-3.5" />
                                                        {app.job?.company?.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        {app.job?.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    app.status === 'accepted' ? 'green' :
                                                    app.status === 'rejected' ? 'destructive' :
                                                    app.status === 'interview' ? 'secondary' :
                                                    'outline'
                                                }
                                            >
                                                {app.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Alerts & Matches (Right column, span 1) */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="section-label">04 — Alerts & AI Matches</p>
                            <Button variant="ghost" className="text-accent hover:text-accent hover:bg-accent/10" onClick={() => navigate('/notifications')}>
                                Inbox <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {notifications.length === 0 ? (
                                <GlassCard className="text-center py-12 flex flex-col items-center justify-center">
                                    <Bell className="w-8 h-8 text-muted-foreground/45 mb-2" />
                                    <p className="text-xs text-muted-foreground">No recent alerts or recommendations</p>
                                </GlassCard>
                            ) : (
                                notifications.slice(0, 4).map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => {
                                            if (notif.entityType === 'Job' && notif.entityId) {
                                                navigate(`/description/${notif.entityId}`);
                                            } else if (notif.entityType === 'Application') {
                                                navigate('/applications');
                                            } else {
                                                navigate('/notifications');
                                            }
                                        }}
                                        className={`group p-4 rounded-2xl border transition-all cursor-pointer relative ${
                                            notif.isRead
                                                ? 'bg-[#070707]/60 border-border/40 hover:bg-[#070707]/80'
                                                : 'bg-[#0b0b0b]/75 border-border hover:bg-[#0c0c0c]/90 hover:border-[#00ff88]/30'
                                        }`}
                                    >
                                        {!notif.isRead && (
                                            <span className="absolute left-0 top-4 bottom-4 w-1 bg-[#00ff88] rounded-r shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                                        )}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className={`text-[12px] font-semibold truncate ${notif.isRead ? 'text-muted-foreground' : 'text-foreground group-hover:text-[#00ff88]'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CandidateDashboard

