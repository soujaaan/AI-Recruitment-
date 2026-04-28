import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSingleJob } from '@/redux/jobSlice'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import Navbar from './shared/Navbar'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, DollarSign, Building2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const JobDescription = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isInitiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    const applyJobHandler = async () => {
        try {
            const res = await apiClient.post(`${APPLICATION_API_END_POINT}/apply/${id}`, {}, { withCredentials: true });
            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await apiClient.get(`/api/jobs/${id}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [id, dispatch, user?._id]);

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

                        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div>
                                    <p className="section-label mb-2">Job Details</p>
                                    <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground">
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

                                <Button
                                    onClick={isApplied ? null : applyJobHandler}
                                    disabled={isApplied}
                                    className={isApplied ? "btn-neon-outline opacity-60 cursor-not-allowed" : "btn-neon"}
                                >
                                    {isApplied ? 'Already Applied' : 'Apply Now'}
                                </Button>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                    <p className="text-muted-foreground leading-relaxed">{singleJob?.description}</p>
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-xl text-foreground mb-3">Requirements</h3>
                                    <p className="text-muted-foreground leading-relaxed">{singleJob?.requirements}</p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-2">
                                <Badge variant="green">{singleJob?.jobType}</Badge>
                                <Badge variant="secondary">{singleJob?.salary}</Badge>
                                <Badge variant="outline">{singleJob?.experienceLevel}</Badge>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default JobDescription

