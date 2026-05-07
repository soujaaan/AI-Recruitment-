import { faker } from '@faker-js/faker';

const industries = [
    'SaaS', 'AI', 'FinTech', 'Healthcare', 'EdTech', 'E-commerce', 'Cybersecurity', 'Cloud Computing'
];

export const generateCompanies = (count, userIds) => {
    const companies = [];
    
    for (let i = 0; i < count; i++) {
        companies.push({
            name: faker.company.name(),
            description: faker.company.catchPhrase(),
            website: faker.internet.url(),
            location: `${faker.location.city()}, ${faker.location.country()}`,
            logo: faker.image.url({ category: 'business' }),
            industry: faker.helpers.arrayElement(industries),
            employeeCount: faker.number.int({ min: 10, max: 10000 }),
            foundedYear: faker.number.int({ min: 1990, max: 2023 }),
            userId: faker.helpers.arrayElement(userIds) // This will be assigned to a recruiter
        });
    }
    
    return companies;
};
