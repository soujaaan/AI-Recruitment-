# TODO - Assessment Engine Removal & AI Interview Flow

## Completed

- [x] Remove assessment API mounting (`backend/index.js`)
- [x] Delete assessment routes, controllers, models, services
- [x] Remove assessment DB fields from Application & Job schemas
- [x] Update candidate controller (interview logs instead of assessments)
- [x] Add `AIInterviewLog` model + enhanced interview questions API
- [x] Delete `Assessment.jsx` and `Questions.jsx`
- [x] Remove frontend routes `/assessment/:jobId` and `/admin/questions`
- [x] Fix apply flow in `JobDescription.jsx`
- [x] Remove assessment UI from `JobApplicants.jsx` and `CandidateProfile.jsx`
- [x] Add "Generate Interview Questions" on recruiter candidate profile
- [x] Frontend production build verified

## Optional follow-up

- [ ] Manually drop obsolete MongoDB collections (see `ASSESSMENT_REMOVAL_REPORT.md`)
- [ ] Delete `saved/` MCQ JSON files if no longer needed
- [ ] Remove orphaned `frontend/src/components/ai/AIInterviewPanel.jsx`
- [ ] Update `frontend/src/services/ai.service.js` to match new API shape
