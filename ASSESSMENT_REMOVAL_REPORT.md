# Assessment Engine Removal — Cleanup Report

**Date:** May 21, 2026  
**Objective:** Transform AI Recruitment from an examination platform into an AI-first hiring platform.

---

## Summary

The full MCQ/assessment examination engine has been removed. It is replaced by a lightweight **AI Interview Preparation & Question Generator** with optional persistence in `AIInterviewLog`.

Core features preserved: JWT auth, chat, ATS resume analysis, job applications, recruiter workflows.

---

## Files Removed

### Backend (13 files)
| File | Purpose |
|------|---------|
| `backend/routes/assessment.route.js` | Assessment API routes |
| `backend/controllers/assessment.controller.js` | Legacy v1 assessment |
| `backend/controllers/assessment.controller2.js` | v2 MCQ exam flow |
| `backend/controllers/assessmentGeneration.controller.js` | Deprecated AI MCQ stub |
| `backend/controllers/questionBank.controller.js` | Question bank CRUD |
| `backend/models/question.model.js` | Legacy questions |
| `backend/models/questionBank.model.js` | MCQ question bank |
| `backend/models/assessmentAttempt.model.js` | Legacy attempts |
| `backend/models/assessment.model.js` | Job-level exam papers |
| `backend/models/candidateAssessment.model.js` | Per-candidate attempts |
| `backend/services/groqAssessment.service.js` | AI MCQ generation |
| `backend/services/aiQuestionGenerator.js` | Unused MCQ generator |
| `backend/scripts/importQuestionBanks.js` | JSON bank importer |

### Frontend (2 files)
| File | Purpose |
|------|---------|
| `frontend/src/pages/candidate/Assessment.jsx` | Timed MCQ exam UI |
| `frontend/src/pages/admin/Questions.jsx` | Question bank admin |

### Optional cleanup (not deleted — data-only)
- `saved/*.json` — 19 MCQ bank files (no runtime dependency; safe to delete manually)

---

## Routes Removed

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/assessment/start/:jobId` | Removed |
| `POST` | `/api/v1/assessment/submit/:attemptId` | Removed |
| `GET` | `/api/v1/assessment/questions` | Removed |
| `POST` | `/api/v1/assessment/questions` | Removed |
| `DELETE` | `/api/v1/assessment/questions/:id` | Removed |
| `POST` | `/api/v1/assessment/generate` | Removed |

**Note:** `/api/v1/assessment` was already unmounted in `backend/index.js` before this refactor.

### Frontend routes removed
- `/assessment/:jobId` (candidate exam)
- `/admin/questions` (question bank)

---

## MongoDB Collections Deprecated

These collections may still exist in your database but are **no longer used** by the application:

| Collection | Former model |
|------------|--------------|
| `questions` | Question |
| `questionbanks` | QuestionBank |
| `assessmentattempts` | AssessmentAttempt |
| `assessments` | Assessment |
| `candidateassessments` | CandidateAssessment |

### New collection
| Collection | Model | Purpose |
|------------|-------|---------|
| `aiinterviewlogs` | AIInterviewLog | Stores generated interview questions |

### Schema fields removed
- **Application:** `assessmentAttempt`, `assessmentScore`, `timeEfficiency`
- **Job:** `assessmentEnabled`, `assessmentDuration`, `assessmentQuestionCount`

---

## APIs Added / Enhanced

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai/interview-questions/generate` | Generate 10–12 contextual interview questions |
| `POST` | `/api/ai/interview-questions` | Backward-compatible alias |
| `GET` | `/api/ai/interview-questions/logs?jobId=&candidateId=` | Fetch recent logs (recruiter/admin) |

**Request body (generate):**
```json
{
  "jobId": "...",
  "candidateId": "...",
  "interviewStyle": "technical|hr|mixed",
  "storeLog": true
}
```

**Not built:** timers, anti-cheat, coding compiler, auto-grading, live evaluation.

---

## Frontend Changes

| Component | Change |
|-----------|--------|
| `App.jsx` | Removed assessment & questions routes |
| `JobDescription.jsx` | Apply → redirect to `/applications` (no exam) |
| `AdminJobs.jsx` | Removed "Question Bank" button |
| `JobApplicants.jsx` | Removed assessment score column/sort |
| `CandidateProfile.jsx` | Added "Generate Interview Questions" + log history |

---

## Architecture Simplifications

1. **Single AI path** for interview prep — Groq via `aiGroqChat.js` (shared with resume/chat).
2. **Recruiter workflow:** Apply → Review ATS → Generate Questions → Message → Shortlist.
3. **Reduced API surface** — 6 assessment endpoints removed, 1 log endpoint added.
4. **No duplicate controllers** — v1/v2 assessment controllers eliminated.
5. **No socket assessment events** — chat socket unchanged.

---

## Performance Improvements

| Area | Impact |
|------|--------|
| Backend bundle | ~35KB+ of assessment controllers/services removed |
| Frontend bundle | `Assessment.jsx` (~15KB) + `Questions.jsx` (~23KB) removed |
| DB queries | No question bank scans, no attempt tracking |
| Lazy routes | 2 fewer code-split chunks in production build |
| Maintenance | No MCQ import scripts, no anti-cheat, no grading logic |

---

## Preserved Features (verified)

- JWT authentication & role-based access
- Real-time recruiter ↔ candidate chat (Socket.io)
- ATS resume analysis & scoring
- Resume upload & build flow
- Job posting & applicant management
- AI career copilot chat
- Candidate profile API (now includes `interviewLogs`)

---

## Manual DB Cleanup (optional)

Run in MongoDB shell to drop obsolete collections after backup:

```javascript
db.questions.drop()
db.questionbanks.drop()
db.assessmentattempts.drop()
db.assessments.drop()
db.candidateassessments.drop()
```

To strip legacy fields from existing documents:

```javascript
db.applications.updateMany({}, { $unset: { assessmentAttempt: "", assessmentScore: "", timeEfficiency: "" } })
db.jobs.updateMany({}, { $unset: { assessmentEnabled: "", assessmentDuration: "", assessmentQuestionCount: "" } })
```

---

## Build Verification

- Backend: `node --check` on modified controllers — **pass**
- Frontend: `npm run build` — **pass** (3158 modules, no import errors)

---

## New Recruiter Flow

```
Candidate Applies
       ↓
Recruiter opens Job Applicants → View Profile
       ↓
Click "Generate Interview Questions"
       ↓
AI generates technical / HR / project / experience questions
       ↓
(Optional) Stored in AIInterviewLog
       ↓
Recruiter conducts live interview → Shortlist / Reject / Message
```
