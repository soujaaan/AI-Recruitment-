import { faker } from "@faker-js/faker";
import { pick, randInt } from "../../helpers.js";
import { ROUND_TYPES, RECOMMENDATIONS } from "../config.js";

const TIMEZONES = ["America/New_York", "America/Chicago", "Europe/London", "Asia/Kolkata", "UTC"];

/**
 * Create interview records for applications in interview-related stages.
 */
export const generateInterviews = (applications, recruiters, insertedApps) => {
    const interviews = [];
    const recruiterById = new Map(recruiters.map((r) => [String(r._id), r]));

    const needsInterview = new Set([
        "interview scheduled",
        "interview completed",
        "hired",
    ]);

    insertedApps.forEach((app, idx) => {
        const seedApp = applications[idx];
        const status = app.applicationStatus || app.status;
        if (!needsInterview.has(status)) return;

        const recruiter = recruiterById.get(String(app.recruiterId));
        const appliedAt = new Date(app.appliedAt || app.createdAt);
        const scheduledAt = faker.date.between({
            from: appliedAt,
            to: new Date(Math.min(Date.now(), appliedAt.getTime() + 45 * 86400000)),
        });

        const isCompleted = status === "interview completed" || status === "hired";
        const roundType = pick(ROUND_TYPES);
        const meetLink =
            seedApp?._meetLink ||
            `https://meet.google.com/mock-${faker.string.alpha({ length: 3, casing: "lower" })}-${faker.string.alpha({ length: 3, casing: "lower" })}-${faker.string.alpha({ length: 3, casing: "lower" })}`;

        const interview = {
            applicationId: app._id,
            application: app._id,
            recruiterId: app.recruiterId,
            recruiter: app.recruiterId,
            candidateId: app.candidateId,
            candidate: app.candidateId,
            companyId: app.companyId,
            jobId: app.jobId,
            job: app.jobId,
            roundType,
            meetLink,
            meetingLink: meetLink,
            scheduledAt,
            durationMinutes: pick([30, 45, 60]),
            timezone: pick(TIMEZONES),
            status: isCompleted ? "completed" : status === "hired" ? "completed" : "scheduled",
            interviewerDetails: {
                name: recruiter?.fullname || "Hiring Manager",
                role: pick(["Engineering Manager", "Tech Lead", "HR Partner"]),
                email: recruiter?.email || faker.internet.email(),
            },
            feedback: isCompleted
                ? {
                      technicalRating: randInt(3, 5),
                      communicationRating: randInt(3, 5),
                      problemSolvingRating: randInt(3, 5),
                      culturalFit: randInt(3, 5),
                      recommendation: pick(RECOMMENDATIONS),
                      notes: faker.lorem.sentence(),
                  }
                : { recommendation: "pending" },
            notes: `Round: ${roundType}`,
            createdAt: scheduledAt,
            updatedAt: new Date(),
        };

        interviews.push(interview);
    });

    return { interviews };
};

export const buildInterviewFeedback = (insertedInterviews) =>
    insertedInterviews
        .filter((iv) => iv.status === "completed" && iv.feedback?.recommendation !== "pending")
        .map((iv) => ({
            interviewScheduleId: iv._id,
            candidateId: iv.candidateId || iv.candidate,
            recruiterId: iv.recruiterId || iv.recruiter,
            jobId: iv.jobId || iv.job,
            rating: iv.feedback?.technicalRating || randInt(3, 5),
            strengths: ["Strong fundamentals", "Clear communication"],
            weaknesses: ["Minor gaps in domain depth"],
            notes: iv.feedback?.notes || "",
            recommendation:
                iv.feedback?.recommendation === "reject"
                    ? "reject"
                    : iv.feedback?.recommendation === "neutral"
                      ? "hold"
                      : "hire",
        }));
