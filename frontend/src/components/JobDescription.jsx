import React, { useEffect, useState, useMemo } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSingleJob } from '@/redux/jobSlice'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import Navbar from './shared/Navbar'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, DollarSign, Building2, ArrowLeft, AlertCircle, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApplyJobMutation } from '@/hooks/useJobMutations'

const JobDescription = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const applyMutation = useApplyJobMutation();

    const [isApplied, setIsApplied] = useState(false);

    const profileComplete = useMemo(() => {
        if (!user) return false;
        const fields = [
            user.fullname,
            user.email,
            user.phoneNumber,
            user.profile?.bio,
            user.profile?.skills?.length > 0,
            user.profile?.resume
        ];
        const filled = fields.filter(Boolean).length;
        return filled / fields.length >= 0.8;
    }, [user]);

    const applyJobHandler = async () => {
        if (!user) {
            toast.error("Please login to apply");
            navigate('/login');
            return;
        }
        if (!profileComplete) {
            toast.error("Complete your profile before applying");
            navigate('/profile');
            return;
        }
        try {
            const result = await applyMutation.mutateAsync(id);
            if (result.success) {
                setIsApplied(true);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...(singleJob?.applications || []), { applicant: user?._id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(result.message);
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await apiClient.get(`/api/v1/job/get/${id}`);
                if (res.data.success) {
                    const job = res.data.job;
                    dispatch(setSingleJob(job));
                    if (user?._id && job.applications) {
                        setIsApplied(job.applications.some(application =>
                            String(application.applicant) === String(user._id) ||
                            String(application.applicant?._id) === String(user._id)
                        ));
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchSingleJob();
    }, [id, dispatch, user?._id]);

    const applyButtonText = isApplied ? 'Applied' : 'Apply Now';
    const applyButtonDisabled = isApplied || applyMutation.isPending;

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to jobs
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10">
                                    <div>
                                        <p className="section-label mb-2">Job Details</p>
                                        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                                            {singleJob?.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="w-4 h-4" />
                                                {singleJob?.company?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {singleJob?.location}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                {singleJob?.jobType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" />

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                        <div className="rounded-xl border border-border bg-surface-elevated p-5">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Salary</p>
                                            <p className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-accent" />
                                                {singleJob?.salary}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border bg-surface-elevated p-5">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
                                            <p className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-accent" />
                                                {singleJob?.experienceLevel}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border bg-surface-elevated p-5">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Applicants</p>
                                            <p className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-bold">#</span>
                                                {singleJob?.applications?.length || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-display font-bold text-xl text-foreground mb-3">Description</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{singleJob?.description}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-xl text-foreground mb-3">Requirements</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{singleJob?.requirements}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-2">
                                        <Badge variant="green">{singleJob?.jobType}</Badge>
                                        <Badge variant="secondary">{singleJob?.salary}</Badge>
                                        <Badge variant="outline">{singleJob?.experienceLevel}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    {/* Apply Card */}
                                    <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-6">
                                        <h3 className="font-display font-bold text-lg text-foreground mb-4">Apply for this role</h3>

                                        {!user && (
                                            <div className="flex items-start gap-2 text-xs text-amber-400 mb-4 bg-amber-400/10 rounded-lg p-3">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <p>Login required to apply for this position.</p>
                                            </div>
                                        )}

                                        {user && !profileComplete && (
                                            <div className="flex items-start gap-2 text-xs text-amber-400 mb-4 bg-amber-400/10 rounded-lg p-3">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <p>Complete your profile (resume, bio, skills) to apply.</p>
                                            </div>
                                        )}

                                        {isApplied && (
                                            <div className="flex items-center gap-2 text-xs text-[#00ff88] mb-4 bg-[#00ff88]/10 rounded-lg p-3">
                                                <FileText className="w-4 h-4" />
                                                <p>You have already applied for this job.</p>
                                            </div>
                                        )}

                                        <Button
                                            onClick={applyJobHandler}
                                            disabled={applyButtonDisabled}
                                            className={applyButtonDisabled
                                                ? "w-full btn-neon-outline opacity-60 cursor-not-allowed"
                                                : "w-full btn-neon"
                                            }
                                        >
                                            {applyMutation.isPending ? 'Applying...' : applyButtonText}
                                        </Button>
                                    </div>

                                    {/* Company Card */}
                                    <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-6">
                                        <h3 className="font-display font-bold text-lg text-foreground mb-3">
                                            {singleJob?.company?.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {singleJob?.company?.description || "No company description available."}
                                        </p>
                                        {singleJob?.company?.website && (
                                            <a
                                                href={singleJob.company.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-accent hover:underline mt-3 inline-block"
                                            >
                                                Visit Website →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default JobDescription

