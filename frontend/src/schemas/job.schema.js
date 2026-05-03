import { z } from "zod";

export const jobSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(5, "Description is required"),
    requirements: z.string().min(2, "Requirements are required"),
    salary: z.string().min(1, "Salary is required"),
    location: z.string().min(2, "Location is required"),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"], {
        errorMap: () => ({ message: "Job type is required" }),
    }),
    experienceLevel: z.enum(["0-1", "1-3", "3-5", "5+"], {
        errorMap: () => ({ message: "Experience is required" }),
    }),
    position: z.string().min(1, "Position is required"),
    companyName: z.string().min(1, "Company name is required"),
    companyWebsite: z.string().optional(),
    companyLocation: z.string().optional(),
});
