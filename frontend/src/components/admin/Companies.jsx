import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { Plus, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import SectionHeader from '../common/SectionHeader'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeader
                        label="01 — Admin"
                        title="Your <span class='gradient-text'>Companies</span>"
                        subtitle="Manage organizations you recruit for."
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
                                placeholder="Filter by name..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => navigate("/admin/companies/create")} className="btn-neon whitespace-nowrap">
                            <Plus className="w-4 h-4 mr-2" />
                            New Company
                        </Button>
                    </motion.div>

                    <div className="mt-8">
                        <CompaniesTable filter={input} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Companies

