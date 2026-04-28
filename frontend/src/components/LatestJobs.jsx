import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import LoadingScreen from './common/LoadingScreen';
import EmptyState from './common/EmptyState';
import SectionHeader from './common/SectionHeader';

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);

    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <SectionHeader
                    label="03 — Openings"
                    title={<>Latest <span className="gradient-text">Job Openings</span></>}
                    className="mb-12"
                />

                {!allJobs.length ? (
                    <LoadingScreen label="Preparing latest jobs..." />
                ) : allJobs.length <= 0 ? (
                    <EmptyState title="No jobs available" description="We are still sourcing fresh openings." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {allJobs.slice(0, 8).map((job, index) => (
                            <LatestJobCards key={job._id} job={job} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default LatestJobs

