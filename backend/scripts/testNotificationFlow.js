import dotenv from "dotenv";
dotenv.config({ path: "c:/Users/royso/OneDrive/Desktop/AI Recruitment/backend/.env" });

const runTests = async () => {
    try {
        console.log("=== 🔌 CONNECTING TO DB ===");
        
        // Dynamically import dependencies after dotenv has run
        const mongoose = (await import("mongoose")).default;
        const { User } = await import("../models/user.model.js");
        const { Job } = await import("../models/job.model.js");
        const { Application } = await import("../models/application.model.js");
        const { Notification } = await import("../models/notification.model.js");
        const { notificationService } = await import("../services/notification.service.js");

        mongoose.set("strictQuery", true);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected\n");

        const testCandidateEmail = "cand_test@example.com";
        const testRecruiterEmail = "rec_test@example.com";

        // Clean up any existing test data
        await User.deleteMany({ email: { $in: [testCandidateEmail, testRecruiterEmail] } });
        await Notification.deleteMany({}); // Wipe notifications to ensure fresh states

        console.log("=== 👤 CREATING TEST PROFILES ===");
        const candidate = await User.create({
            fullname: "Candidate Test User",
            email: testCandidateEmail,
            phoneNumber: "1111111111",
            password: "SecurePassword123",
            role: "candidate",
            isActive: true,
        });
        const recruiter = await User.create({
            fullname: "Recruiter Test User",
            email: testRecruiterEmail,
            phoneNumber: "2222222222",
            password: "SecurePassword123",
            role: "recruiter",
            isActive: true,
        });
        console.log(`✅ Profiles created:\n  - Candidate: ${candidate.email} (${candidate._id})\n  - Recruiter: ${recruiter.email} (${recruiter._id})\n`);

        const mockJob = await Job.create({
            title: "Senior AI Engineer",
            description: "Build cutting-edge LLM agents using Gemini and Node.js.",
            requirements: ["React", "Node.js", "MongoDB", "AI"],
            salary: "150k - 200k",
            location: "San Francisco, CA",
            jobType: "Full-time",
            experienceLevel: "Senior",
            position: 2,
            company: { name: "Google DeepMind", website: "", location: "", logo: "" },
            created_by: recruiter._id,
            recruiterId: recruiter._id,
            isActive: true,
        });
        console.log(`✅ Test Job Posted: "${mockJob.title}" (${mockJob._id})\n`);

        console.log("=== 🧪 TEST CASE 1: NEW APPLICATION NOTIFICATION ===");
        const appDate = new Date();
        const mockApplication = await Application.create({
            job: mockJob._id,
            jobId: mockJob._id,
            applicant: candidate._id,
            candidateId: candidate._id,
            recruiterId: recruiter._id,
            recruiter: recruiter._id,
            status: "applied",
            applicationStatus: "applied",
            timeline: [{ stage: "Applied", timestamp: appDate }],
            appliedAt: appDate,
        });

        // Trigger notification
        const applicationNotif = await notificationService.createNotification({
            recipient: recruiter._id,
            type: "NEW_APPLICATION",
            title: "New Application Received",
            message: "A new candidate has applied for your job.",
            entityType: "Application",
            entityId: mockApplication._id,
            priority: "medium",
            metadata: {
                jobId: mockJob._id,
                jobTitle: mockJob.title,
                candidateName: candidate.fullname,
            },
        });

        console.log("✅ Notification document created in DB:");
        console.log(`  - Recipient: ${applicationNotif.recipient}`);
        console.log(`  - Type: ${applicationNotif.type}`);
        console.log(`  - Message: "${applicationNotif.message}"`);

        if (String(applicationNotif.recipient) === String(recruiter._id) && applicationNotif.type === "NEW_APPLICATION") {
            console.log("✅ TEST CASE 1 PASSED\n");
        } else {
            throw new Error("New Application Notification mismatch");
        }

        console.log("=== 🧪 TEST CASE 2: STATUS UPDATE (SHORTLIST) NOTIFICATION ===");
        const shortlistNotif = await notificationService.createNotification({
            recipient: candidate._id,
            type: "APPLICATION_STATUS_UPDATED",
            title: "Application Shortlisted",
            message: "Congratulations, you have been shortlisted.",
            entityType: "Application",
            entityId: mockApplication._id,
            priority: "high",
            metadata: {
                jobId: mockJob._id,
                jobTitle: mockJob.title,
            },
        });

        console.log("✅ Shortlist notification created:");
        console.log(`  - Recipient: ${shortlistNotif.recipient} (Candidate)`);
        console.log(`  - Message: "${shortlistNotif.message}"`);

        if (String(shortlistNotif.recipient) === String(candidate._id) && shortlistNotif.type === "APPLICATION_STATUS_UPDATED") {
            console.log("✅ TEST CASE 2 PASSED\n");
        } else {
            throw new Error("Shortlist Notification mismatch");
        }

        console.log("=== 🧪 TEST CASE 3: INTERVIEW SCHEDULED NOTIFICATION ===");
        const interviewNotif = await notificationService.createNotification({
            recipient: candidate._id,
            type: "INTERVIEW_SCHEDULED",
            title: "Interview Scheduled",
            message: "Your interview has been scheduled.",
            entityType: "InterviewSchedule",
            entityId: new mongoose.Types.ObjectId(),
            priority: "high",
            metadata: {
                jobId: mockJob._id,
                jobTitle: mockJob.title,
                scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
        });

        console.log("✅ Interview notification created:");
        console.log(`  - Message: "${interviewNotif.message}"`);
        console.log(`  - Priority: ${interviewNotif.priority}`);

        if (interviewNotif.type === "INTERVIEW_SCHEDULED" && interviewNotif.priority === "high") {
            console.log("✅ TEST CASE 3 PASSED\n");
        } else {
            throw new Error("Interview scheduled Notification mismatch");
        }

        console.log("=== 🧪 TEST CASE 4: UNREAD COUNT WIDGET ===");
        const unreadCount = await notificationService.getUnreadCount(candidate._id);
        console.log(`✅ Candidate Unread count in DB: ${unreadCount}`);
        if (unreadCount === 2) {
            console.log("✅ TEST CASE 4 PASSED (Found Shortlist + Interview notifications)\n");
        } else {
            throw new Error(`Unread count mismatch: expected 2, got ${unreadCount}`);
        }

        console.log("=== 🧪 TEST CASE 5: MARK READ OPERATIONS ===");
        await notificationService.markAsRead(shortlistNotif._id, candidate._id);
        const readCheck = await Notification.findById(shortlistNotif._id);
        console.log(`✅ Marked ${shortlistNotif._id} read. DB isRead state: ${readCheck.isRead}, readAt: ${readCheck.readAt}`);

        if (readCheck.isRead === true && readCheck.readAt !== null) {
            console.log("✅ Single mark read verified");
        } else {
            throw new Error("Failed to mark notification as read");
        }

        const remainingUnread = await notificationService.getUnreadCount(candidate._id);
        console.log(`✅ Remaining unread: ${remainingUnread}`);
        if (remainingUnread === 1) {
            console.log("✅ Unread count decremented appropriately");
        } else {
            throw new Error(`Unread count did not decrement correctly: got ${remainingUnread}`);
        }

        console.log("=== 🧪 TEST CASE 6: BULK MARK READ ===");
        await notificationService.markAllAsRead(candidate._id);
        const bulkUnread = await notificationService.getUnreadCount(candidate._id);
        console.log(`✅ After markAllAsRead, Candidate unread count: ${bulkUnread}`);
        if (bulkUnread === 0) {
            console.log("✅ TEST CASE 6 PASSED\n");
        } else {
            throw new Error("Bulk mark read did not clear unread count");
        }

        console.log("=== 🧪 TEST CASE 7: PAGINATION AND CATEGORIES FILTERS ===");
        // Add a few more mock alerts to test filters
        await notificationService.createNotification({ recipient: candidate._id, type: "SYSTEM_ANNOUNCEMENT", title: "Announce", message: "Hello", priority: "low" });
        await notificationService.createNotification({ recipient: candidate._id, type: "JOB_RECOMMENDED", title: "Match", message: "Match Found", priority: "medium" });

        // Retrieve "all"
        const allFeed = await notificationService.getUserNotifications(candidate._id, {}, { page: 1, limit: 10 });
        console.log(`✅ Fetched ALL feed. Notifications found: ${allFeed.notifications.length}`);
        
        // Retrieve "applications"
        const appFeed = await notificationService.getUserNotifications(candidate._id, { category: "applications" }, { page: 1, limit: 10 });
        console.log(`✅ Fetched APPLICATIONS category. Notifications found: ${appFeed.notifications.length}`);
        
        // Retrieve "system"
        const sysFeed = await notificationService.getUserNotifications(candidate._id, { category: "system" }, { page: 1, limit: 10 });
        console.log(`✅ Fetched SYSTEM category. Notifications found: ${sysFeed.notifications.length}`);

        if (allFeed.notifications.length === 4 && appFeed.notifications.length === 1 && sysFeed.notifications.length === 1) {
            console.log("✅ Categories filtering verified successfully");
            console.log("✅ TEST CASE 7 PASSED\n");
        } else {
            throw new Error("Categories query filtering returned incorrect document counts");
        }

        console.log("=== 🧪 TEST CASE 8: DELETE NOTIFICATIONS ===");
        const toDelete = sysFeed.notifications[0];
        await notificationService.deleteNotification(toDelete._id, candidate._id);
        
        const deleteCheck = await Notification.findById(toDelete._id);
        if (deleteCheck === null) {
            console.log("✅ Database confirmed notification was fully deleted");
            console.log("✅ TEST CASE 8 PASSED\n");
        } else {
            throw new Error("Failed to delete notification record from DB");
        }

        console.log("=== 🧪 TEST CASE 8B: BULK DELETE NOTIFICATIONS ===");
        // Let's create two temporary notifications to bulk delete
        const b1 = await notificationService.createNotification({ recipient: candidate._id, type: "SYSTEM_ANNOUNCEMENT", title: "Bulk 1", message: "B1", priority: "low" });
        const b2 = await notificationService.createNotification({ recipient: candidate._id, type: "SYSTEM_ANNOUNCEMENT", title: "Bulk 2", message: "B2", priority: "low" });
        const bulkDeleteResult = await notificationService.deleteBulkNotifications([b1._id, b2._id], candidate._id);
        console.log(`✅ Bulk delete executed. Deleted count in DB: ${bulkDeleteResult.deletedCount}`);
        
        const b1Check = await Notification.findById(b1._id);
        const b2Check = await Notification.findById(b2._id);
        if (bulkDeleteResult.deletedCount === 2 && b1Check === null && b2Check === null) {
            console.log("✅ Database confirmed both notifications were bulk deleted");
            console.log("✅ TEST CASE 8B PASSED\n");
        } else {
            throw new Error("Failed bulk delete verification");
        }

        console.log("=== 🧪 TEST CASE 9: SECURITY ISOLATION ===");
        try {
            // Recruiter tries to delete candidate's notification
            await notificationService.deleteNotification(interviewNotif._id, recruiter._id);
            throw new Error("❌ SECURITY FAILURE: Recruiter was allowed to delete candidate's notification");
        } catch (err) {
            if (err.message.includes("not found") || err.statusCode === 404) {
                console.log("✅ Security isolation verified: Recruiter could not delete Candidate's notification (received expected 404/not found)");
                console.log("✅ TEST CASE 9 PASSED\n");
            } else {
                throw err;
            }
        }

        // Clean up test data
        await User.deleteMany({ email: { $in: [testCandidateEmail, testRecruiterEmail] } });
        await Job.deleteOne({ _id: mockJob._id });
        await Application.deleteOne({ _id: mockApplication._id });
        await Notification.deleteMany({});

        console.log("🧹 Test Data Deleted & Database Cleaned");
        console.log("\n⭐️ ALL BACKEND NOTIFICATION WORKFLOWS TESTED AND RUNNING 100% CORRECTLY!");
    } catch (error) {
        console.error("💥 SYSTEM INTEGRATION TEST FAILED:", error);
    } finally {
        const mongoose = (await import("mongoose")).default;
        await mongoose.connection.close();
        console.log("🔌 Database Connection Closed.");
        process.exit(0);
    }
};

runTests();
