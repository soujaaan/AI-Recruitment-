import { faker } from "@faker-js/faker";
import { randInt, aiRankingFromScore } from "../../helpers.js";
import { findEligibleJobs } from "../matchers/jobMatcher.js";
import { buildApplicationSnapshot } from "./snapshots.js";
import {
    buildTimeline,
    pickApplicationStatus,
    recruiterNoteForStatus,
} from "./pipeline.js";
import { HIRING_TARGETS } from "../config.js";

const makeMeetSlug = () => {
    const part = () => faker.string.alpha({ length: 3, casing: "lower" });
    return `https://meet.google.com/mock-${part()}-${part()}-${part()}`;
};

/**
 * Generate applications via candidate → eligible jobs → weighted apply.
 */
export const generateApplications = (candidateIntelList, jobs) => {
    const applications = [];
    const usedPairs = new Set();
    const openJobs = jobs.filter((j) => j.isActive !== false && j.status !== "closed");

    for (const intel of candidateIntelList) {
        const eligible = findEligibleJobs(intel, openJobs, 120);
        if (!eligible.length) continue;

        let created = 0;
        const target = intel.targetApplications;

        for (const { job, matchScore, matchedSkills, missingSkills } of eligible) {
            if (created >= target) break;

            const key = `${intel.candidateId}:${job._id || job.id}`;
            if (usedPairs.has(key)) continue;
            usedPairs.add(key);

            const atsMin = Math.min(94, Math.max(35, matchScore - 15));
            const atsMax = Math.max(atsMin + 1, Math.min(98, matchScore + 12));
            const atsScore = randInt(atsMin, atsMax);
            const status = pickApplicationStatus();
            const appliedAt = faker.date.past({ years: 0.35 });
            const timeline = buildTimeline(status, appliedAt);
            const snapshot = buildApplicationSnapshot(intel);

            applications.push({
                jobId: job._id,
                job: job._id,
                candidateId: intel.candidateId,
                candidate: intel.candidateId,
                applicant: intel.candidateId,
                recruiterId: job.recruiterId,
                recruiter: job.recruiterId,
                companyId: job.companyId,
                candidateProfile: intel.profileId,
                resumeId: intel.resumeId,
                resume: intel.resumeId,
                applicationStatus: status,
                status,
                atsScore,
                matchScore,
                aiMatchScore: matchScore,
                matchedSkills,
                missingSkills,
                aiRanking: aiRankingFromScore(matchScore),
                aiEvaluationSummary: `Matched ${matchedSkills.length} of ${(job.skillsRequired || []).length} required skills.`,
                appliedAt,
                timeline,
                snapshot,
                recruiterNotes: recruiterNoteForStatus(status, job.title),
                interviewStages: [],
                createdAt: appliedAt,
                updatedAt: faker.date.between({ from: appliedAt, to: new Date() }),
                _meetLink: ["interview scheduled", "interview completed", "hired"].includes(status)
                    ? makeMeetSlug()
                    : null,
            });
            created++;
        }
    }

    const min = HIRING_TARGETS.applicationsMin;
    const max = HIRING_TARGETS.applicationsMax;
    if (applications.length < min) {
        console.warn(
            `  ⚠ Generated ${applications.length} applications (target ${min}-${max}). Consider widening matchers.`
        );
    }

    return applications;
};
