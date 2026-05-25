import { faker } from "@faker-js/faker";
import { ROLES } from "../constants/roles.js";
import { skillsData } from "./skills.js";
import {
    hashPassword,
    pick,
    pickN,
    randInt,
    randFloat,
    uniqueEmail,
    avatarUrl,
    salaryForExperience,
} from "./helpers.js";

const buildSkillSet = (experienceYears) => {
    const maxStacks = experienceYears <= 1 ? 2 : experienceYears <= 3 ? 3 : 5;
    const pools = ["frontend", "backend", "database", "cloud", "ai_ml", "soft_skills"];
    const selected = pickN(pools, maxStacks);
    let skills = [];
    selected.forEach((k) => {
        const count = experienceYears <= 1 ? randInt(3, 5) : randInt(4, 8);
        skills = skills.concat(pickN(skillsData[k], count));
    });
    return [...new Set(skills)];
};

const buildExperience = (years, skills) => {
    const roles = [];
    let remaining = years;
    let current = true;
    while (remaining > 0 && roles.length < 4) {
        const span = Math.min(remaining, randInt(1, Math.max(1, Math.ceil(years / 2))));
        roles.push({
            company: faker.company.name(),
            title: pick(["Software Engineer", "Developer", "Analyst", "Associate Engineer", "Intern"]),
            type: pick(["Full-time", "Internship", "Contract"]),
            startDate: `${2026 - remaining - span}-01`,
            endDate: current ? "" : `${2026 - remaining}-06`,
            current,
            location: faker.location.city(),
            skills: pickN(skills, randInt(3, 6)),
            responsibilities: faker.lorem.paragraphs(2),
        });
        remaining -= span;
        current = false;
    }
    return roles;
};

const buildProjects = (skills, experienceYears) => {
    const count = experienceYears <= 1 ? randInt(1, 2) : randInt(2, 4);
    return Array.from({ length: count }, () => ({
        title: `${pick(["Platform", "Portal", "Dashboard", "API", "App"])} ${faker.word.noun()}`,
        description: faker.lorem.paragraph(),
        skills: pickN(skills, randInt(3, 5)),
        github: `https://github.com/${faker.internet.username()}/${faker.string.alphanumeric(8)}`,
        live: faker.internet.url(),
        duration: `${randInt(1, 6)} months`,
        teamSize: String(randInt(1, experienceYears > 3 ? 6 : 3)),
    }));
};

export const buildCandidates = async (count) => {
    const password = await hashPassword();
    const users = [];
    const profiles = [];

    for (let i = 0; i < count; i++) {
        const experienceYears = pick([0, 1, 2, 3, 4, 5, 6, 8, 10]);
        const skills = buildSkillSet(experienceYears);
        const fullname = faker.person.fullName();
        const email = uniqueEmail("candidate", i);
        const aiScore = randInt(52, 96);
        const salary = salaryForExperience(experienceYears);

        const user = {
            fullname,
            email,
            phoneNumber: faker.phone.number(),
            password,
            role: ROLES.CANDIDATE,
            profile: {
                bio: `${pick(["Frontend", "Backend", "Full Stack", "Data", "ML"])} professional · ${experienceYears} yrs experience`,
                skills,
                profilePhoto: avatarUrl(),
                location: `${faker.location.city()}, ${faker.location.country()}`,
                github: `https://github.com/${faker.internet.username()}`,
                linkedin: `https://linkedin.com/in/${faker.internet.username()}`,
                atsScore: randInt(55, 92),
                aiMatchScore: aiScore,
                preferredRoles: pickN(["Frontend Developer", "Backend Engineer", "Full Stack", "Data Analyst"], 2),
            },
            isActive: true,
            isBlocked: false,
            isEmailVerified: true,
            lastLoginAt: faker.date.recent({ days: 30 }),
            _index: i,
        };

        users.push(user);

        profiles.push({
            _userIndex: i,
            personalInfo: {
                fullName: fullname,
                email,
                phone: user.phoneNumber,
                location: user.profile.location,
                linkedin: user.profile.linkedin,
                github: user.profile.github,
                portfolio: faker.internet.url(),
            },
            summary: faker.lorem.paragraph(),
            skills,
            experience: buildExperience(experienceYears, skills),
            projects: buildProjects(skills, experienceYears),
            education: {
                graduation: {
                    college: faker.company.name() + " University",
                    degree: pick(["B.Tech", "B.E.", "BCA", "B.Sc CS"]),
                    specialization: pick(["Computer Science", "IT", "AI", "Data Science"]),
                    university: faker.company.name(),
                    startYear: String(2016 + randInt(0, 4)),
                    endYear: String(2020 + randInt(0, 4)),
                    cgpa: String(randFloat(6.5, 9.5)),
                },
            },
            certifications: pickN(
                [
                    { name: "AWS Cloud Practitioner", issuer: "Amazon", year: "2023" },
                    { name: "Meta Frontend Professional", issuer: "Meta", year: "2024" },
                ],
                randInt(0, 2)
            ),
            socialLinks: {
                github: user.profile.github,
                linkedin: user.profile.linkedin,
                portfolio: faker.internet.url(),
            },
            aiScore,
            resumeStrength: pick(["Strong", "Good", "Average", "Needs Improvement"]),
            missingSkills: pickN(skillsData.cloud.concat(skillsData.ai_ml), randInt(1, 4)),
            recommendationTags: pickN(["High Potential", "Fast Learner", "Team Player", "Remote Ready"], randInt(2, 4)),
            completionPercentage: randInt(88, 100),
            _seedMeta: {
                experienceYears,
                expectedSalary: salary,
                noticePeriod: pick(["Immediate", "15 days", "30 days", "60 days"]),
                employmentType: pick(["Full-time", "Contract", "Remote"]),
                headline: user.profile.bio,
                profileCompletion: randInt(90, 100),
                recruiterViews: randInt(5, 120),
                searchAppearances: randInt(20, 400),
            },
        });
    }

    return { users, profiles };
};

export const buildResumes = (candidates) => {
    return candidates.map((user) => {
        return {
            userId: user._id,
            user: user._id,
            fileUrl: `https://cloudinary.com/resumes/${user._id}.pdf`,
            originalName: `${user.fullname.replace(/\s+/g, '_')}_Resume.pdf`,
            parsedText: `Resume of ${user.fullname}. Skills: ${user.profile?.skills?.join(", ")}.`,
            extractedSkills: user.profile?.skills || [],
            aiAnalysis: {
                atsScore: user.profile?.atsScore || 70,
                predictedRole: user.profile?.bio || "Software Engineer",
                skills: user.profile?.skills || [],
                strengths: ["Strong technical core", "Highly driven"],
                weaknesses: ["No major weaknesses identified"],
                recommendations: ["Highlight project achievements more"]
            },
            parsedData: { success: true }
        };
    });
};

export const attachProfilesToUsers = (users, profiles, candidateDocs, resumeDocs) => {
    return profiles.map((p, idx) => {
        const { _userIndex, _seedMeta } = p;
        const candDoc = candidateDocs[_userIndex !== undefined ? _userIndex : idx];
        const userId = candDoc._id;
        
        // Find matching resume doc for this user
        const resumeDoc = resumeDocs.find(r => String(r.userId) === String(userId)) || resumeDocs[idx];
        
        // Exclude internal helper fields
        const { _userIndex: unused1, _seedMeta: unused2, ...profileData } = p;
        
        return {
            ...profileData,
            userId,
            user: userId,
            candidateId: userId,
            resume: resumeDoc ? resumeDoc._id : null,
            atsScore: candDoc.profile?.atsScore || p.aiScore || 0,
            headline: candDoc.profile?.bio || "",
            bio: candDoc.profile?.bio || p.summary || ""
        };
    });
};

export const buildResumeAnalyses = (candidateDocs, profiles) =>
    candidateDocs.map((user, idx) => {
        const profile = profiles.find((p) => p._userIndex === idx) || profiles[idx];
        const skills = profile?.skills || user.profile?.skills || [];
        return {
            userId: user._id,
            candidateId: user._id,
            atsScore: user.profile?.atsScore || randInt(55, 90),
            aiScore: profile?.aiScore || randInt(55, 92),
            predictedRole: pick(user.profile?.preferredRoles || ["Software Engineer"]),
            skills,
            strengths: pickN(["Strong fundamentals", "Good project depth", "Clear communication"], 3),
            weaknesses: pickN(["Limited cloud exposure", "Needs system design depth"], 2),
            recommendations: pickN(["Add metrics to resume", "Highlight leadership"], 2),
            missingSkills: profile?.missingSkills || [],
            analyzedAt: faker.date.recent({ days: 60 }),
        };
    });
