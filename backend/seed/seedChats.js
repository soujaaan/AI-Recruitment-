import { faker } from "@faker-js/faker";
import { pick, randInt } from "./helpers.js";

const RECRUITER_MESSAGES = [
    "Thanks for applying! I'd like to schedule a quick intro call.",
    "Your profile looks strong for this role. Are you available this week?",
    "We reviewed your application — can you share availability for a technical round?",
    "Following up on your application status. Let me know if you have questions.",
    "The hiring manager liked your resume. Next step is a 45-min video interview.",
];

const CANDIDATE_MESSAGES = [
    "Thank you! I'm very interested in this opportunity.",
    "I'm available Tuesday or Thursday afternoon for a call.",
    "Happy to share more details about my recent project work.",
    "What would be the expected timeline for the next round?",
    "I've updated my portfolio link — please take a look when you can.",
];

export const buildChatRooms = (roomCount, applications) => {
    const rooms = [];
    const usedTriplets = new Set();
    const eligible = applications.filter((a) =>
        ["shortlisted", "interview scheduled", "under review", "applied"].includes(
            a.applicationStatus || a.status
        )
    );
    const pool = eligible.length ? eligible : applications;

    let guard = 0;
    while (rooms.length < roomCount && guard < roomCount * 5) {
        guard++;
        const app = pick(pool);
        const triplet = `${app.candidateId}:${app.recruiterId}:${app.jobId}`;
        if (usedTriplets.has(triplet)) continue;
        usedTriplets.add(triplet);

        const created = faker.date.past({ years: 0.2 });
        rooms.push({
            participants: [app.candidateId, app.recruiterId],
            candidateId: app.candidateId,
            recruiterId: app.recruiterId,
            jobId: app.jobId,
            lastMessage: "Conversation started",
            lastMessageSender: app.recruiterId,
            lastMessageAt: created,
            isActive: true,
            createdAt: created,
            updatedAt: created,
        });
    }
    return rooms;
};

export const buildChatMessages = (rooms, messageTarget) => {
    const messages = [];
    const perRoom = Math.max(3, Math.ceil(messageTarget / Math.max(rooms.length, 1)));

    for (const room of rooms) {
        const count = randInt(perRoom - 1, perRoom + 2);
        let lastText = room.lastMessage;
        let lastSender = room.lastMessageSender;
        let lastAt = room.lastMessageAt;

        for (let m = 0; m < count; m++) {
            const fromRecruiter = m % 2 === 0;
            const senderId = fromRecruiter ? room.recruiterId : room.candidateId;
            const receiverId = fromRecruiter ? room.candidateId : room.recruiterId;
            const text = fromRecruiter ? pick(RECRUITER_MESSAGES) : pick(CANDIDATE_MESSAGES);
            const createdAt = faker.date.between({ from: room.createdAt, to: new Date() });

            messages.push({
                roomId: room._id,
                senderId,
                receiverId,
                text,
                messageType: "text",
                isRead: Math.random() < 0.72,
                readAt: Math.random() < 0.5 ? createdAt : null,
                createdAt,
            });
            lastText = text;
            lastSender = senderId;
            lastAt = createdAt;
        }

        room.lastMessage = lastText;
        room.lastMessageSender = lastSender;
        room.lastMessageAt = lastAt;
    }

    return messages;
};
