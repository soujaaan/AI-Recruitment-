import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search, ArrowRight } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ff88]/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#00ff88]/5 to-emerald-500/5 rounded-full blur-[100px] animate-blob pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-teal-500/5 to-[#00ff88]/5 rounded-full blur-[90px] animate-blob animation-delay-2000 pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-5xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        AI-Powered Recruitment Platform
                    </div>

                    <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-white">
                        Find Your <br />
                        <span className="gradient-text">Dream Career</span>
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Intelligent job matching, AI resume analysis, and interview preparation — 
                        all in one powerful platform.
                    </p>

                    <div className="mt-10 flex w-full max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center bg-surface border border-border rounded-l-2xl px-6 py-4 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-300">
                            <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                            <input
                                type="text"
                                placeholder='Search roles, companies, skills...'
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                                className='outline-none border-none flex-1 text-foreground bg-transparent placeholder:text-muted-foreground text-lg'
                            />
                        </div>
                        <Button 
                            onClick={searchJobHandler} 
                            className="btn-neon rounded-l-none rounded-r-2xl h-auto px-8 text-base"
                        >
                            Search
                            <ArrowRight className='ml-2 h-5 w-5' />
                        </Button>
                    </div>

                    {/* CTA to auth section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-8"
                    >
                        <Button
                            variant="outline"
                            className="btn-neon-outline px-8 py-6 text-base"
                            onClick={() => {
                                const el = document.getElementById('auth-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Get Started
                            <ArrowRight className='ml-2 h-5 w-5' />
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                >
                    {[
                        { value: "10K+", label: "Job Openings" },
                        { value: "500+", label: "Companies" },
                        { value: "1M+", label: "Applications" },
                        { value: "98%", label: "Match Accuracy" },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-6 text-center">
                            <span className="block font-display font-bold text-2xl md:text-3xl text-accent">{stat.value}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1 block">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default HeroSection

