import { z } from "zod";

export const jobSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(5, "Description is required"),
    requirements: z.string().min(2, "Requirements are required"),
    salary: z.string().min(1, "Salary is required"),
    location: z.string().min(2, "Location is required"),
    jobType: z.string().min(2, "Job type is required"),
    experience: z.string().min(1, "Experience is required"),
    position: z.string().min(1, "Position is required"),
    companyId: z.string().min(1, "Company is required"),
});
