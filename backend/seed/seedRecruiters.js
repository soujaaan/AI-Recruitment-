import { faker } from "@faker-js/faker";
import { ROLES } from "../constants/roles.js";
import { hashPassword, pick, pickN, randInt, uniqueEmail, avatarUrl } from "./helpers.js";

const DESIGNATIONS = [
    "Talent Acquisition Lead",
    "Senior Technical Recruiter",
    "HR Manager",
    "Campus Hiring Specialist",
    "Engineering Recruiter",
    "People Operations Partner",
];

const DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Data",
    "Sales",
    "Marketing",
    "Operations",
];

export const buildRecruiters = async (count) => {
    const password = await hashPassword();
    const recruiters = [];

    for (let i = 0; i < count; i++) {
        const fullname = faker.person.fullName();
        const designation = pick(DESIGNATIONS);
        const hiringPreferences = pickN(
            ["Remote-first", "On-site", "Hybrid", "Contract", "Full-time", "Campus"],
            randInt(2, 4)
        );

        recruiters.push({
            fullname,
            email: uniqueEmail("recruiter", i),
            phoneNumber: faker.phone.number(),
            password,
            role: ROLES.RECRUITER,
            profilePhoto: avatarUrl(),
            profile: {
                bio: `${designation} · ${randInt(3, 15)} years in talent acquisition`,
                skills: pickN(DEPARTMENTS, randInt(2, 4)),
                profilePhoto: avatarUrl(),
                location: `${faker.location.city()}, ${faker.location.country()}`,
                preferredRoles: hiringPreferences,
                designation,
                hiringPreferences,
                verificationStatus: pick(["verified", "verified", "pending"]),
            },
            isActive: true,
            isBlocked: false,
            isEmailVerified: true,
            lastLoginAt: faker.date.recent({ days: 14 }),
            _seedMeta: {
                designation,
                recruiterLevel: pick(["junior", "mid", "senior", "lead"]),
                verificationStatus: pick(["verified", "verified", "pending"]),
                hiringPreferences,
                yearsOfExperience: randInt(2, 18),
            },
        });
    }

    return recruiters;
};
