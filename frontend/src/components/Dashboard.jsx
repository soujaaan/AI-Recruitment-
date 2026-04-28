import React from 'react'
import Navbar from './shared/Navbar'
import { useSelector } from 'react-redux'
import CandidateDashboard from './dashboard/CandidateDashboard'
import RecruiterDashboard from './dashboard/RecruiterDashboard'

const Dashboard = () => {
    const { user } = useSelector(store => store.auth);

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            <Navbar />
            {user?.role === 'candidate' ? <CandidateDashboard /> : <RecruiterDashboard />}
        </div>
    )
}

export default Dashboard

