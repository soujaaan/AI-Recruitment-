import { faker } from "@faker-js/faker";
import {
    pick,
    pickN,
    randInt,
    experienceYearsFromLevel,
} from "../../helpers.js";
import { rolesForRecruiterTier, resolveIndustryProfile } from "./templates.js";

const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const mockEmbeddings = (seed) => {
    const base = String(seed)
        .split("")
        .reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 8 }, (_, i) =>
        Number((((base * (i + 1)) % 1000) / 1000).toFixed(4))
    );
};

const buildSkillWeights = (skills) => {
    const weights = {};
    const total = skills.length || 1;
    skills.forEach((s, i) => {
        weights[s] = Number(((skills.length - i) / total).toFixed(2));
    });
    return weights;
};

const salaryFromLevel = (level) => {
    const expYears = experienceYearsFromLevel(level);
    const salaryMin = expYears <= 2 ? randInt(50, 85) : expYears <= 5 ? randInt(85, 130) : randInt(120, 200);
    const salaryMax = salaryMin + randInt(15, 45);
    return {
        min: salaryMin * 1000,
        max: salaryMax * 1000,
        currency: "USD",
        display: `$${salaryMin}k – $${salaryMax}k`,
        legacy: `$${salaryMin}k – $${salaryMax}k`,
        experienceLevel: level,
        experienceRequired: `${expYears}+ years`,
    };
};

/**
 * Generate jobs from recruiter → company chain.
 */
export const generateJobs = (recruiters, companies, assignments) => {
    const companyById = new Map(companies.map((c) => [String(c._id), c]));
    const jobs = [];
    let jobIndex = 0;

    for (const recruiter of recruiters) {
        const assignment = assignments.get(String(recruiter._id));
        if (!assignment || assignment.jobCount === 0) continue;

        const companyId = assignment.companyId || recruiter.companyId || recruiter.company;
        const company = companyById.get(String(companyId));
        if (!company) continue;

        const industry = company.industry || "IT";
        const profile = resolveIndustryProfile(industry);
        const rolePool = rolesForRecruiterTier(profile, assignment.tier);
        const workMode = company.remoteCapability === "remote" ? "Remote" : pick(WORK_MODES);
        const location =
            workMode === "Remote"
                ? "Remote"
                : company.headquarters || company.location || faker.location.city();

        for (let j = 0; j < assignment.jobCount; j++) {
            const roleDef = rolePool[j % rolePool.length];
            const requiredSkills = pickN(roleDef.skills, Math.min(roleDef.skills.length, randInt(4, 6)));
            const salary = salaryFromLevel(roleDef.level);
            const employmentType = pick(EMPLOYMENT_TYPES);
            const openings = randInt(1, assignment.tier === "aggressive" ? 12 : 6);
            const createdAt = faker.date.past({ years: 0.5 });
            const expiresAt = faker.date.future({ years: 0.25, refDate: createdAt });

            const description = [
                `${company.name} is hiring a ${roleDef.title} to strengthen our ${industry} team.`,
                `You will work with ${(company.techStack || requiredSkills).slice(0, 4).join(", ")}.`,
                `Required skills: ${requiredSkills.join(", ")}.`,
                `Experience: ${salary.experienceRequired}. Mode: ${workMode}.`,
                `We value ownership, collaboration, and measurable impact.`,
            ].join("\n\n");

            const category = roleDef.title.split(" ")[0];

            jobs.push({
                title: roleDef.title,
                description,
                recruiterId: recruiter._id,
                recruiter: recruiter._id,
                companyId: company._id,
                requiredSkills,
                skillsRequired: requiredSkills,
                requirements: requiredSkills,
                salaryRange: {
                    min: salary.min,
                    max: salary.max,
                    currency: "USD",
                    display: salary.display,
                },
                employmentType,
                jobType: employmentType,
                experienceLevel: roleDef.level,
                experienceRequired: salary.experienceRequired,
                location,
                openings,
                position: openings,
                salary: salary.legacy,
                created_by: recruiter._id,
                company: {
                    name: company.name,
                    website: company.website || "",
                    location: company.location || location,
                    logo: company.logo || "",
                },
                isActive: true,
                status: pick(["open", "open", "open", "closed"]),
                expiresAt,
                aiScreeningEnabled: true,
                aiMetadata: {
                    category,
                    skillWeights: buildSkillWeights(requiredSkills),
                    embeddings: mockEmbeddings(`${recruiter._id}-${jobIndex}`),
                },
                createdAt,
                updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
            });
            jobIndex++;
        }
    }

    return jobs;
};

export const enrichCompaniesForHiring = (companies) => {
    const maturityByIndustry = {
        AI: "growth",
        SaaS: "growth",
        FinTech: "mature",
        Cybersecurity: "mature",
        "Cloud Engineering": "enterprise",
        Healthcare: "enterprise",
        EdTech: "growth",
        "E-commerce": "mature",
        IT: "mature",
        Consulting: "enterprise",
    };

    return companies.map((company) => {
        const industry = company.industry || "IT";
        const profile = resolveIndustryProfile(industry);
        const techStack =
            company.techStack?.length > 0
                ? company.techStack
                : profile.roles.flatMap((r) => r.skills).slice(0, 8);

        const remoteCapability = pick(["remote", "hybrid", "hybrid", "onsite", "flexible"]);
        const headquarters = company.headquarters || company.location || "";

        return {
            updateOne: {
                filter: { _id: company._id },
                update: {
                    $set: {
                        techStack: [...new Set(techStack)],
                        companySize: company.companySize || pick(["51-200", "201-500", "501-1000"]),
                        hiringMaturity: maturityByIndustry[industry] || profile.maturity || "growth",
                        headquarters,
                        remoteCapability,
                        description: `${company.description || ""}\nHiring status: active pipeline. activeJobsCount: pending.`,
                    },
                },
            },
        };
    });
};
