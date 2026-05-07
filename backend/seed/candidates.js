import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { getAllSkills } from './skills.js';

const jobTitles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 
    'AI Engineer', 'Data Analyst', 'UI/UX Designer', 
    'Product Manager', 'HR Executive', 'DevOps Engineer',
    'MERN Stack Developer', 'Senior Software Engineer', 'Junior Developer'
];

export const generateCandidates = async (count) => {
    const candidates = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const allSkills = getAllSkills();
    
    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const numSkills = faker.number.int({ min: 3, max: 8 });
        const userSkills = faker.helpers.arrayElements(allSkills, numSkills);
        
        candidates.push({
            fullname: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            phoneNumber: faker.phone.number({ style: 'international' }),
            password: hashedPassword,
            role: 'candidate',
            profile: {
                bio: faker.person.bio(),
                skills: userSkills,
                resume: `uploads/resumes/resume_${faker.helpers.arrayElement([1, 2])}.pdf`,
                resumeOriginalName: `${firstName}_${lastName}_Resume.pdf`,
                profilePhoto: faker.image.avatar(),
                education: [`${faker.helpers.arrayElement(['B.Tech', 'B.Sc', 'M.Tech', 'MBA'])} from ${faker.company.name()} University`],
                experience: [`${faker.number.int({min: 0, max: 10})} years of experience as ${faker.person.jobTitle()}`],
                atsScore: faker.number.int({ min: 55, max: 98 }),
                aiMatchScore: faker.number.int({ min: 50, max: 99 }),
                preferredRoles: faker.helpers.arrayElements(jobTitles, faker.number.int({ min: 1, max: 3 })),
                location: `${faker.location.city()}, ${faker.location.country()}`,
                github: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
                linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`
            },
            isActive: true,
            isEmailVerified: true
        });
    }
    
    return candidates;
};
