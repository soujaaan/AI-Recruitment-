import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useJobMutations } from '@/hooks/useJobMutations'
import { useGetCompaniesQuery } from '@/hooks/useCompanyMutations'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase, Building2 } from 'lucide-react'

// Controlled dropdown options
const JOB_TYPES = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "CONTRACT", label: "Contract" },
];

const EXPERIENCE_LEVELS = [
    { value: "0-1", label: "0-1 years" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5+", label: "5+ years" },
];

const SALARY_RANGES = [
    { value: "3-5 LPA", label: "3-5 LPA" },
    { value: "5-10 LPA", label: "5-10 LPA" },
    { value: "10-20 LPA", label: "10-20 LPA" },
    { value: "20+ LPA", label: "20+ LPA" },
];

const PostJob = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { createJob } = useJobMutations();
    
    // Fetch companies
    const { data: companiesData, isLoading: companiesLoading } = useGetCompaniesQuery();
    const companies = companiesData?.companies || [];

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salaryRange: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        openings: 1,
        companyId: ""
    });

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        
        // Handle number conversion for openings
        if (name === "openings") {
            const num = parseInt(value) || 0;
            setInput({ ...input, [name]: num });
            return;
        }
        
        setInput({ ...input, [name]: value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!input.companyId) {
            toast.error("Please select a company");
            return;
        }

        const selectedCompany = companies.find(c => c._id === input.companyId);
        if (!selectedCompany) {
            toast.error("Selected company not found");
            return;
        }
        
        try {
            // Transform form data to match backend schema exactly
            const payload = {
                title: input.title,
                description: input.description,
                jobType: input.jobType,
                experienceLevel: input.experienceLevel,
                salaryRange: input.salaryRange,
                openings: input.openings,
                location: input.location,
                // Convert requirements string to array
                requirements: input.requirements 
                    ? input.requirements.split(",").map(r => r.trim()).filter(Boolean)
                    : [],
                company: {
                    name: selectedCompany.name,
                    website: selectedCompany.website || "",
                    location: selectedCompany.location || "",
                    logo: selectedCompany.logo || ""
                }
            };
            
            await createJob.mutateAsync(payload);
            toast.success("Job posted successfully");
            navigate("/admin/jobs");
        } catch (error) {
            toast.error(error.message);
        }
    }

    if (!companiesLoading && companies.length === 0) {
        return (
            <div className="bg-[#0a0a0a] min-h-screen">
                <Navbar />
                <section className="py-20 px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface/50 border border-border rounded-2xl p-10"
                        >
                            <Building2 className="w-16 h-16 text-accent mx-auto mb-6 opacity-80" />
                            <h2 className="text-2xl font-bold text-foreground mb-3">No Company Registered</h2>
                            <p className="text-muted-foreground mb-8">
                                You must register a company first before you can post any jobs on the platform.
                            </p>
                            <Button onClick={() => navigate("/admin/companies/create")} className="btn-neon">
                                Register a Company
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </div>
        );
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

                            {companiesLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                </div>
                            ) : (
                                <form onSubmit={submitHandler} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>Job Title</Label>
                                            <Input name="title" value={input.title} onChange={changeEventHandler} placeholder="e.g. Senior Frontend Engineer" className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Select Company</Label>
                                            <select
                                                name="companyId"
                                                value={input.companyId}
                                                onChange={changeEventHandler}
                                                className="w-full h-10 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            >
                                                <option value="">-- Choose a company --</option>
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
                                            <select
                                                name="jobType"
                                                value={input.jobType}
                                                onChange={changeEventHandler}
                                                className="w-full h-10 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            >
                                                <option value="">Select Job Type</option>
                                                {JOB_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Experience</Label>
                                            <select
                                                name="experienceLevel"
                                                value={input.experienceLevel}
                                                onChange={changeEventHandler}
                                                className="w-full h-10 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            >
                                                <option value="">Select Experience</option>
                                                {EXPERIENCE_LEVELS.map((exp) => (
                                                    <option key={exp.value} value={exp.value}>{exp.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>Salary</Label>
                                            <select
                                                name="salaryRange"
                                                value={input.salaryRange}
                                                onChange={changeEventHandler}
                                                className="w-full h-10 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                            >
                                                <option value="">Select Salary Range</option>
                                                {SALARY_RANGES.map((range) => (
                                                    <option key={range.value} value={range.value}>{range.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Openings</Label>
                                            <Input type="number" name="openings" value={input.openings} onChange={changeEventHandler} className="bg-surface-elevated border-border focus:border-accent focus:ring-accent/20" />
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
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default PostJob
