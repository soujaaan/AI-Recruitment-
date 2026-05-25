import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { ROLES } from "../constants/roles.js";
import { BATCH_SIZE } from "./config.js";

export const hashPassword = async (plain = "password123") =>
    bcrypt.hash(plain, 10);


export const pick = (arr) => faker.helpers.arrayElement(arr);
export const pickN = (arr, n) => faker.helpers.arrayElements(arr, Math.min(n, arr.length));
export const randInt = (min, max) => faker.number.int({ min, max });
export const randFloat = (min, max) => faker.number.float({ min, max, fractionDigits: 1 });

export const weightedPick = (items) => {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item.status ?? item.module ?? item;
    }
    return items[0].status ?? items[0].module ?? items[0];
};

const buildEmail = ({ firstName, lastName, index }) => {
    const domains = ["gmail.com", "hotmail.com"];
    const domain = faker.helpers.arrayElement(domains);

    const patterns = [
        () => `${firstName}.${lastName}@${domain}`,
        () => `${firstName}${faker.number.int({ min: 10, max: 999 })}@${domain}`,
        () => `${firstName}_${lastName}@${domain}`,
        () => `${firstName}_${lastName}${index}@${domain}`,
        () => `${firstName}.${lastName}${index}@${domain}`,
    ];

    return patterns[faker.number.int({ min: 0, max: patterns.length - 1 })]();
};

export const uniqueEmail = (prefix, index) => {
    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();

    // Ensure uniqueness by incorporating index into the username part.
    const email = buildEmail({ firstName, lastName, index: Number(index) });
    return email.toLowerCase();
};



export const avatarUrl = () =>
    faker.image.avatarGitHub();

export const batchInsert = async (model, documents, label = model.modelName) => {
    if (!documents.length) return [];
    const inserted = [];
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const chunk = documents.slice(i, i + BATCH_SIZE);
        try {
            const res = await model.insertMany(chunk, { ordered: false });
            inserted.push(...res);
            if (res.length < chunk.length) {
                console.warn(
                    `  ⚠ ${label}: chunk ${i / BATCH_SIZE + 1} inserted ${res.length}/${chunk.length}`
                );
            }
        } catch (err) {
            if (err.insertedDocs?.length) {
                inserted.push(...err.insertedDocs);
                console.warn(
                    `  ⚠ ${label}: partial chunk (${err.insertedDocs.length}/${chunk.length}) — ${err.message}`
                );
            } else {
                throw err;
            }
        }
        console.log(`  → ${label}: ${inserted.length}/${documents.length}`);
    }
    return inserted;
};

export const buildCompanyDescription = (meta) => {
    const lines = [
        meta.about,
        `Industry focus: ${meta.industry}.`,
        `Tech stack: ${meta.techStack.join(", ")}.`,
        `Hiring status: ${meta.hiringStatus}. Company size: ${meta.companySize}.`,
        `Headquarters: ${meta.headquarters}.`,
        `Active job postings: ${meta.activeJobsCount ?? 0}.`,
    ];
    if (meta.recruiterTitle) lines.push(`Primary recruiter: ${meta.recruiterTitle}.`);
    if (meta.hiringPreferences?.length) {
        lines.push(`Hiring preferences: ${meta.hiringPreferences.join(", ")}.`);
    }
    if (meta.verificationStatus) lines.push(`Verification: ${meta.verificationStatus}.`);
    if (meta.socialLinks?.linkedin) lines.push(`LinkedIn: ${meta.socialLinks.linkedin}`);
    return lines.join("\n");
};

export const salaryForExperience = (years) => {
    if (years <= 1) return { min: 45000, max: 70000, display: "$45k – $70k" };
    if (years <= 3) return { min: 65000, max: 95000, display: "$65k – $95k" };
    if (years <= 6) return { min: 90000, max: 130000, display: "$90k – $130k" };
    return { min: 120000, max: 185000, display: "$120k – $185k" };
};

export const experienceYearsFromLevel = (level) => {
    if (level === "Junior" || level === "Entry") return randInt(0, 2);
    if (level === "Mid") return randInt(2, 5);
    if (level === "Senior") return randInt(5, 12);
    return randInt(8, 15);
};

export const aiRankingFromScore = (score) => {
    if (score >= 82) return "Highly Recommended";
    if (score >= 68) return "Recommended";
    if (score >= 45) return "Average Fit";
    return "Weak Match";
};

export const ADMIN_ROLES = [ROLES.ADMIN, "admin", "ADMIN"]; 

export const DEFAULT_TEST_PASSWORD_PLAINTEXT = "password123";
export const DEFAULT_TEST_PASSWORD_SALT_ROUNDS = 10;

