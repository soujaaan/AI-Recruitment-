import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useJobMutations } from '@/hooks/useJobMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase } from 'lucide-react'

const PostJob = () => {
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);
    const { createJob } = useJobMutations();

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        position: 1,
        companyId: ""
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, companyId: value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await createJob.mutateAsync(input);
            toast.success("Job posted successfully");
            navigate("/admin/jobs");
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
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

                        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <p className="section-label">Admin</p>
                                    <h1 className="font-display font-bold text-2xl text-foreground">Post a Job</h1>
                                </div>
                            </div>

                            <form onSubmit={submitHandler} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input name="title" value={input.title} onChange={changeEventHandler} placeholder="e.g. Senior Frontend Engineer" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <select
                                            name="companyId"
                                            value={input.companyId}
                                            onChange={(e) => selectChangeHandler(e.target.value)}
                                            className="w-full h-10 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                        >
                                            <option value="">Select a company</option>
                                            {companies.map((company) => (
                                                <option key={company._id} value={company._id}>{company.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input name="location" value={input.location} onChange={changeEventHandler} placeholder="City or Remote" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Type</Label>
                                        <Input name="jobType" value={input.jobType} onChange={changeEventHandler} placeholder="Full-time" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Experience</Label>
                                        <Input name="experienceLevel" value={input.experienceLevel} onChange={changeEventHandler} placeholder="2+ years" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Salary</Label>
                                        <Input name="salary" value={input.salary} onChange={changeEventHandler} placeholder="e.g. 10-15 LPA" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Openings</Label>
                                        <Input type="number" name="position" value={input.position} onChange={changeEventHandler} className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <textarea
                                        name="description"
                                        value={input.description}
                                        onChange={changeEventHandler}
                                        placeholder="Describe the role..."
                                        rows={4}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Requirements</Label>
                                    <textarea
                                        name="requirements"
                                        value={input.requirements}
                                        onChange={changeEventHandler}
                                        placeholder="List requirements..."
                                        rows={4}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" className="flex-1 border-border hover:bg-surface-elevated" onClick={() => navigate("/admin/jobs")}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 btn-neon" disabled={createJob.isPending}>
                                        {createJob.isPending ? "Posting..." : "Post Job"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default PostJob

