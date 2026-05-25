import mongoose from "mongoose";
import dotenv from "dotenv";

import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { InterviewSchedule } from "../models/interviewSchedule.model.js";
import { User } from "../models/user.model.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const toStr = (v) => (v == null ? "" : String(v));
const safeNum = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("Missing MONGO_URI in env. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: false,
  });

  try {
    const recruiters = await User.find({ role: "recruiter" }).select("_id fullname email companyId");
    const companies = await Company.find({}).select("_id recruiterId userId");

    const companyById = new Map(companies.map((c) => [toStr(c._id), c]));

    const report = {
      totals: {
        recruiters: recruiters.length,
        companies: companies.length,
        jobs: 0,
        applications: 0,
        interviews: 0,
      },
      recruiterResults: [],
      globalFindings: {
        orphanApplications: 0,
        orphanInterviews: 0,
        canonicalVsLegacyJobEmbedMismatch: 0,
      },
      failures: {
        recruitersWithRelationalMismatches: 0,
        recruitersWithZeroCanonicalApplicationsButSomeJobs: 0,
        recruitersWithSomeCanonicalApplicationsButZeroJobEmbeddedApps: 0,
      },
    };

    report.totals.jobs = await Job.countDocuments({});
    report.totals.applications = await Application.countDocuments({});
    report.totals.interviews = await InterviewSchedule.countDocuments({});

    // Global orphan checks (cheap but useful)
    const jobsIds = new Set((await Job.find({}).select("_id").lean()).map((j) => toStr(j._id)));
    const userIds = new Set((await User.find({}).select("_id").lean()).map((u) => toStr(u._id)));

    const orphanApps = await Application.find({})
      .select("_id jobId job recruiterId companyId candidateId applicant")
      .lean();

    let orphanApplications = 0;
    for (const a of orphanApps) {
      const jobRef = a.jobId || a.job;
      const candidateRef = a.candidateId || a.applicant;
      const jobOk = jobRef && jobsIds.has(toStr(jobRef));
      const candOk = candidateRef && userIds.has(toStr(candidateRef));
      if (!jobOk || !candOk) orphanApplications++;
    }
    report.globalFindings.orphanApplications = orphanApplications;

    const orphanInterviews = await InterviewSchedule.find({})
      .select("_id applicationId app jobId job recruiterId candidateId candidate")
      .lean();

    const appIds = new Set((await Application.find({}).select("_id").lean()).map((x) => toStr(x._id)));
    const interviewerJobs = 0;

    let orphanIv = 0;
    for (const iv of orphanInterviews) {
      const appRef = iv.applicationId || iv.application;
      const jobRef = iv.jobId || iv.job;
      const candRef = iv.candidateId || iv.candidate;
      if ((appRef && !appIds.has(toStr(appRef))) || (jobRef && !jobsIds.has(toStr(jobRef))) || (candRef && !userIds.has(toStr(candRef)))) {
        orphanIv++;
      }
    }
    report.globalFindings.orphanInterviews = orphanIv;

    // Per-recruiter detailed audit
    for (const r of recruiters) {
      const recruiterId = toStr(r._id);

      const recruiterJobs = await Job.find({ recruiterId: r._id }).select("_id recruiterId companyId created_by applications applicantCount status isActive")
        .lean();

      const recruiterJobIds = recruiterJobs.map((j) => j._id);

      // canonical apps by jobId
      const canonicalApps = await Application.find({ jobId: { $in: recruiterJobIds } })
        .select("_id jobId job recruiterId companyId candidateId applicant applicationStatus status")
        .lean();

      const canonicalAppCount = canonicalApps.length;

      // embedded apps on jobs (legacy embed)
      const embeddedCountSum = recruiterJobs.reduce((acc, j) => acc + safeNum(j.applications?.length || 0), 0);

      // recruiter mismatches in canonical apps
      let appRecruiterMismatch = 0;
      let appCompanyMismatch = 0;
      let appJobMismatch = 0;
      let appOrphanCandidate = 0;

      for (const a of canonicalApps) {
        if (a.recruiterId && toStr(a.recruiterId) !== recruiterId) appRecruiterMismatch++;
        const job = recruiterJobs.find((j) => toStr(j._id) === toStr(a.jobId || a.job));
        if (job) {
          if (a.companyId && toStr(a.companyId) !== toStr(job.companyId)) appCompanyMismatch++;
        } else {
          appJobMismatch++;
        }
        const candRef = a.candidateId || a.applicant;
        if (candRef && !userIds.has(toStr(candRef))) appOrphanCandidate++;
      }

      // interviews validity (belong to recruiter apps)
      const recruiterAppIds = new Set(canonicalApps.map((a) => toStr(a._id)));
      const interviews = await InterviewSchedule.find({ applicationId: { $in: canonicalApps.map((a) => a._id) } })
        .select("_id applicationId recruiterId jobId candidateId status")
        .lean();

      let interviewRecruiterMismatch = 0;
      let interviewJobMismatch = 0;
      let interviewOrphan = 0;

      for (const iv of interviews) {
        const appRef = toStr(iv.applicationId);
        if (!recruiterAppIds.has(appRef)) interviewOrphan++;
        if (iv.recruiterId && toStr(iv.recruiterId) !== recruiterId) interviewRecruiterMismatch++;
      }

      // Decide which mismatch counters matter for your symptom
      const recruiterJobCount = recruiterJobs.length;
      const hasSomeAppsCanon = canonicalAppCount > 0;
      const hasSomeAppsEmbedded = embeddedCountSum > 0;

      if (!hasSomeAppsCanon && recruiterJobCount > 0) {
        report.failures.recruitersWithZeroCanonicalApplicationsButSomeJobs++;
      }
      if (hasSomeAppsCanon && !hasSomeAppsEmbedded) {
        report.failures.recruitersWithSomeCanonicalApplicationsButZeroJobEmbeddedApps++;
      }

      const recruiterHasRelationalMismatch =
        appRecruiterMismatch > 0 ||
        appCompanyMismatch > 0 ||
        appJobMismatch > 0 ||
        appOrphanCandidate > 0 ||
        interviewRecruiterMismatch > 0 ||
        interviewOrphan > 0;

      if (recruiterHasRelationalMismatch) report.failures.recruitersWithRelationalMismatches++;

      report.recruiterResults.push({
        recruiterId,
        recruiterFullname: r.fullname,
        recruiterEmail: r.email,
        recruiterJobsCount: recruiterJobCount,
        recruiterJobsStatus: {
          open: recruiterJobs.filter((j) => j.status === "open").length,
          active: recruiterJobs.filter((j) => j.isActive !== false).length,
        },
        canonicalApplicationsCount: canonicalAppCount,
        embeddedJobApplicationsCountSum: embeddedCountSum,
        appRecruiterMismatch,
        appCompanyMismatch,
        appJobMismatch,
        appOrphanCandidate,
        interviewsCount: interviews.length,
        interviewRecruiterMismatch,
        interviewJobMismatch,
        interviewOrphan,
        // actionable signal for the symptom
        symptomLikelyIf:
          hasSomeAppsCanon && !hasSomeAppsEmbedded
            ? "UI likely using legacy embedded job.applications[] while seed/flow only guaranteed canonical Application linkage"
            : "No definitive symptom signal from this recruiter alone",
      });

      if (hasSomeAppsCanon && !hasSomeAppsEmbedded) {
        report.globalFindings.canonicalVsLegacyJobEmbedMismatch++;
      }
    }

    // sort for easy viewing
    report.recruiterResults.sort((a, b) => {
      const da = (b.canonicalApplicationsCount - a.canonicalApplicationsCount);
      if (da !== 0) return da;
      return (b.embeddedJobApplicationsCountSum - a.embeddedJobApplicationsCountSum);
    });

    // Print summary + top issues
    console.log("\n===== Recruiter relational audit report =====");
    console.log(JSON.stringify(report, null, 2));

    // Also write a file for easier inspection
    const outPath = new URL("./recruiter_relational_audit_report.json", import.meta.url).pathname;
    await (await import("fs/promises")).writeFile(outPath, JSON.stringify(report, null, 2), "utf-8");
    console.log("Report written to:", outPath);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});

