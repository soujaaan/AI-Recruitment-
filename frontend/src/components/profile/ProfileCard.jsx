import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, FileText, Edit3, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import GlassCard from '../common/GlassCard';

const ProfileCard = ({ user, setOpen }) => {
    const initials = user?.fullname?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
        >
            <GlassCard className="relative overflow-hidden text-center group">
                {/* Subtle Glow Background */}
                <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-3xl -z-10 group-hover:bg-accent/10 transition-colors duration-500" />
                
                <div className="relative inline-block mt-4">
                    <Avatar className="w-24 h-24 mx-auto border-2 border-accent/30 shadow-[0_0_20px_rgba(0,255,136,0.2)] group-hover:shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-shadow">
                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                        <AvatarFallback className="bg-surface-elevated text-xl font-display text-accent">{initials}</AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => setOpen(true)}
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent text-[#0a0a0a] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>

                <h2 className="font-display font-bold text-2xl text-foreground mt-5">{user?.fullname}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 mt-2 text-sm text-accent capitalize shadow-sm backdrop-blur-sm">
                    {user?.role || 'Candidate'}
                </div>

                <div className="mt-8 space-y-4 text-left">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-2 rounded-lg bg-white/5 text-accent"><Mail className="w-4 h-4" /></div>
                        {user?.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-2 rounded-lg bg-white/5 text-purple-400"><Phone className="w-4 h-4" /></div>
                        {user?.phoneNumber || 'Add phone number'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-2 rounded-lg bg-white/5 text-cyan-400"><MapPin className="w-4 h-4" /></div>
                        {user?.profile?.location || 'Add location'}
                    </div>
                    <div className="pt-4">
                        <Link 
                            to="/profile/build-resume" 
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00ff88]/20 to-[#00ff88]/10 hover:from-[#00ff88]/30 hover:to-[#00ff88]/20 border border-[#00ff88]/30 hover:border-[#00ff88]/50 text-accent font-medium backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:-translate-y-0.5 group"
                        >
                            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Build Resume
                        </Link>
                    </div>
                </div>

                {user?.profile?.skills?.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {user.profile.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-2.5 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors cursor-default">
                                {skill}
                            </span>
                        ))}
                        {user.profile.skills.length > 5 && (
                            <span className="px-2.5 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                +{user.profile.skills.length - 5}
                            </span>
                        )}
                    </div>
                )}

                <Button
                    className="w-full mt-8 btn-neon-outline group/btn relative overflow-hidden"
                    onClick={() => setOpen(true)}
                >
                    <span className="relative z-10 flex items-center justify-center">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </span>
                </Button>
            </GlassCard>
        </motion.div>
    );
};

export default ProfileCard;
