import { faker } from '@faker-js/faker';

const statuses = ['applied', 'under review', 'shortlisted', 'interview scheduled', 'rejected', 'hired'];

export const generateApplications = (count, candidates, jobs) => {
    const applications = [];
    const usedCombinations = new Set();
    
    while(applications.length < count) {
        const candidate = faker.helpers.arrayElement(candidates);
        const job = faker.helpers.arrayElement(jobs);
        
        const comboKey = `${candidate._id}-${job._id}`;
        
        if (!usedCombinations.has(comboKey)) {
            usedCombinations.add(comboKey);
            
            applications.push({
                job: job._id,
                applicant: candidate._id,
                status: faker.helpers.arrayElement(statuses),
                atsScore: faker.number.int({ min: 40, max: 99 }),
                createdAt: faker.date.recent({ days: 90 }) // spread across recent months
            });
        }
    }
    
    return applications;
};
