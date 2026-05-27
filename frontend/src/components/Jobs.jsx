import React, { useState, useEffect, useMemo } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import SectionHeader from './common/SectionHeader'
import EmptyState from './common/EmptyState'
import Pagination from './common/Pagination'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { Search, Sparkles } from 'lucide-react'
import { Input } from './ui/input'

const Jobs = () => {
    const { allJobs, jobPagination, searchedQuery, personalized } = useSelector(store => store.job);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [page, setPage] = useState(1);

    const jobParams = useMemo(() => {
        const params = {
            page,
            limit: 12,
        };

        if (debouncedQuery) {
            params.search = debouncedQuery;
        }

        if (searchedQuery && typeof searchedQuery === "object") {
            Object.entries(searchedQuery).forEach(([key, value]) => {
                if (value) params[key] = value;
            });
        }

        return params;
    }, [page, debouncedQuery, searchedQuery]);

    useGetAllJobs(jobParams);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [searchedQuery]);

    const subtitle = personalized
        ? "AI-ranked openings matched to your skills, experience, and preferences."
        : "Browse thousands of curated openings tailored to your skills, location, and career goals.";

    return (
        <div className="bg-[#0a0a0a] min-h-screen overflow-hidden">

            <Navbar />

            <section className="relative py-14 px-6">

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

                    <div className="max-w-4xl">

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
                            subtitle={subtitle}
                        />

                        {personalized && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
                                <Sparkles className="w-3.5 h-3.5" />
                                Personalized for you
                            </div>
                        )}

                        <div className="mt-6 max-w-2xl">

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

                    <div className="
                        mt-12
                        grid
                        grid-cols-1
                        lg:grid-cols-12
                        gap-8
                    ">

                        <div className="lg:col-span-3">

                            <div className="lg:sticky lg:top-24">

                                <FilterCard />

                            </div>

                        </div>

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

                                    <Pagination
                                        pagination={jobPagination}
                                        onPageChange={setPage}
                                    />

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
