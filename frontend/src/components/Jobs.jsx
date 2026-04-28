import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import SectionHeader from './common/SectionHeader'
import EmptyState from './common/EmptyState'
import Pagination from './common/Pagination'

const Jobs = () => {
    const { allJobs, jobPagination } = useSelector(store => store.job);
    const [filterOpen, setFilterOpen] = useState(false);

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

