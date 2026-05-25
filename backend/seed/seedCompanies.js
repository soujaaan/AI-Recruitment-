import { faker } from "@faker-js/faker";
import { INDUSTRIES } from "./config.js";
import {
    pick,
    pickN,
    randInt,
    buildCompanyDescription,
    uniqueEmail,
} from "./helpers.js";

const COMPANY_SIZES = ["1-50", "51-200", "201-500", "501-1000", "1000+"];

export const buildCompanies = (count, insertedRecruiters, recruiterSeedDocs = []) => {
    const companies = [];
    const usedNames = new Set();

    for (let i = 0; i < count; i++) {
        let name = faker.company.name();
        while (usedNames.has(name)) {
            name = `${faker.company.name()} ${faker.location.city()}`;
        }
        usedNames.add(name);

        const primaryRecruiter = insertedRecruiters[i % insertedRecruiters.length];
        const seedRecruiter = recruiterSeedDocs[i % recruiterSeedDocs.length] || {};
        const recruiterMeta = seedRecruiter._seedMeta || seedRecruiter.profile || {};
        const industry = pick(INDUSTRIES);
        const techStack = pickN(
            ["React", "Node.js", "Python", "AWS", "Kubernetes", "PostgreSQL", "TensorFlow", "Figma", "Salesforce", "Docker"],
            randInt(4, 8)
        );
        const meta = {
            about: faker.company.catchPhrase(),
            industry,
            techStack,
            hiringStatus: "not started",
            companySize: pick(COMPANY_SIZES),
            headquarters: `${faker.location.city()}, ${faker.location.country()}`,
            recruiterTitle: recruiterMeta.designation || seedRecruiter.profile?.designation || "Recruiter",
            hiringPreferences: recruiterMeta.hiringPreferences || seedRecruiter.profile?.hiringPreferences || [],
            verificationStatus: recruiterMeta.verificationStatus || seedRecruiter.profile?.verificationStatus || "verified",
            activeJobsCount: 0,
            socialLinks: {
                linkedin: `https://linkedin.com/company/${faker.string.alphanumeric(8)}`,
                twitter: faker.internet.url(),
            },
        };

        companies.push({
            name,
            description: buildCompanyDescription(meta),
            website: faker.internet.url(),
            location: meta.headquarters,
            headquarters: meta.headquarters,
            logo: faker.image.url({ width: 128, height: 128 }),
            industry,
            companySize: meta.companySize,
            hiringMaturity: pick(["early", "growth", "mature", "enterprise"]),
            techStack,
            remoteCapability: pick(["remote", "hybrid", "hybrid", "onsite", "flexible"]),
            employeeCount: randInt(20, 12000),
            foundedYear: randInt(1985, 2023),
            userId: primaryRecruiter._id || primaryRecruiter.id,
            recruiterId: primaryRecruiter._id || primaryRecruiter.id,
            isActive: true,
            _seedMeta: { techStack, activeJobsCount: 0 },
        });
    }

    return companies;
};
