import React, { useState, useEffect } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import SectionHeader from './common/SectionHeader'
import EmptyState from './common/EmptyState'
import Pagination from './common/Pagination'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { Input } from './ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'

const Jobs = () => {
    const { allJobs, jobPagination } = useSelector(store => store.job);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useGetAllJobs({ page: 1, limit: 12, search: debouncedQuery || undefined });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="02 — Jobs"
                        title="All <span class='gradient-text'>Openings</span>"
                        subtitle="Browse every opportunity on the platform. Filter by role, location, and salary to find your match."
                    />

                    {/* Search Bar */}
                    <div className="mt-8 max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by job title, company, or keywords..."
                                className="pl-11 py-5 bg-surface border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                            />
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Filter */}
                        <div className="lg:col-span-3">
                            <div className="lg:sticky lg:top-24">
                                <FilterCard />
                            </div>
                        </div>

                        {/* Job Grid */}
                        <div className="lg:col-span-9">
                            {allJobs.length <= 0 ? (
                                <EmptyState
                                    title="No jobs found"
                                    description="Try adjusting your filters or search query."
                                />
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {allJobs.map((job, index) => (
                                            <motion.div
                                                key={job._id}
                                                initial={{ opacity: 0, y: 40 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                            >
                                                <Job job={job} />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <Pagination pagination={jobPagination} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Jobs

