import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import { useSelector } from 'react-redux';
import UpdateProfileDialog from './UpdateProfileDialog';
import ProfileHeader from './profile/ProfileHeader';
import ProfileCard from './profile/ProfileCard';
import ProfileCompletion from './profile/ProfileCompletion';
import AIResumeWorkspace from './profile/AIResumeWorkspace';
import ApplicationTracker from './profile/ApplicationTracker';
import AIAssistant from './profile/AIAssistant';
import RecentActivity from './profile/RecentActivity';

const Profile = () => {
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div className="bg-[#0a0a0a] min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent blur-3xl rounded-full mix-blend-screen" />
            </div>

            <Navbar />
            
            {/* Main Page Container */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10 min-h-screen">
                {/* Header */}
                <ProfileHeader />

                {/* MAIN GRID: ONLY 2 columns (LEFT SIDEBAR + MAIN DASHBOARD) */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <ProfileCard user={user} setOpen={setOpen} />
                        <ProfileCompletion user={user} />
                    </div>

                    {/* MAIN DASHBOARD */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <AIResumeWorkspace />
                        <ApplicationTracker />

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AIAssistant />
                            <RecentActivity />
                        </div>
                    </div>
                </div>
            </main>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;
