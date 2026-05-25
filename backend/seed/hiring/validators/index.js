const VALID_STATUSES = new Set([
    "applied",
    "under review",
    "shortlisted",
    "interview scheduled",
    "interview completed",
    "rejected",
    "hired",
]);

const needsInterview = new Set(["interview scheduled", "interview completed", "hired"]);

export class SeedValidationError extends Error {
    constructor(message, details = []) {
        super(message);
        this.name = "SeedValidationError";
        this.details = details;
    }
}

export const validateHiringSeed = ({
    recruiters,
    companies,
    jobs,
    applications,
    interviews,
    candidateIds,
    resumeIds,
}) => {
    const errors = [];
    const recruiterIds = new Set(recruiters.map((r) => String(r._id)));
    const companyIds = new Set(companies.map((c) => String(c._id)));
    const jobIds = new Set(jobs.map((j) => String(j._id)));
    const appIds = new Set(applications.map((a) => String(a._id)));
    const candidateIdSet = new Set(candidateIds.map(String));
    const resumeIdSet = new Set(resumeIds.map(String));

    for (const job of jobs) {
        if (!recruiterIds.has(String(job.recruiterId || job.created_by))) {
            errors.push(`Job ${job._id} has invalid recruiterId`);
        }
        if (!companyIds.has(String(job.companyId))) {
            errors.push(`Job ${job._id} has invalid companyId`);
        }
        if (job.applications?.length) {
            errors.push(`Job ${job._id} must not embed applications array`);
        }
    }

    const pairKeys = new Set();
    const appsNeedingInterview = new Set();

    for (const app of applications) {
        const status = app.applicationStatus || app.status;
        if (!VALID_STATUSES.has(status)) {
            errors.push(`Application ${app._id} has invalid status: ${status}`);
        }
        if (!candidateIdSet.has(String(app.candidateId || app.applicant))) {
            errors.push(`Application ${app._id} orphan candidate`);
        }
        if (!jobIds.has(String(app.jobId || app.job))) {
            errors.push(`Application ${app._id} orphan job`);
        }
        if (!recruiterIds.has(String(app.recruiterId))) {
            errors.push(`Application ${app._id} orphan recruiter`);
        }
        if (!companyIds.has(String(app.companyId))) {
            errors.push(`Application ${app._id} orphan company`);
        }
        if (app.resumeId && !resumeIdSet.has(String(app.resumeId))) {
            errors.push(`Application ${app._id} missing resume reference`);
        }
        if (!app.snapshot?.fullName) {
            errors.push(`Application ${app._id} missing snapshot`);
        }
        if (!app.timeline?.length) {
            errors.push(`Application ${app._id} missing timeline`);
        }

        const pair = `${app.candidateId || app.applicant}:${app.jobId || app.job}`;
        if (pairKeys.has(pair)) {
            errors.push(`Duplicate application for pair ${pair}`);
        }
        pairKeys.add(pair);

        if (status === "hired" && !needsInterview.has(status)) {
            /* hired always needs interview path */
        }
        if (needsInterview.has(status)) {
            appsNeedingInterview.add(String(app._id));
        }
        if (status === "hired") {
            appsNeedingInterview.add(String(app._id));
        }
    }

    for (const iv of interviews) {
        if (!appIds.has(String(iv.applicationId || iv.application))) {
            errors.push(`Interview ${iv._id} without application`);
        }
        if (!iv.meetLink && !iv.meetingLink) {
            errors.push(`Interview ${iv._id} missing meet link`);
        }
    }

    for (const appId of appsNeedingInterview) {
        const hasInterview = interviews.some(
            (iv) => String(iv.applicationId || iv.application) === appId
        );
        if (!hasInterview) {
            errors.push(`Application ${appId} in interview/hired state without interview record`);
        }
    }

    for (const app of applications) {
        const status = app.applicationStatus || app.status;
        if (status === "hired") {
            const hasCompleted = interviews.some(
                (iv) =>
                    String(iv.applicationId || iv.application) === String(app._id) &&
                    iv.status === "completed"
            );
            if (!hasCompleted) {
                errors.push(`Hired application ${app._id} without completed interview`);
            }
        }
    }

    if (errors.length) {
        throw new SeedValidationError(
            `Hiring seed validation failed (${errors.length} issues)`,
            errors.slice(0, 50)
        );
    }

    return { valid: true, applicationPairs: pairKeys.size };
};
