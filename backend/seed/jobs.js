import { faker } from '@faker-js/faker';
import { getAllSkills } from './skills.js';

const jobTitles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 
    'AI Engineer', 'Data Analyst', 'UI/UX Designer', 
    'Product Manager', 'HR Executive', 'DevOps Engineer'
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Director'];

export const generateJobs = (count, companies, recruiters) => {
    const jobs = [];
    const allSkills = getAllSkills();
    
    for (let i = 0; i < count; i++) {
        const company = faker.helpers.arrayElement(companies);
        const recruiter = faker.helpers.arrayElement(recruiters);
        
        jobs.push({
            title: faker.helpers.arrayElement(jobTitles),
            description: faker.lorem.paragraphs({ min: 2, max: 5 }),
            requirements: faker.helpers.arrayElements(allSkills, faker.number.int({ min: 3, max: 10 })),
            salary: `${faker.number.int({ min: 30, max: 150 })}k - ${faker.number.int({ min: 160, max: 300 })}k`,
            experienceLevel: faker.helpers.arrayElement(experienceLevels),
            location: faker.helpers.arrayElement([`${faker.location.city()}, ${faker.location.country()}`, 'Remote', 'Hybrid']),
            jobType: faker.helpers.arrayElement(jobTypes),
            position: faker.number.int({ min: 1, max: 10 }),
            company: {
                name: company.name,
                website: company.website,
                location: company.location,
                logo: company.logo
            },
            created_by: recruiter._id, // References a recruiter user ID
            applications: [],
            isActive: faker.datatype.boolean({ probability: 0.8 }),
            isFlagged: false,
            createdAt: faker.date.past({ years: 1 })
        });
    }
    
    return jobs;
};
