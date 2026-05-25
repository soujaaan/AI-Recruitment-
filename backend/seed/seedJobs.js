import { faker } from "@faker-js/faker";
import { JOB_CATEGORIES } from "./config.js";
import { pick, pickN, randInt, experienceYearsFromLevel } from "./helpers.js";

const WORK_MODES = ["Remote", "Hybrid", "On-site"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export const buildJobs = (count, companies, recruiters) => {
    const jobs = [];
    const companyRecruiters = new Map();

    recruiters.forEach((rec) => {
        const cid = String(rec.companyId || rec.company || companies[0]._id);
        if (!companyRecruiters.has(cid)) companyRecruiters.set(cid, []);
        companyRecruiters.get(cid).push(rec);
    });

    for (let i = 0; i < count; i++) {
        const company = companies[i % companies.length];
        const companyId = company._id;
        const team =
            companyRecruiters.get(String(companyId)) ||
            recruiters.filter((r) => String(r.companyId) === String(companyId));
        const recruiter = team.length ? pick(team) : recruiters[i % recruiters.length];
        const recruiterId = recruiter._id;
        const category = pick(JOB_CATEGORIES);
        const requiredSkills = pickN(category.skills, randInt(4, 6));
        const experienceLevel = category.level;
        const expYears = experienceYearsFromLevel(experienceLevel);
        const salaryMin = expYears <= 2 ? randInt(50, 85) : expYears <= 5 ? randInt(85, 130) : randInt(120, 200);
        const salaryMax = salaryMin + randInt(15, 45);
        const employmentType = pick(EMPLOYMENT_TYPES);
        const openings = randInt(1, 8);

        const description = [
            faker.lorem.paragraph(),
            `We are hiring a ${category.title} to join ${company.name}.`,
            `Required: ${requiredSkills.join(", ")}.`,
            `Work mode: ${pick(WORK_MODES)}. Experience: ${experienceLevel}.`,
        ].join("\n\n");

        jobs.push({
            title: `${category.title} ${pick(["I", "II", ""])}`.trim(),
            description,
            recruiterId,
            recruiter: recruiterId,
            companyId,
            requiredSkills,
            skillsRequired: requiredSkills,
            requirements: requiredSkills,
            salaryRange: {
                min: salaryMin * 1000,
                max: salaryMax * 1000,
                currency: "USD",
                display: `$${salaryMin}k – $${salaryMax}k`,
            },
            employmentType,
            jobType: employmentType,
            experienceLevel,
            location: company.location || faker.location.city(),
            openings,
            position: openings,
            applicantsCount: 0,
            salary: `$${salaryMin}k – $${salaryMax}k`,
            created_by: recruiterId,
            company: {
                name: company.name,
                website: company.website || "",
                location: company.location || "",
                logo: company.logo || "",
            },
            applications: [],
            isActive: true,
            isFlagged: faker.datatype.boolean({ probability: 0.02 }),
            aiScreeningEnabled: true,
            _seedMeta: {
                workMode: pick(WORK_MODES),
                applicationDeadline: faker.date.future({ years: 0.5 }),
                screeningQuestions: pickN(
                    ["Why this role?", "Describe a challenging project.", "Expected CTC?"],
                    2
                ),
                viewsCount: randInt(40, 800),
                clickCount: randInt(20, 400),
            },
        });
    }

    return jobs;
};
