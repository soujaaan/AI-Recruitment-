import { z } from "zod";

export const applicationSchema = z.object({
    status: z.enum(["Accepted", "Rejected", "pending"]).optional(),
});
