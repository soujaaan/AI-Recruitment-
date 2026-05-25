import { ApiError } from "../utils/apiError.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

/**
 * Canonical chat authorization rules:
 * - Recruiter can message only candidates who applied to a job owned by that recruiter.
 * - Candidate can message only recruiters who own the job they applied to.
 * - Acting user must be one of the two room participants.
 */
export const validateChatParticipants = async ({ actingUserId, candidateId, recruiterId, jobId }) => {
  if (!actingUserId || !candidateId || !recruiterId || !jobId) {
    throw new ApiError(400, "actingUserId, candidateId, recruiterId, and jobId are required");
  }

  // Acting user must be a participant.
  if (![candidateId.toString(), recruiterId.toString()].includes(actingUserId.toString())) {
    throw new ApiError(403, "Not a participant");
  }

  // Verify recruiter owns the job.
  const job = await Job.findById(jobId).select("created_by isActive");
  if (!job) throw new ApiError(404, "Job not found");
  if (job.isActive === false) throw new ApiError(403, "Job is not active");
  if (job.created_by.toString() !== recruiterId.toString()) {
    throw new ApiError(403, "Unauthorized: recruiter does not own this job");
  }

  // Verify candidate applied to that job.
  const application = await Application.findOne({ job: jobId, applicant: candidateId }).select("_id");
  if (!application) {
    throw new ApiError(403, "Unauthorized: candidate has not applied to this job");
  }

  return true;
};

