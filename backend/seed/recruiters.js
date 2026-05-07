import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export const generateRecruiters = async (count) => {
    const recruiters = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        
        recruiters.push({
            fullname: `${firstName} ${lastName}`,
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            phoneNumber: faker.phone.number({ style: 'international' }),
            password: hashedPassword,
            role: 'recruiter',
            profile: {
                bio: faker.person.bio(),
                profilePhoto: faker.image.avatar(),
                // company: will be assigned later
            },
            isActive: true,
            isEmailVerified: true
        });
    }
    
    return recruiters;
};
