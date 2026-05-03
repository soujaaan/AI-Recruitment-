import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { ADMIN_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Users, Building2, Briefcase, FileText, Activity, LayoutDashboard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    
    // Data States
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [logs, setLogs] = useState([]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/analytics`, { withCredentials: true });
            if (res.data.success) {
                setAnalytics(res.data.data.overview);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/users`, { withCredentials: true });
            if (res.data.success) {
                setUsers(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/companies`, { withCredentials: true });
            if (res.data.success) {
                setCompanies(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/jobs`, { withCredentials: true });
            if (res.data.success) {
                setJobs(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/applications`, { withCredentials: true });
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${ADMIN_API_END_POINT}/logs`, { withCredentials: true });
            if (res.data.success) {
                setLogs(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'overview') fetchAnalytics();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'companies') fetchCompanies();
        if (activeTab === 'jobs') fetchJobs();
        if (activeTab === 'applications') fetchApplications();
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const handleAction = async (method, url, data = {}, successMsg) => {
        try {
            const res = await axios({
                method,
                url: `${ADMIN_API_END_POINT}${url}`,
                data,
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(successMsg || res.data.message);
                // Refetch current tab
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'companies') fetchCompanies();
                if (activeTab === 'jobs') fetchJobs();
                if (activeTab === 'applications') fetchApplications();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const renderTabs = () => {
        const tabs = [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'companies', label: 'Companies', icon: Building2 },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'applications', label: 'Applications', icon: FileText },
            { id: 'logs', label: 'Admin Logs', icon: Activity },
        ];

        return (
            <div className="flex overflow-x-auto space-x-4 mb-8 pb-2 border-b border-[#222222]">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                                    : 'text-gray-400 hover:text-white hover:bg-[#222222]'
                            }`}
                        >
                            <Icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderOverview = () => {
        if (!analytics) return <div className="text-center py-10">Loading...</div>;
        
        const chartData = analytics.statusCounts ? analytics.statusCounts.map(s => ({ name: s._id, value: s.count })) : [];

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="stat-card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
                        <p className="text-3xl font-bold gradient-text">{analytics.totalUsers}</p>
                        <div className="text-xs text-gray-500 mt-2">({analytics.totalCandidates} Candidates, {analytics.totalRecruiters} Recruiters)</div>
                    </div>
                    <div className="stat-card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Companies</h3>
                        <p className="text-3xl font-bold gradient-text">{analytics.totalCompanies}</p>
                    </div>
                    <div className="stat-card">
                        <h3 className="text-gray-400 text-sm mb-2">Conversion Rate</h3>
                        <p className="text-3xl font-bold gradient-text">{analytics.conversionRate}</p>
                        <div className="text-xs text-gray-500 mt-2">(Applied → Shortlisted)</div>
                    </div>
                    <div className="stat-card">
                        <h3 className="text-gray-400 text-sm mb-2">Total Applications</h3>
                        <p className="text-3xl font-bold gradient-text">{analytics.totalApplications}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 h-[400px]">
                        <h3 className="text-lg font-bold mb-6 text-white">Application Statuses</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #00ff88', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="value" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#00ff88', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-6 h-[400px]">
                        <h3 className="text-lg font-bold mb-6 text-white">Top Recruiters</h3>
                        <div className="space-y-4">
                            {analytics.jobsPerRecruiter?.map((r, i) => (
                                <div key={i} className="flex items-center justify-between bg-[#111] p-3 rounded-lg border border-[#222]">
                                    <span className="text-white font-medium">{r.recruiterName}</span>
                                    <span className="text-[#00ff88]">{r.count} Jobs</span>
                                </div>
                            ))}
                            {(!analytics.jobsPerRecruiter || analytics.jobsPerRecruiter.length === 0) && (
                                <div className="text-gray-500 text-sm">No recruiter data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderUsers = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#222222]">
                            <th className="p-4 text-gray-400">Name</th>
                            <th className="p-4 text-gray-400">Email</th>
                            <th className="p-4 text-gray-400">Role</th>
                            <th className="p-4 text-gray-400">Status</th>
                            <th className="p-4 text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b border-[#222222] hover:bg-[#111111] transition-colors">
                                <td className="p-4">{u.fullname}</td>
                                <td className="p-4">{u.email}</td>
                                <td className="p-4 capitalize">{u.role}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${u.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {u.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    <button 
                                        onClick={() => handleAction('put', `/users/${u._id}/block`)}
                                        className="btn-neon-outline px-3 py-1 text-sm border-gray-600 text-gray-300 hover:border-[#00ff88] hover:text-[#00ff88]"
                                    >
                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderCompanies = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#222222]">
                            <th className="p-4 text-gray-400">Company Name</th>
                            <th className="p-4 text-gray-400">Website</th>
                            <th className="p-4 text-gray-400">Created By</th>
                            <th className="p-4 text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c._id} className="border-b border-[#222222] hover:bg-[#111111] transition-colors">
                                <td className="p-4 font-medium">{c.name}</td>
                                <td className="p-4 text-blue-400 hover:underline"><a href={c.website} target="_blank" rel="noreferrer">{c.website}</a></td>
                                <td className="p-4">{c.userId?.fullname || 'Unknown'}</td>
                                <td className="p-4">
                                    <button 
                                        onClick={() => handleAction('delete', `/companies/${c._id}`)}
                                        className="btn-neon-outline px-3 py-1 text-sm border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderJobs = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#222222]">
                            <th className="p-4 text-gray-400">Title</th>
                            <th className="p-4 text-gray-400">Company</th>
                            <th className="p-4 text-gray-400">Recruiter</th>
                            <th className="p-4 text-gray-400">Status</th>
                            <th className="p-4 text-gray-400">Flags</th>
                            <th className="p-4 text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(j => (
                            <tr key={j._id} className="border-b border-[#222222] hover:bg-[#111111] transition-colors">
                                <td className="p-4 font-medium">{j.title}</td>
                                <td className="p-4">{j.company?.name || 'Unknown'}</td>
                                <td className="p-4">{j.created_by?.fullname || 'Unknown'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${j.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {j.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {j.isFlagged && <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs">Flagged</span>}
                                </td>
                                <td className="p-4 space-x-2">
                                    <button 
                                        onClick={() => handleAction('put', `/jobs/${j._id}/toggle-active`)}
                                        className="btn-neon-outline px-3 py-1 text-sm border-gray-600 text-gray-300 hover:border-[#00ff88]"
                                    >
                                        {j.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                    <button 
                                        onClick={() => handleAction('put', `/jobs/${j._id}/flag`)}
                                        className="btn-neon-outline px-3 py-1 text-sm border-gray-600 text-yellow-500 hover:border-yellow-500"
                                    >
                                        {j.isFlagged ? 'Unflag' : 'Flag'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderApplications = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#222222]">
                            <th className="p-4 text-gray-400">Applicant</th>
                            <th className="p-4 text-gray-400">Job</th>
                            <th className="p-4 text-gray-400">Company</th>
                            <th className="p-4 text-gray-400">Status</th>
                            <th className="p-4 text-gray-400">Override Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(a => (
                            <tr key={a._id} className="border-b border-[#222222] hover:bg-[#111111] transition-colors">
                                <td className="p-4">{a.applicant?.fullname || 'Unknown'}</td>
                                <td className="p-4">{a.job?.title || 'Unknown'}</td>
                                <td className="p-4">{a.job?.company?.name || 'Unknown'}</td>
                                <td className="p-4 capitalize">
                                    <span className="px-2 py-1 rounded-full bg-gray-800 text-xs">{a.status}</span>
                                </td>
                                <td className="p-4">
                                    <select 
                                        className="bg-[#111] border border-[#222] rounded px-2 py-1 text-sm focus:border-[#00ff88] outline-none"
                                        value={a.status}
                                        onChange={(e) => handleAction('put', `/applications/${a._id}/status`, { status: e.target.value })}
                                    >
                                        <option value="applied">Applied</option>
                                        <option value="shortlisted">Shortlisted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderLogs = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
                {logs.map(log => (
                    <div key={log._id} className="glass-card p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[#00ff88] font-mono text-sm">[{new Date(log.createdAt).toLocaleString()}]</span>
                            <span className="ml-4 font-bold text-white">{log.action}</span>
                            <span className="ml-2 text-gray-400">by {log.adminId?.fullname} ({log.adminId?.email})</span>
                        </div>
                        <div className="text-gray-400 text-sm">{log.details}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pt-24">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold gradient-text mb-2">System Governor</h1>
                    <p className="text-gray-400">Full visibility, controlled intervention, real-time analytics.</p>
                </div>
                
                {renderTabs()}

                <div className="glass-card p-6 min-h-[500px]">
                    {loading && activeTab !== 'overview' ? (
                        <div className="text-center py-20 text-[#00ff88]">Loading data...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'users' && renderUsers()}
                            {activeTab === 'companies' && renderCompanies()}
                            {activeTab === 'jobs' && renderJobs()}
                            {activeTab === 'applications' && renderApplications()}
                            {activeTab === 'logs' && renderLogs()}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SystemAdminDashboard;
