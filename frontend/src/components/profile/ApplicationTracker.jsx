import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Briefcase, MapPin, Clock, Search, Rocket } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import GlassCard from '../common/GlassCard';
import { useNavigate } from 'react-router-dom';

const ApplicationTracker = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    useGetAppliedJobs();
    const navigate = useNavigate();

    const statusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'shortlisted': return 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'interview': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            default: return 'bg-surface-elevated text-muted-foreground border-border';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <GlassCard>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-display text-foreground">Application Tracker</h3>
                    <Badge variant="outline" className="bg-white/5">{allAppliedJobs?.length || 0} Total</Badge>
                </div>

                <div className="space-y-4">
                    {(!allAppliedJobs || allAppliedJobs.length <= 0) ? (
                        <div className="text-center py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                <Rocket className="w-8 h-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Start your job journey</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto mb-6">
                                Apply to jobs that match your skills and let our AI track your application progress in real-time.
                            </p>
                            <div className="flex gap-4">
                                <Button className="btn-neon" onClick={() => navigate('/jobs')}>
                                    Browse Jobs
                                </Button>
                                <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10" onClick={() => navigate('/jobs')}>
                                    <Search className="w-4 h-4 mr-2" /> AI Recommended
                                </Button>
                            </div>
                        </div>
                    ) : (
                        allAppliedJobs.slice(0, 5).map((appliedJob, index) => (
                            <motion.div
                                key={appliedJob._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="group relative rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-5 hover:border-accent/30 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/5 to-transparent rounded-r-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                    <div>
                                        <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                                            {appliedJob?.job?.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-accent/70" />
                                                {appliedJob?.job?.company?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-cyan-400/70" />
                                                {appliedJob?.job?.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-purple-400/70" />
                                                {new Date(appliedJob.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge
                                        className={`${statusVariant(appliedJob?.status)} border px-3 py-1 shadow-sm capitalize`}
                                    >
                                        {appliedJob?.status || 'applied'}
                                    </Badge>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default ApplicationTracker;
