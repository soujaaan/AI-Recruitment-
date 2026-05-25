import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import AdminJobsTable from './AdminJobsTable'
import { useNavigate } from 'react-router-dom'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import SectionHeader from '../common/SectionHeader'

const AdminJobs = () => {
    useGetAllAdminJobs();
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="01 — Admin"
                        title={<>Manage <span className="gradient-text">Jobs</span></>}
                        subtitle="Review, edit, and track all your job postings."
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-surface border-border focus:border-accent focus:ring-accent/20"
                                placeholder="Filter by title..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button onClick={() => navigate("/admin/jobs/create")} className="btn-neon whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                Post New Job
                            </Button>
                        </div>
                    </motion.div>

                    <div className="mt-8">
                        <AdminJobsTable filter={input} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AdminJobs

