import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, FileText, Code, Briefcase, FolderGit2, GraduationCap, Save, Plus, Trash2, Mail, Phone, MapPin, Link as LinkIcon, Github, Globe, Loader2 } from 'lucide-react';
import SkillMultiSelect from '../components/SkillMultiSelect';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, saveProfile, resetSaveStatus } from '../redux/resumeSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Reusable UI Components
const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden ${className}`}>
        {children}
    </div>
);

const InputField = ({ label, type = "text", placeholder, value, onChange, isTextarea = false, rows = 4, disabled = false }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {isTextarea ? (
            <div className="relative">
                <textarea
                    disabled={disabled}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all duration-300 resize-none disabled:opacity-50"
                    placeholder={placeholder}
                    rows={rows}
                    value={value || ''}
                    onChange={onChange}
                />
            </div>
        ) : (
            <input
                disabled={disabled}
                type={type}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all duration-300 disabled:opacity-50"
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
            />
        )}
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <select
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all duration-300 appearance-none"
            value={value || ''}
            onChange={onChange}
        >
            <option value="" disabled>Select {label}</option>
            {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const SectionHeader = ({ title, icon: Icon, isOpen, onToggle, status }) => {
    const statusColors = {
        completed: 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]',
        partial: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
        incomplete: 'bg-gray-600'
    };

    return (
        <div 
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
            onClick={onToggle}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOpen ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/5 text-muted-foreground'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-medium text-foreground">{title}</h3>
                <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
            </div>
            <div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </div>
        </div>
    );
};

const ResumeSectionCard = ({ title, subtitle, icon, isOpen, onToggle, children, status }) => (
    <GlassCard className="mb-4">
        <SectionHeader title={title} icon={icon} isOpen={isOpen} onToggle={onToggle} status={status} />
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div className="p-6 border-t border-white/5">
                        {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </GlassCard>
);

const LivePreview = ({ data }) => {
    if (!data) return null;
    return (
        <div className="sticky top-8">
            <GlassCard className="h-[800px] flex flex-col p-8 relative overflow-hidden bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                <div className="flex justify-between items-center mb-6 z-10">
                    <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-6 bg-[#00ff88] rounded-full"></span>
                        Live Preview
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-white/10 rounded-md text-muted-foreground">A4 Ratio</span>
                </div>

                <div className="flex-1 bg-white text-black rounded-xl border border-white/10 shadow-inner relative overflow-y-auto custom-scrollbar group font-sans text-sm">
                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center border-b border-gray-300 pb-4">
                            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">{data?.personalInfo?.fullName || 'YOUR NAME'}</h1>
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
                                {data?.personalInfo?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.personalInfo.email}</span>}
                                {data?.personalInfo?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.personalInfo.phone}</span>}
                                {data?.personalInfo?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.personalInfo.location}</span>}
                                {data?.personalInfo?.linkedin && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {data.personalInfo.linkedin}</span>}
                                {data?.personalInfo?.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" /> {data.personalInfo.github}</span>}
                                {data?.personalInfo?.portfolio && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {data.personalInfo.portfolio}</span>}
                            </div>
                        </div>

                        {/* Summary */}
                        {data?.summary && (
                            <div>
                                <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1 text-gray-800">Professional Summary</h2>
                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {data?.skills?.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1 text-gray-800">Tech Stack</h2>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    {(data.skills || []).join(' • ')}
                                </p>
                            </div>
                        )}

                        {/* Experience */}
                        {data?.experience?.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Experience</h2>
                                <div className="space-y-4">
                                    {(data.experience || []).map((exp, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-xs font-bold text-gray-900">{exp?.title || 'Title'} <span className="font-normal text-gray-600">at {exp?.company || 'Company'}</span></h3>
                                                <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap ml-2">
                                                    {exp?.startDate || 'Start'} – {exp?.current ? 'Present' : (exp?.endDate || 'End')}
                                                </span>
                                            </div>
                                            {exp?.location && <div className="text-[10px] italic text-gray-500 mb-1">{exp.location}</div>}
                                            {exp?.responsibilities && (
                                                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-gray-200 mt-1">
                                                    {exp.responsibilities}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {data?.projects?.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Projects</h2>
                                <div className="space-y-3">
                                    {(data.projects || []).map((proj, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-xs font-bold text-gray-900">
                                                    {proj?.title || 'Project'} 
                                                    {proj?.github && <span className="font-normal text-blue-600 ml-1">({proj.github})</span>}
                                                </h3>
                                                {proj?.duration && <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap ml-2">{proj.duration}</span>}
                                            </div>
                                            {proj?.skills?.length > 0 && <div className="text-[10px] italic text-gray-500 mb-1">Stack: {proj.skills.join(', ')}</div>}
                                            {proj?.description && (
                                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap mt-1">
                                                    {proj.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {(data?.education?.graduation?.college || data?.education?.postGraduation?.college || data?.education?.higherSecondary?.school || data?.education?.secondary?.school) && (
                            <div>
                                <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">Education</h2>
                                <div className="space-y-2">
                                    {/* PG */}
                                    {data?.education?.postGraduation?.college && (
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-900">{data.education.postGraduation.degree} in {data.education.postGraduation.specialization}</h3>
                                                <div className="text-[10px] text-gray-600">{data.education.postGraduation.college}, {data.education.postGraduation.university}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-gray-500 block">{data.education.postGraduation.startYear} - {data.education.postGraduation.endYear}</span>
                                                {data.education.postGraduation.cgpa && <span className="text-[10px] text-gray-600 font-medium">Score: {data.education.postGraduation.cgpa}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {/* Graduation */}
                                    {data?.education?.graduation?.college && (
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-900">{data.education.graduation.degree} in {data.education.graduation.specialization}</h3>
                                                <div className="text-[10px] text-gray-600">{data.education.graduation.college}, {data.education.graduation.university}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-gray-500 block">{data.education.graduation.startYear} - {data.education.graduation.endYear}</span>
                                                {data.education.graduation.cgpa && <span className="text-[10px] text-gray-600 font-medium">Score: {data.education.graduation.cgpa}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {/* 12th */}
                                    {data?.education?.higherSecondary?.school && (
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-900">Higher Secondary ({data.education.higherSecondary.board})</h3>
                                                <div className="text-[10px] text-gray-600">{data.education.higherSecondary.school} - {data.education.higherSecondary.stream}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-gray-500 block">Class of {data.education.higherSecondary.passingYear}</span>
                                                {data.education.higherSecondary.score && <span className="text-[10px] text-gray-600 font-medium">Score: {data.education.higherSecondary.score}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {/* 10th */}
                                    {data?.education?.secondary?.school && (
                                        <div className="flex justify-between items-baseline">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-900">Secondary ({data.education.secondary.board})</h3>
                                                <div className="text-[10px] text-gray-600">{data.education.secondary.school}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-gray-500 block">Class of {data.education.secondary.passingYear}</span>
                                                {data.education.secondary.score && <span className="text-[10px] text-gray-600 font-medium">Score: {data.education.secondary.score}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

const BuildResume = () => {
    const [openSection, setOpenSection] = useState('personal');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile, loading, saveLoading, saveSuccess } = useSelector(state => state.resume || {});

    // Safe Initialization
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
        summary: '',
        skills: [],
        experience: [],
        projects: [],
        education: {
            secondary: { school: '', board: '', passingYear: '', score: '' },
            higherSecondary: { school: '', board: '', stream: '', passingYear: '', score: '' },
            graduation: { college: '', degree: '', specialization: '', university: '', startYear: '', endYear: '', cgpa: '' },
            postGraduation: { college: '', degree: '', specialization: '', university: '', startYear: '', endYear: '', cgpa: '' }
        }
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile && Object.keys(profile).length > 0) {
            setFormData({
                personalInfo: {
                    fullName: profile?.personalInfo?.fullName || '',
                    email: profile?.personalInfo?.email || '',
                    phone: profile?.personalInfo?.phone || '',
                    location: profile?.personalInfo?.location || '',
                    linkedin: profile?.personalInfo?.linkedin || '',
                    github: profile?.personalInfo?.github || '',
                    portfolio: profile?.personalInfo?.portfolio || ''
                },
                summary: profile?.summary || '',
                skills: profile?.skills || [],
                experience: profile?.experience || [],
                projects: profile?.projects || [],
                education: {
                    secondary: profile?.education?.secondary || { school: '', board: '', passingYear: '', score: '' },
                    higherSecondary: profile?.education?.higherSecondary || { school: '', board: '', stream: '', passingYear: '', score: '' },
                    graduation: profile?.education?.graduation || { college: '', degree: '', specialization: '', university: '', startYear: '', endYear: '', cgpa: '' },
                    postGraduation: profile?.education?.postGraduation || { college: '', degree: '', specialization: '', university: '', startYear: '', endYear: '', cgpa: '' }
                }
            });
        }
    }, [profile]);

    useEffect(() => {
        if (saveSuccess) {
            toast.success("Profile saved successfully");
            dispatch(resetSaveStatus());
            navigate("/profile");
        }
    }, [saveSuccess, navigate, dispatch]);

    const toggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    // Experience Handlers
    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...(prev.experience || []), { company: '', title: '', type: '', startDate: '', endDate: '', current: false, location: '', skills: [], responsibilities: '' }]
        }));
    };
    const removeExperience = (index) => {
        setFormData(prev => ({ ...prev, experience: (prev.experience || []).filter((_, i) => i !== index) }));
    };
    const updateExperience = (index, field, value) => {
        const updated = [...(formData.experience || [])];
        if (updated[index]) {
            updated[index][field] = value;
            setFormData(prev => ({ ...prev, experience: updated }));
        }
    };

    // Projects Handlers
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), { title: '', description: '', skills: [], github: '', live: '', duration: '', teamSize: 'Individual' }]
        }));
    };
    const removeProject = (index) => {
        setFormData(prev => ({ ...prev, projects: (prev.projects || []).filter((_, i) => i !== index) }));
    };
    const updateProject = (index, field, value) => {
        const updated = [...(formData.projects || [])];
        if (updated[index]) {
            updated[index][field] = value;
            setFormData(prev => ({ ...prev, projects: updated }));
        }
    };

    // Education Handler
    const updateEducation = (level, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: {
                ...(prev.education || {}),
                [level]: { ...(prev.education?.[level] || {}), [field]: value }
            }
        }));
    };

    // Completion Logic
    const getStatus = (section) => {
        if (section === 'personal') {
            const { fullName, email, phone } = formData?.personalInfo || {};
            if (fullName && email && phone) return 'completed';
            if (fullName || email || phone) return 'partial';
            return 'incomplete';
        }
        if (section === 'summary') {
            return (formData?.summary?.length > 0) ? 'completed' : 'incomplete';
        }
        if (section === 'skills') {
            return (formData?.skills?.length >= 3) ? 'completed' : (formData?.skills?.length > 0) ? 'partial' : 'incomplete';
        }
        if (section === 'experience') {
            return (formData?.experience?.length >= 1) ? 'completed' : 'incomplete';
        }
        if (section === 'projects') {
            return (formData?.projects?.length >= 1) ? 'completed' : 'incomplete';
        }
        if (section === 'education') {
            const hasGrad = formData?.education?.graduation?.college;
            const hasPG = formData?.education?.postGraduation?.college;
            return (hasGrad || hasPG) ? 'completed' : 'incomplete';
        }
        return 'incomplete';
    };

    const calculateStrength = () => {
        let score = 0;
        if (getStatus('personal') === 'completed') score += 20;
        if (getStatus('summary') === 'completed') score += 20;
        if (getStatus('skills') === 'completed') score += 20;
        if (getStatus('experience') === 'completed') score += 20;
        if (getStatus('projects') === 'completed') score += 10;
        if (getStatus('education') === 'completed') score += 10;
        return score;
    };

    const handleSave = () => {
        dispatch(saveProfile({ ...formData, completionPercentage: calculateStrength() }));
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#00ff88] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 relative overflow-hidden selection:bg-[#00ff88]/30 font-sans">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#00ff88]/10 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-display font-bold text-foreground mb-2"
                        >
                            Build Your Resume
                        </motion.h1>
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-4"
                        >
                            <p className="text-muted-foreground text-lg">Create an ATS-optimized professional profile</p>
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">
                                Profile Strength: <span className="text-[#00ff88]">{calculateStrength()}%</span>
                            </div>
                        </motion.div>
                    </div>
                    <motion.button
                        disabled={saveLoading}
                        onClick={handleSave}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e67a] disabled:bg-[#00ff88]/50 text-[#0a0a0a] px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] hover:-translate-y-0.5"
                    >
                        {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saveLoading ? 'Saving...' : 'Save Profile'}
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Panel: Form */}
                    <div className="lg:col-span-7 space-y-4">
                        
                        <ResumeSectionCard 
                            title="Personal Information" 
                            icon={User} 
                            isOpen={openSection === 'personal'} 
                            onToggle={() => toggleSection('personal')}
                            status={getStatus('personal')}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Full Name" 
                                        placeholder="e.g. John Doe"
                                        value={formData?.personalInfo?.fullName || ''}
                                        onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), fullName: e.target.value}}))}
                                    />
                                </div>
                                <InputField 
                                    label="Email Address" 
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData?.personalInfo?.email || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), email: e.target.value}}))}
                                />
                                <InputField 
                                    label="Phone Number" 
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData?.personalInfo?.phone || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), phone: e.target.value}}))}
                                />
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Location" 
                                        placeholder="City, State, Country"
                                        value={formData?.personalInfo?.location || ''}
                                        onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), location: e.target.value}}))}
                                    />
                                </div>
                                <InputField 
                                    label="LinkedIn URL" 
                                    placeholder="linkedin.com/in/username"
                                    value={formData?.personalInfo?.linkedin || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), linkedin: e.target.value}}))}
                                />
                                <InputField 
                                    label="GitHub URL" 
                                    placeholder="github.com/username"
                                    value={formData?.personalInfo?.github || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), github: e.target.value}}))}
                                />
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Portfolio Website" 
                                        placeholder="https://yourportfolio.com"
                                        value={formData?.personalInfo?.portfolio || ''}
                                        onChange={(e) => setFormData(prev => ({...prev, personalInfo: {...(prev.personalInfo || {}), portfolio: e.target.value}}))}
                                    />
                                </div>
                            </div>
                        </ResumeSectionCard>

                        <ResumeSectionCard 
                            title="Professional Summary" 
                            icon={FileText} 
                            isOpen={openSection === 'summary'} 
                            onToggle={() => toggleSection('summary')}
                            status={getStatus('summary')}
                        >
                            <div className="mb-4 text-sm text-muted-foreground bg-white/5 p-4 rounded-xl border border-white/5">
                                <strong className="text-foreground">AI Tip:</strong> Keep it concise. Focus on your biggest achievements and the unique value you bring.
                            </div>
                            <InputField 
                                label="Summary" 
                                isTextarea={true}
                                placeholder="A passionate software engineer with 5+ years of experience..."
                                value={formData?.summary || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            />
                        </ResumeSectionCard>

                        <ResumeSectionCard 
                            title="Tech Stack" 
                            icon={Code} 
                            isOpen={openSection === 'skills'} 
                            onToggle={() => toggleSection('skills')}
                            status={getStatus('skills')}
                        >
                            <div className="mb-6 text-sm text-muted-foreground">
                                Add your core technical skills, frameworks, and tools. We'll automatically categorize them for ATS optimization.
                            </div>
                            
                            <div className="mb-2 text-sm font-medium text-foreground">Select Skills</div>
                            <SkillMultiSelect 
                                selectedSkills={formData?.skills || []} 
                                onChange={(newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))} 
                            />
                        </ResumeSectionCard>

                        <ResumeSectionCard 
                            title="Experience" 
                            subtitle="Add your professional work experience and responsibilities"
                            icon={Briefcase} 
                            isOpen={openSection === 'experience'} 
                            onToggle={() => toggleSection('experience')}
                            status={getStatus('experience')}
                        >
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {(formData?.experience || []).map((exp, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl relative group"
                                        >
                                            <button 
                                                onClick={() => removeExperience(index)}
                                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                            <h4 className="text-foreground font-medium mb-4 pr-10">Experience #{index + 1}</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                                <InputField 
                                                    label="Company Name" 
                                                    placeholder="Google, Microsoft..."
                                                    value={exp?.company || ''}
                                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                />
                                                <InputField 
                                                    label="Job Title" 
                                                    placeholder="Software Engineer"
                                                    value={exp?.title || ''}
                                                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                />
                                                <SelectField 
                                                    label="Employment Type" 
                                                    value={exp?.type || ''}
                                                    onChange={(e) => updateExperience(index, 'type', e.target.value)}
                                                    options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']}
                                                />
                                                <InputField 
                                                    label="Location" 
                                                    placeholder="San Francisco, CA (Remote)"
                                                    value={exp?.location || ''}
                                                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                                />
                                                <InputField 
                                                    label="Start Date" 
                                                    type="month"
                                                    value={exp?.startDate || ''}
                                                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                />
                                                <div className="flex flex-col gap-1.5 mb-4">
                                                    <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                                        <span>End Date</span>
                                                        <label className="flex items-center gap-2 cursor-pointer text-xs">
                                                            <input 
                                                                type="checkbox" 
                                                                className="accent-[#00ff88]"
                                                                checked={!!exp?.current}
                                                                onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                                            />
                                                            Currently Working
                                                        </label>
                                                    </label>
                                                    <input
                                                        type="month"
                                                        disabled={!!exp?.current}
                                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#00ff88]/50 disabled:opacity-50 transition-all duration-300"
                                                        value={exp?.current ? '' : (exp?.endDate || '')}
                                                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="mb-2 text-sm font-medium text-muted-foreground">Technologies Used</div>
                                                <SkillMultiSelect 
                                                    selectedSkills={exp?.skills || []} 
                                                    onChange={(newSkills) => updateExperience(index, 'skills', newSkills)} 
                                                />
                                            </div>

                                            <InputField 
                                                label="Responsibilities / Achievements" 
                                                isTextarea={true}
                                                rows={5}
                                                placeholder="• Developed scalable MERN applications&#10;• Improved API response performance&#10;• Collaborated with frontend teams"
                                                value={exp?.responsibilities || ''}
                                                onChange={(e) => updateExperience(index, 'responsibilities', e.target.value)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    onClick={addExperience}
                                    className="w-full py-4 border-2 border-dashed border-white/10 hover:border-[#00ff88]/50 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-[#00ff88] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Experience
                                </button>
                            </div>
                        </ResumeSectionCard>

                        <ResumeSectionCard 
                            title="Projects" 
                            subtitle="Showcase your technical and academic projects"
                            icon={FolderGit2} 
                            isOpen={openSection === 'projects'} 
                            onToggle={() => toggleSection('projects')}
                            status={getStatus('projects')}
                        >
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {(formData?.projects || []).map((proj, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl relative group"
                                        >
                                            <button 
                                                onClick={() => removeProject(index)}
                                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                            <h4 className="text-foreground font-medium mb-4 pr-10">Project #{index + 1}</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                                <div className="md:col-span-2">
                                                    <InputField 
                                                        label="Project Title" 
                                                        placeholder="AI Recruitment Platform"
                                                        value={proj?.title || ''}
                                                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <InputField 
                                                    label="Project Duration" 
                                                    placeholder="Jan 2023 - Present"
                                                    value={proj?.duration || ''}
                                                    onChange={(e) => updateProject(index, 'duration', e.target.value)}
                                                />
                                                <SelectField 
                                                    label="Team / Individual" 
                                                    value={proj?.teamSize || ''}
                                                    onChange={(e) => updateProject(index, 'teamSize', e.target.value)}
                                                    options={['Individual', 'Team (2-4 members)', 'Team (5+ members)']}
                                                />
                                                <InputField 
                                                    label="GitHub Link" 
                                                    placeholder="github.com/username/project"
                                                    value={proj?.github || ''}
                                                    onChange={(e) => updateProject(index, 'github', e.target.value)}
                                                />
                                                <InputField 
                                                    label="Live Demo Link" 
                                                    placeholder="project.vercel.app"
                                                    value={proj?.live || ''}
                                                    onChange={(e) => updateProject(index, 'live', e.target.value)}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <div className="mb-2 text-sm font-medium text-muted-foreground">Technologies Used</div>
                                                <SkillMultiSelect 
                                                    selectedSkills={proj?.skills || []} 
                                                    onChange={(newSkills) => updateProject(index, 'skills', newSkills)} 
                                                />
                                            </div>

                                            <InputField 
                                                label="Short Description" 
                                                isTextarea={true}
                                                rows={4}
                                                placeholder="Built an AI-powered recruitment platform using MERN stack with ATS optimization and recruiter analytics."
                                                value={proj?.description || ''}
                                                onChange={(e) => updateProject(index, 'description', e.target.value)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <button
                                    onClick={addProject}
                                    className="w-full py-4 border-2 border-dashed border-white/10 hover:border-[#00ff88]/50 rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-[#00ff88] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Project
                                </button>
                            </div>
                        </ResumeSectionCard>

                        <ResumeSectionCard 
                            title="Education" 
                            subtitle="Add your academic background"
                            icon={GraduationCap} 
                            isOpen={openSection === 'education'} 
                            onToggle={() => toggleSection('education')}
                            status={getStatus('education')}
                        >
                            <div className="space-y-6">
                                {/* Post Graduation */}
                                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <h4 className="text-[#00ff88] font-medium mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                                        Post Graduation
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <div className="md:col-span-2">
                                            <InputField 
                                                label="College Name" 
                                                placeholder="e.g. Stanford University"
                                                value={formData?.education?.postGraduation?.college || ''}
                                                onChange={(e) => updateEducation('postGraduation', 'college', e.target.value)}
                                            />
                                        </div>
                                        <InputField label="Degree" placeholder="e.g. MS / M.Tech" value={formData?.education?.postGraduation?.degree || ''} onChange={(e) => updateEducation('postGraduation', 'degree', e.target.value)} />
                                        <InputField label="Specialization" placeholder="e.g. Computer Science" value={formData?.education?.postGraduation?.specialization || ''} onChange={(e) => updateEducation('postGraduation', 'specialization', e.target.value)} />
                                        <div className="md:col-span-2">
                                            <InputField label="University" placeholder="e.g. Stanford University" value={formData?.education?.postGraduation?.university || ''} onChange={(e) => updateEducation('postGraduation', 'university', e.target.value)} />
                                        </div>
                                        <InputField label="Start Year" placeholder="e.g. 2021" value={formData?.education?.postGraduation?.startYear || ''} onChange={(e) => updateEducation('postGraduation', 'startYear', e.target.value)} />
                                        <InputField label="End Year" placeholder="e.g. 2023" value={formData?.education?.postGraduation?.endYear || ''} onChange={(e) => updateEducation('postGraduation', 'endYear', e.target.value)} />
                                        <InputField label="CGPA / Percentage" placeholder="e.g. 3.8 / 85%" value={formData?.education?.postGraduation?.cgpa || ''} onChange={(e) => updateEducation('postGraduation', 'cgpa', e.target.value)} />
                                    </div>
                                </div>

                                {/* Graduation */}
                                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <h4 className="text-[#00ff88] font-medium mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                                        Graduation
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <div className="md:col-span-2">
                                            <InputField 
                                                label="College Name" 
                                                placeholder="e.g. MIT"
                                                value={formData?.education?.graduation?.college || ''}
                                                onChange={(e) => updateEducation('graduation', 'college', e.target.value)}
                                            />
                                        </div>
                                        <InputField label="Degree" placeholder="e.g. BS / B.Tech" value={formData?.education?.graduation?.degree || ''} onChange={(e) => updateEducation('graduation', 'degree', e.target.value)} />
                                        <InputField label="Specialization" placeholder="e.g. Software Engineering" value={formData?.education?.graduation?.specialization || ''} onChange={(e) => updateEducation('graduation', 'specialization', e.target.value)} />
                                        <div className="md:col-span-2">
                                            <InputField label="University" placeholder="e.g. MIT" value={formData?.education?.graduation?.university || ''} onChange={(e) => updateEducation('graduation', 'university', e.target.value)} />
                                        </div>
                                        <InputField label="Start Year" placeholder="e.g. 2017" value={formData?.education?.graduation?.startYear || ''} onChange={(e) => updateEducation('graduation', 'startYear', e.target.value)} />
                                        <InputField label="End Year" placeholder="e.g. 2021" value={formData?.education?.graduation?.endYear || ''} onChange={(e) => updateEducation('graduation', 'endYear', e.target.value)} />
                                        <InputField label="CGPA / Percentage" placeholder="e.g. 3.9 / 92%" value={formData?.education?.graduation?.cgpa || ''} onChange={(e) => updateEducation('graduation', 'cgpa', e.target.value)} />
                                    </div>
                                </div>

                                {/* 12th */}
                                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <h4 className="text-white/80 font-medium mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                        Higher Secondary (12th)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <div className="md:col-span-2">
                                            <InputField 
                                                label="School Name" 
                                                placeholder="e.g. High School"
                                                value={formData?.education?.higherSecondary?.school || ''}
                                                onChange={(e) => updateEducation('higherSecondary', 'school', e.target.value)}
                                            />
                                        </div>
                                        <InputField label="Board" placeholder="e.g. CBSE / State Board" value={formData?.education?.higherSecondary?.board || ''} onChange={(e) => updateEducation('higherSecondary', 'board', e.target.value)} />
                                        <InputField label="Stream" placeholder="e.g. Science / PCM" value={formData?.education?.higherSecondary?.stream || ''} onChange={(e) => updateEducation('higherSecondary', 'stream', e.target.value)} />
                                        <InputField label="Passing Year" placeholder="e.g. 2017" value={formData?.education?.higherSecondary?.passingYear || ''} onChange={(e) => updateEducation('higherSecondary', 'passingYear', e.target.value)} />
                                        <InputField label="Percentage / CGPA" placeholder="e.g. 95%" value={formData?.education?.higherSecondary?.score || ''} onChange={(e) => updateEducation('higherSecondary', 'score', e.target.value)} />
                                    </div>
                                </div>

                                {/* 10th */}
                                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <h4 className="text-white/80 font-medium mb-4 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                        Secondary (10th)
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        <div className="md:col-span-2">
                                            <InputField 
                                                label="School Name" 
                                                placeholder="e.g. High School"
                                                value={formData?.education?.secondary?.school || ''}
                                                onChange={(e) => updateEducation('secondary', 'school', e.target.value)}
                                            />
                                        </div>
                                        <InputField label="Board" placeholder="e.g. CBSE / State Board" value={formData?.education?.secondary?.board || ''} onChange={(e) => updateEducation('secondary', 'board', e.target.value)} />
                                        <InputField label="Passing Year" placeholder="e.g. 2015" value={formData?.education?.secondary?.passingYear || ''} onChange={(e) => updateEducation('secondary', 'passingYear', e.target.value)} />
                                        <div className="md:col-span-2">
                                            <InputField label="Percentage / CGPA" placeholder="e.g. 90%" value={formData?.education?.secondary?.score || ''} onChange={(e) => updateEducation('secondary', 'score', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResumeSectionCard>

                    </div>

                    {/* Right Panel: Live Preview */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <LivePreview data={formData} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BuildResume;
