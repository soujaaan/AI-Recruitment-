import React from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import { useSelector } from 'react-redux'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import SectionHeader from './common/SectionHeader'
import EmptyState from './common/EmptyState'

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);

    const titleObj = {
        normal: "Explore",
        highlight: "Everything"
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="02 — Browse"
                        title={titleObj}
                        subtitle="All open positions across every category, company, and location."
                    />

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allJobs.length <= 0 ? (
                            <div className="col-span-full">
                                <EmptyState title="No jobs found" description="Try again later." />
                            </div>
                        ) : (
                            allJobs.map((job) => (
                                <Job key={job._id} job={job} />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Browse

