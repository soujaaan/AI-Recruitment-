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
import { Search } from 'lucide-react'
import JobIllustration from '@/assets/illustrations/JobIllustration.png'

const Jobs = () => {

    const { allJobs, jobPagination } = useSelector(store => store.job);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useGetAllJobs({
        page: 1,
        limit: 12,
        search: debouncedQuery || undefined
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="bg-[#0a0a0a] min-h-screen overflow-hidden">

            <Navbar />

            <section className="relative py-14 px-6">

                {/* Background Glow */}
                <div className="
                    absolute
                    top-0
                    right-0
                    w-[500px]
                    h-[500px]
                    bg-[#00ff88]/5
                    blur-[140px]
                    rounded-full
                    pointer-events-none
                " />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* HERO SECTION */}
                    <div className="
                        grid
                        lg:grid-cols-2
                        gap-10
                        items-center
                    ">

                        {/* LEFT CONTENT */}
                        <div>

                            <SectionHeader
                                label="02 — Jobs"
                                title={
                                    <>
                                        Discover{" "}
                                        <span className="gradient-text">
                                            Your Next Opportunity
                                        </span>
                                    </>
                                }
                                subtitle="Browse thousands of curated openings tailored to your skills, location, and career goals."
                            />

                            {/* Search Bar */}
                            <div className="mt-8 max-w-2xl">

                                <div className="relative">

                                    <Search className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        w-4 h-4
                                        text-muted-foreground
                                    " />

                                    <Input
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Search by role, company, or keyword..."
                                        className="
                                            pl-11
                                            py-6
                                            bg-surface
                                            border-border
                                            rounded-2xl
                                            text-foreground
                                            placeholder:text-muted-foreground
                                            focus:border-accent
                                            focus:ring-accent/20
                                            transition-all
                                        "
                                    />

                                </div>

                            </div>

                        </div>

                        {/* RIGHT ILLUSTRATION */}
                        <div className="
                            hidden
                            lg:flex
                            justify-center
                            items-center
                            relative
                        ">

                            {/* Soft Emerald Radial Glow Behind Image */}
                            <div className="
                                absolute
                                w-[450px]
                                h-[450px]
                                rounded-full
                                bg-[#10b981]/15
                                blur-[120px]
                                pointer-events-none
                                z-0
                            " />

                            {/* Illustration */}
                            <img
                                src={JobIllustration}
                                alt="Job Search Illustration"
                                loading="lazy"
                                className="
                                    relative
                                    z-10
                                    w-full
                                    max-w-[620px]
                                    object-contain
                                    opacity-95
                                    animate-float
                                    drop-shadow-[0_0_35px_rgba(16,185,129,0.25)]
                                    transition-all
                                    duration-500
                                    hover:scale-[1.02]
                                "
                            />

                        </div>

                    </div>

                    {/* MAIN CONTENT */}
                    <div className="
                        mt-12
                        grid
                        grid-cols-1
                        lg:grid-cols-12
                        gap-8
                    ">

                        {/* FILTER SIDEBAR */}
                        <div className="lg:col-span-3">

                            <div className="lg:sticky lg:top-24">

                                <FilterCard />

                            </div>

                        </div>

                        {/* JOB GRID */}
                        <div className="lg:col-span-9">

                            {allJobs.length <= 0 ? (

                                <EmptyState
                                    title="No jobs found"
                                    description="Try adjusting your filters or search query."
                                />

                            ) : (

                                <>
                                    <div className="
                                        grid
                                        grid-cols-1
                                        md:grid-cols-2
                                        gap-6
                                    ">

                                        {allJobs.map((job, index) => (

                                            <motion.div
                                                key={job._id}
                                                initial={{
                                                    opacity: 0,
                                                    y: 30
                                                }}
                                                whileInView={{
                                                    opacity: 1,
                                                    y: 0
                                                }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: index * 0.04
                                                }}
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