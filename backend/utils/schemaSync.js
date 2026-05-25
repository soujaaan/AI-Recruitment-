/**
 * Shared field sync helpers for legacy ↔ canonical schema fields.
 */

export const syncJobFields = (doc) => {
    if (!doc) return doc;
    if (doc.created_by && !doc.recruiterId) doc.recruiterId = doc.created_by;
    if (doc.recruiterId && !doc.created_by) doc.created_by = doc.recruiterId;
    if (doc.requirements?.length && (!doc.requiredSkills || doc.requiredSkills.length === 0)) {
        doc.requiredSkills = doc.requirements;
    }
    if (doc.requiredSkills?.length && (!doc.requirements || doc.requirements.length === 0)) {
        doc.requirements = doc.requiredSkills;
    }
    if (doc.jobType && !doc.employmentType) doc.employmentType = doc.jobType;
    if (doc.employmentType && !doc.jobType) doc.jobType = doc.employmentType;
    return doc;
};

export const syncApplicationFields = (doc) => {
    if (!doc) return doc;
    if (doc.job && !doc.jobId) doc.jobId = doc.job;
    if (doc.jobId && !doc.job) doc.job = doc.jobId;
    if (doc.applicant && !doc.candidateId) doc.candidateId = doc.applicant;
    if (doc.candidateId && !doc.applicant) doc.applicant = doc.candidateId;
    if (doc.status && !doc.applicationStatus) doc.applicationStatus = doc.status;
    if (doc.applicationStatus && !doc.status) doc.status = doc.applicationStatus;
    return doc;
};

export const getJobRequiredSkills = (job) =>
    job?.requiredSkills?.length ? job.requiredSkills : job?.requirements || [];
