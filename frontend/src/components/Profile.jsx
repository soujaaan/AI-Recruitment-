import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import UpdateProfileDialog from './UpdateProfileDialog'
import AppliedJobTable from './AppliedJobTable'
import { motion } from 'framer-motion'
import SectionHeader from './common/SectionHeader'
import GlassCard from './common/GlassCard'
import { Mail, Phone, FileText, Edit3 } from 'lucide-react'

const Profile = () => {
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        label="01 — Profile"
                        title="Your <span class='gradient-text'>Profile</span>"
                        subtitle="Manage your personal information and track your applications."
                    />

                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-4">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <GlassCard className="text-center">
                                    <div className="relative inline-block">
                                        <Avatar className="w-24 h-24 mx-auto border-2 border-accent/30">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        </Avatar>
                                        <button
                                            onClick={() => setOpen(true)}
                                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent text-[#0a0a0a] flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h2 className="font-display font-bold text-2xl text-foreground mt-4">{user?.fullname}</h2>
                                    <p className="text-muted-foreground text-sm mt-1 capitalize">{user?.role}</p>

                                    <div className="mt-6 space-y-3 text-left">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4 text-accent" />
                                            {user?.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4 text-accent" />
                                            {user?.phoneNumber}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <FileText className="w-4 h-4 text-accent" />
                                            {user?.profile?.resume ? (
                                                <a href={user?.profile?.resume} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                                    View Resume
                                                </a>
                                            ) : (
                                                "No resume uploaded"
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-6 btn-neon-outline"
                                        onClick={() => setOpen(true)}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </GlassCard>
                            </motion.div>
                        </div>

                        {/* Applications */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <p className="section-label mb-6">02 — Applications</p>
                                <AppliedJobTable />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile

