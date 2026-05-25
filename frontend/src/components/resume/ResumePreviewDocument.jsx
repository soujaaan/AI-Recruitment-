import { Mail, Phone, MapPin, Link as LinkIcon, Github, Globe } from 'lucide-react';

/**
 * ATS-friendly A4 resume preview (used for live preview + PDF export).
 */
const ResumePreviewDocument = ({ data, exportId }) => {
    if (!data) return null;

    return (
        <div
            id={exportId}
            className="bg-white text-black font-sans text-sm w-full min-h-[297mm] p-8 space-y-6"
            style={{ width: '210mm', minHeight: '297mm' }}
        >
            <div className="text-center border-b border-gray-300 pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
                    {data?.personalInfo?.fullName || 'YOUR NAME'}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    {data?.personalInfo?.email && (
                        <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {data.personalInfo.email}
                        </span>
                    )}
                    {data?.personalInfo?.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {data.personalInfo.phone}
                        </span>
                    )}
                    {data?.personalInfo?.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {data.personalInfo.location}
                        </span>
                    )}
                    {data?.personalInfo?.linkedin && (
                        <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> {data.personalInfo.linkedin}
                        </span>
                    )}
                    {data?.personalInfo?.github && (
                        <span className="flex items-center gap-1">
                            <Github className="w-3 h-3" /> {data.personalInfo.github}
                        </span>
                    )}
                    {data?.personalInfo?.portfolio && (
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {data.personalInfo.portfolio}
                        </span>
                    )}
                </div>
            </div>

            {data?.summary && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1 text-gray-800">
                        Professional Summary
                    </h2>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                </div>
            )}

            {data?.skills?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1 text-gray-800">
                        Tech Stack
                    </h2>
                    <p className="text-xs text-gray-700 leading-relaxed">{(data.skills || []).join(' • ')}</p>
                </div>
            )}

            {data?.experience?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">
                        Experience
                    </h2>
                    <div className="space-y-4">
                        {(data.experience || []).map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-xs font-bold text-gray-900">
                                        {exp?.title || 'Title'}{' '}
                                        <span className="font-normal text-gray-600">at {exp?.company || 'Company'}</span>
                                    </h3>
                                    <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap ml-2">
                                        {exp?.startDate || 'Start'} – {exp?.current ? 'Present' : exp?.endDate || 'End'}
                                    </span>
                                </div>
                                {exp?.location && (
                                    <div className="text-[10px] italic text-gray-500 mb-1">{exp.location}</div>
                                )}
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

            {data?.projects?.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">
                        Projects
                    </h2>
                    <div className="space-y-3">
                        {(data.projects || []).map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-xs font-bold text-gray-900">{proj?.title || 'Project'}</h3>
                                    {proj?.duration && (
                                        <span className="text-[10px] font-semibold text-gray-500">{proj.duration}</span>
                                    )}
                                </div>
                                {proj?.skills?.length > 0 && (
                                    <div className="text-[10px] italic text-gray-500 mb-1">
                                        Stack: {proj.skills.join(', ')}
                                    </div>
                                )}
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

            {(data?.education?.graduation?.college ||
                data?.education?.postGraduation?.college ||
                data?.education?.higherSecondary?.school ||
                data?.education?.secondary?.school) && (
                <div>
                    <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 text-gray-800">
                        Education
                    </h2>
                    <div className="space-y-2">
                        {data?.education?.postGraduation?.college && (
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900">
                                        {data.education.postGraduation.degree} in{' '}
                                        {data.education.postGraduation.specialization}
                                    </h3>
                                    <div className="text-[10px] text-gray-600">
                                        {data.education.postGraduation.college}
                                    </div>
                                </div>
                                <span className="text-[10px] font-semibold text-gray-500">
                                    {data.education.postGraduation.startYear} - {data.education.postGraduation.endYear}
                                </span>
                            </div>
                        )}
                        {data?.education?.graduation?.college && (
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-900">
                                        {data.education.graduation.degree} in {data.education.graduation.specialization}
                                    </h3>
                                    <div className="text-[10px] text-gray-600">
                                        {data.education.graduation.college}
                                    </div>
                                </div>
                                <span className="text-[10px] font-semibold text-gray-500">
                                    {data.education.graduation.startYear} - {data.education.graduation.endYear}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumePreviewDocument;
