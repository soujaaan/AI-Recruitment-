import { randInt } from "../../helpers.js";
import { RECRUITER_TIERS } from "../config.js";

/**
 * Assign each recruiter a hiring tier and target job count.
 * @param {Array} recruiters - User docs with companyId
 * @returns {Map<string, { tier: string, jobCount: number }>}
 */
export const assignRecruiterBehavior = (recruiters) => {
    const assignments = new Map();
    let idx = 0;

    for (const tier of RECRUITER_TIERS) {
        for (let i = 0; i < tier.count && idx < recruiters.length; i++, idx++) {
            const rec = recruiters[idx];
            const jobCount =
                tier.jobsMax === 0
                    ? 0
                    : randInt(tier.jobsMin, tier.jobsMax);
            assignments.set(String(rec._id), {
                tier: tier.type,
                jobCount,
                recruiterId: rec._id,
                companyId: rec.companyId || rec.company,
            });
        }
    }

    while (idx < recruiters.length) {
        const rec = recruiters[idx++];
        assignments.set(String(rec._id), {
            tier: "small",
            jobCount: randInt(3, 5),
            recruiterId: rec._id,
            companyId: rec.companyId || rec.company,
        });
    }

    return assignments;
};

export const summarizeRecruiterTiers = (assignments) => {
    const summary = {};
    let totalJobs = 0;
    for (const { tier, jobCount } of assignments.values()) {
        summary[tier] = (summary[tier] || 0) + 1;
        totalJobs += jobCount;
    }
    return { summary, totalJobs };
};

/** Scale tier job counts up if random draw fell below hiring target minimum. */
export const scaleAssignmentsToMinimum = (assignments, minJobs = 750) => {
    let total = 0;
    for (const a of assignments.values()) total += a.jobCount;

    if (total >= minJobs) return assignments;

    const aggressive = [...assignments.entries()].filter(([, a]) => a.tier === "aggressive");
    const medium = [...assignments.entries()].filter(([, a]) => a.tier === "medium");
    let deficit = minJobs - total;
    const pools = [...aggressive, ...medium];

    for (const [id, assignment] of pools) {
        if (deficit <= 0) break;
        const bump = Math.min(deficit, assignment.tier === "aggressive" ? 8 : 4);
        assignment.jobCount += bump;
        assignments.set(id, assignment);
        deficit -= bump;
    }

    return assignments;
};
