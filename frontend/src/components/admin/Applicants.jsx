import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import { useParams } from 'react-router-dom'
import useGetJobById from '@/hooks/useGetJobById'
import { motion } from 'framer-motion'
import SectionHeader from '../common/SectionHeader'
import { Briefcase, Building2 } from 'lucide-react'

const Applicants = () => {
    const params = useParams();
    useGetJobById(params.id);

    const titleObj = {
        normal: "Candidate",
        highlight: "Applications"
    };

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="01 — Applicants"
                        title={titleObj}
                        subtitle="Review and manage applicants for this role."
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mt-8"
                    >
                        <ApplicantsTable />
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default Applicants

