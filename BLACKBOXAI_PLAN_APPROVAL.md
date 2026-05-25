# AI Assessment Engine — Edit Plan (Approval Needed)

## Information gathered
- Backend already has a candidate assessment flow at `POST /api/v1/assessment/start/:jobId` and `POST /api/v1/assessment/submit/:attemptId`.
- Current backend assessment uses a `Question` bank (`backend/models/question.model.js`) and creates an `AssessmentAttempt` (`backend/models/assessmentAttempt.model.js`).
- There is **no** endpoint for Groq-driven dynamic question generation (search showed none).
- Frontend assessment page (`frontend/src/pages/candidate/Assessment.jsx`) renders questions coming from the `AssessmentAttempt` returned by `/start/:jobId`.
- Frontend currently does **not** show sample placeholders; it renders `attempt.questions[].question`.
- Application model stores only `assessmentScore` and summary strings; no schema exists yet for `generatedQuestions`, `answers`, `feedbackSummary`, `weakAreas`, or detailed analytics per skill.
- Groq client wrapper exists: `backend/utils/aiGroqChat.js`.

## Plan
### Backend
1. Create new endpoint and route:
   - `POST /api/v1/assessment/generate`
   - Request body: `{ jobRole, skills, experienceLevel, questionCount, difficulty }`
2. Implement `services/groqAssessment.service.js`:
   - Validate request body (types, ranges, length constraints).
   - Build role/skills/difficulty/experience prompts.
   - Call Groq with strict JSON instructions.
   - Parse JSON safely.
   - Retry with fallback prompt once or twice if parsing fails / invalid schema.
   - Deduplicate questions by (question text + skill tag).
   - Ensure exactly `questionCount` questions returned (or error).
   - Return **clean structured JSON only**.
3. Add persistence model/scheme for generated assessment session:
   - Extend existing assessment attempt schema OR add a new schema that can store:
     - generatedQuestions (question text/options/skill/difficulty)
     - answers (candidate answers)
     - score + skill-wise analytics
     - feedbackSummary, weakAreas
   - Keep it compatible with current attempt flow.
4. Update assessment workflow:
   - Recruiter generation step should persist a generated assessment payload linked to jobRole/skills (and recruiterId).
   - Candidate `start/:jobId` should fetch the previously generated payload for that jobRole (or generate on-demand if missing).
   - Candidate `submit/:attemptId` should:
     - score MCQ deterministically
     - for text questions, use Groq evaluation (or a deterministic heuristic) to determine correctness/quality
     - compute percentage
     - produce skill-wise analytics + weak areas + recommendations
     - persist results to DB.
5. Update existing `/questions` admin endpoints only if needed; they should not be used by the dynamic flow.

### Frontend
1. Add API call in recruiter flow (not present yet in current visible files):
   - Call `/api/v1/assessment/generate` after selecting job role + skills.
2. Update candidate `Assessment.jsx`:
   - Ensure it never shows dummy/sample questions.
   - Fetch/generate status should show:
     - “Generating AI Assessment...”
     - skeleton UI + spinner
   - Add localStorage-backed autosave for answers and restore on refresh.
   - Persist option selection while navigating.
   - Render only AI question fields required for attempt (hide correctAnswer/explanations).
3. Add result screen data rendering:
   - Total score, correct vs incorrect
   - Skill-wise breakdown
   - Weak areas and AI feedback + recommendations.

## Dependent files to edit
- `backend/routes/assessment.route.js`
- `backend/controllers/assessment.controller.js`
- `backend/services/` (new `groqAssessment.service.js`)
- `backend/utils/` (new helper prompt builder / validators if needed)
- `backend/models/assessmentAttempt.model.js` (extend)
- `backend/models/` (new schema if needed)
- `frontend/src/pages/candidate/Assessment.jsx` (autosave, loading states, render changes)
- Potentially recruiter UI pages (admin/recruiter side) if present elsewhere.

## Followup steps
- [ ] Implement backend endpoint + service first.
- [ ] Update candidate start/submit to use generated questions.
- [ ] Update frontend to handle generation/loading.
- [ ] Run backend + frontend tests/lint/build.

<ask_followup_question>
Confirm approval to proceed with this plan. After approval, I will implement the backend Groq generation endpoint + service first (lowest-risk).
</ask_followup_question>

