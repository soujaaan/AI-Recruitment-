import { faker } from "@faker-js/faker";
import { weightedPick } from "../../helpers.js";
import { APPLICATION_STATUS_WEIGHTS } from "../config.js";

const STAGE_LABELS = {
    applied: "Applied",
    "under review": "Under Review",
    shortlisted: "Shortlisted",
    "interview scheduled": "Interview Scheduled",
    "interview completed": "Interview Completed",
    hired: "Hired",
    rejected: "Rejected",
};

const STATUS_ORDER = [
    "applied",
    "under review",
    "shortlisted",
    "interview scheduled",
    "interview completed",
    "hired",
];

const REJECTED_ONLY = ["applied", "under review", "shortlisted", "rejected"];

export const pickApplicationStatus = () => weightedPick(APPLICATION_STATUS_WEIGHTS);

/**
 * Build monotonic timeline ending at final status.
 */
export const buildTimeline = (finalStatus, appliedAt) => {
    const timeline = [];
    let cursor = new Date(appliedAt);

    const push = (status) => {
        cursor = faker.date.between({ from: cursor, to: new Date(cursor.getTime() + 7 * 86400000) });
        timeline.push({
            stage: STAGE_LABELS[status] || status,
            timestamp: new Date(cursor),
            note: "",
        });
    };

    if (finalStatus === "rejected") {
        const path = REJECTED_ONLY.slice(0, faker.number.int({ min: 1, max: 3 }));
        if (!path.includes("rejected")) path.push("rejected");
        path.forEach(push);
        return timeline;
    }

    const endIdx = STATUS_ORDER.indexOf(finalStatus);
    const path = STATUS_ORDER.slice(0, Math.max(1, endIdx + 1));
    path.forEach(push);
    return timeline;
};

export const recruiterNoteForStatus = (status, jobTitle) => {
    const notes = {
        "under review": `Reviewing fit for ${jobTitle}.`,
        shortlisted: `Strong profile for ${jobTitle} — moving to shortlist.`,
        "interview scheduled": `Interview panel confirmed for ${jobTitle}.`,
        "interview completed": `Panel feedback collected for ${jobTitle}.`,
        hired: `Offer approved for ${jobTitle}.`,
        rejected: `Not moving forward for ${jobTitle} at this time.`,
    };
    return notes[status] || "";
};
