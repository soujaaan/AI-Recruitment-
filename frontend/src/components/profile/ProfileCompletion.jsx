import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Target } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useSelector } from 'react-redux';

const ProfileCompletion = ({ user }) => {
    const { profile: resumeProfile } = useSelector(state => state.resume);

    const checklist = useMemo(() => {
        const hasResumeBuilt = !!resumeProfile;
const edu = resumeProfile?.education || {};
        // education is an OBJECT in Mongo schema (graduation/postGraduation/secondary/higherSecondary)
        const hasEducation = !!(
            edu?.graduation?.college ||
            edu?.postGraduation?.college ||
            edu?.secondary?.school ||
            edu?.higherSecondary?.school
        );
        const hasExperience = Array.isArray(resumeProfile?.experience) && resumeProfile.experience.length > 0;
        const hasProjects = Array.isArray(resumeProfile?.projects) && resumeProfile.projects.length > 0;
        
        console.log("Profile Strength calculation - Resume Data:", resumeProfile);

        return [
            { label: "Basic Info Added", isComplete: !!(user?.fullname && user?.email) },
            { label: "Contact Info Added", isComplete: !!user?.phoneNumber },
            { label: "Resume Built", isComplete: hasResumeBuilt && (hasEducation || hasExperience || hasProjects || !!resumeProfile?.skills?.length) },
            { label: "Education Added", isComplete: hasEducation },
            { label: "Experience Added", isComplete: hasExperience },
            { label: "Projects Added", isComplete: hasProjects },
        ];
    }, [user, resumeProfile]);

    const completedCount = checklist.filter(item => item.isComplete).length;

    // Ensure we never show an incorrect fixed percentage.
    // If resumeProfile exists but sections are empty, this will now reflect correctly.
    const completionPercentage = Math.round((completedCount / checklist.length) * 100);

    const isComplete = completionPercentage === 100;
    const progressColor = isComplete ? 'bg-[#00ff88]' : (completionPercentage >= 60 ? 'bg-amber-400' : 'bg-red-400');
    const progressShadow = isComplete ? 'shadow-[0_0_10px_#00ff88]' : (completionPercentage >= 60 ? 'shadow-[0_0_10px_#fbbf24]' : 'shadow-[0_0_10px_#f87171]');

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -5 }}
        >
            <GlassCard className="relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Profile Strength</span>
                    </div>
                    <span className={`text-lg font-bold font-display ${isComplete ? 'text-[#00ff88]' : (completionPercentage >= 60 ? 'text-amber-400' : 'text-red-400')}`}>
                        {completionPercentage}%
                    </span>
                </div>
                
                <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden mb-6 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${progressColor} ${progressShadow}`}
                    />
                </div>

                <ul className="space-y-3">
                    {checklist.map((item, index) => (
                        <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                            className="flex items-center gap-3 text-sm"
                        >
                            {item.isComplete ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <span className={item.isComplete ? "text-muted-foreground" : "text-foreground font-medium"}>
                                {item.label}
                            </span>
                        </motion.li>
                    ))}
                </ul>

                <div className={`mt-6 p-3 rounded-lg text-xs flex items-start gap-2 bg-white/5 border border-white/5 backdrop-blur-sm ${isComplete ? 'text-[#00ff88]' : 'text-amber-400'}`}>
                    {isComplete ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Outstanding! Your profile is fully optimized for top recruiters.</p>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Complete missing details above to increase your visibility to top companies.</p>
                        </>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default ProfileCompletion;
