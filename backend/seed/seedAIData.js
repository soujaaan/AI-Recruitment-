import { faker } from "@faker-js/faker";
import { AI_LOG_MODULES } from "./config.js";
import { weightedPick, pick, randInt, pickN } from "./helpers.js";

export const buildAILogs = (count, candidates, jobs, applications) => {
    const logs = [];
    for (let i = 0; i < count; i++) {
        const app = applications[i % applications.length];
        const module = weightedPick(AI_LOG_MODULES);
        const score = randInt(35, 98);
        logs.push({
            userId: app.candidateId,
            candidateId: app.candidateId,
            jobId: app.jobId,
            applicationId: app._id,
            module,
            score,
            input: {
                skills: pickN(["React", "Node.js", "Python", "AWS"], 3),
                role: pick(["Engineer", "Analyst", "Designer"]),
            },
            output: {
                summary: faker.lorem.sentence(),
                recommendation: score >= 75 ? "Proceed" : "Review manually",
            },
            metadata: {
                confidence: randInt(60, 99),
                model: "seed-analytics-v1",
                latencyMs: randInt(120, 900),
            },
            createdAt: faker.date.past({ years: 0.3 }),
        });
    }
    return logs;
};

export const buildNotifications = (count, users, jobs, applications) => {
    const types = ["application", "interview", "message", "recommendation", "system"];
    const titles = {
        application: "Application update",
        interview: "Interview scheduled",
        message: "New recruiter message",
        recommendation: "AI job recommendation",
        system: "Platform notice",
    };
    const notifications = [];

    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        const type = pick(types);
        const app = applications[i % applications.length];
        const job = jobs.find((j) => String(j._id) === String(app?.jobId)) || jobs[i % jobs.length];

        notifications.push({
            userId: user._id,
            type,
            title: titles[type],
            message: faker.lorem.sentence(),
            link: job ? `/jobs/${job._id}` : "/applications",
            isRead: Math.random() < 0.35,
            metadata: {
                jobId: job?._id,
                applicationId: app?._id,
                matchScore: app?.matchScore,
            },
            createdAt: faker.date.past({ years: 0.25 }),
        });
    }
    return notifications;
};

export const buildRecommendations = (count, candidates, jobs) => {
    const recs = [];
    const used = new Set();
    let guard = 0;
    while (recs.length < count && guard < count * 4) {
        guard++;
        const candidate = pick(candidates);
        const job = pick(jobs);
        const key = `${candidate._id}:${job._id}`;
        if (used.has(key)) continue;
        used.add(key);
        recs.push({
            candidateId: candidate._id,
            jobId: job._id,
            matchScore: randInt(55, 96),
            reason: faker.lorem.sentence(),
            tags: pickN(["High match", "Skill overlap", "Location fit", "Salary fit"], 2),
            isDismissed: Math.random() < 0.1,
        });
    }
    return recs;
};

export const buildSavedJobs = (count, candidates, jobs) => {
    const saved = [];
    const used = new Set();
    let guard = 0;
    while (saved.length < count && guard < count * 3) {
        guard++;
        const candidate = pick(candidates);
        const job = pick(jobs);
        const key = `${candidate._id}:${job._id}`;
        if (used.has(key)) continue;
        used.add(key);
        saved.push({
            candidateId: candidate._id,
            jobId: job._id,
            notes: Math.random() < 0.3 ? faker.lorem.sentence() : "",
        });
    }
    return saved;
};

export const buildInterviewSchedules = (count, applications) => {
    const eligible = applications.filter((a) =>
        ["interview scheduled", "shortlisted", "hired"].includes(a.applicationStatus || a.status)
    );
    const pool = eligible.length >= count ? eligible : applications;
    const schedules = [];
    const used = new Set();

    let guard = 0;
    while (schedules.length < count && guard < count * 3) {
        guard++;
        const app = pick(pool);
        const key = String(app._id);
        if (used.has(key)) continue;
        used.add(key);

        schedules.push({
            candidate: app.candidateId,
            recruiter: app.recruiterId,
            job: app.jobId,
            application: app._id,
            scheduledAt: faker.date.soon({ days: 21 }),
            meetingLink: `https://meet.google.com/${faker.string.alphanumeric(3)}-${faker.string.alphanumeric(4)}-${faker.string.alphanumeric(3)}`,
            notes: pick([
                "Technical round with hiring manager",
                "Culture fit discussion",
                "Panel interview — bring portfolio",
                "HR screening followed by tech deep dive",
            ]),
            status: pick(["scheduled", "scheduled", "scheduled", "completed", "rescheduled"]),
            createdAt: faker.date.past({ years: 0.1 }),
        });
    }
    return schedules;
};

export const buildInterviewFeedback = (schedules) =>
    schedules.slice(0, Math.floor(schedules.length * 0.4)).map((s) => ({
        interviewScheduleId: s._id,
        candidateId: s.candidate,
        recruiterId: s.recruiter,
        jobId: s.job,
        rating: randInt(3, 5),
        strengths: pickN(["Strong communication", "Solid technical depth", "Good culture fit"], 2),
        weaknesses: pickN(["Needs more system design", "Limited leadership examples"], 1),
        notes: faker.lorem.sentence(),
        recommendation: pick(["hire", "hold", "reject", "pending"]),
    }));
