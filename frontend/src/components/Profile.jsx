import React, { useState, useMemo } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import UpdateProfileDialog from './UpdateProfileDialog'
import AppliedJobTable from './AppliedJobTable'
import { motion } from 'framer-motion'
import SectionHeader from './common/SectionHeader'
import GlassCard from './common/GlassCard'
import { Mail, Phone, FileText, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react'

const Profile = () => {
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    const completion = useMemo(() => {
        const fields = [
            user?.fullname,
            user?.email,
            user?.phoneNumber,
            user?.profile?.bio,
            user?.profile?.skills?.length > 0,
            user?.profile?.resume,
            user?.profile?.profilePhoto
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }, [user]);

    const isProfileComplete = completion >= 80;

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
                        <div className="lg:col-span-4 space-y-6">
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

                            {/* Completion Meter */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <GlassCard>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-foreground">Profile Completion</span>
                                        <span className={`text-sm font-bold ${isProfileComplete ? 'text-[#00ff88]' : 'text-amber-400'}`}>
                                            {completion}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completion}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className={`h-full rounded-full ${isProfileComplete ? 'bg-[#00ff88]' : 'bg-amber-400'}`}
                                        />
                                    </div>
                                    {!isProfileComplete && (
                                        <div className="flex items-start gap-2 mt-3 text-xs text-amber-400">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p>Complete your profile to apply for jobs. Add resume, bio, and skills.</p>
                                        </div>
                                    )}
                                    {isProfileComplete && (
                                        <div className="flex items-center gap-2 mt-3 text-xs text-[#00ff88]">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <p>Your profile is complete. You're ready to apply!</p>
                                        </div>
                                    )}
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

