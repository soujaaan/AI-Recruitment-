import React from 'react'
import Navbar from './shared/Navbar'
import { useSelector } from 'react-redux'
import CandidateDashboard from './dashboard/CandidateDashboard'
import RecruiterDashboard from './dashboard/RecruiterDashboard'
import SystemAdminDashboard from './system-admin/SystemAdminDashboard'

const Dashboard = () => {
    const { user } = useSelector(store => store.auth);

    if (user?.role === 'admin') {
        return <SystemAdminDashboard />;
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            {user?.role === 'candidate' ? <CandidateDashboard /> : <RecruiterDashboard />}
        </div>
    )
}

export default Dashboard

