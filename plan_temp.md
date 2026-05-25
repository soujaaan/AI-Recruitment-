Plan: implement assessment-free AI interview question flow.

Backend
1) Remove assessment engine mount: already done.
2) Delete assessment routes/controllers/models: assessment.route.js, assessment.controller.js, assessment.controller2.js, assessmentGeneration.controller.js, assessment.model.js, candidateAssessment.model.js, assessmentAttempt.model.js, questionBank related files if only used for exam.
3) Remove DB references: application.model.js fields assessmentAttempt/assessmentScore; job.model assessmentEnabled/assessmentDuration/assessmentQuestionCount if only assessment. If those fields are used elsewhere, keep but no routes rely.
4) Add new endpoint in ai module: POST /api/ai/interview-questions/generate.
   - payload: { jobId, interviewTypes?: { technical?:boolean, hr?:boolean, project?:boolean, experience?:boolean } }
   - response: { success:true, questions:[{ type, category, prompt }] }
   - no persistence required (can return). Optional log model later.

Frontend
5) Remove candidate exam page: delete pages/candidate/Assessment.jsx; remove lazy import and route /assessment/:jobId from App.jsx.
6) Remove apply->assessment navigation: update components/JobDescription.jsx to redirect to /applications after apply.
7) Replace recruiter Assess button UI in pages/recruiter/CandidateProfile.jsx:
   - Remove legacy button that says Assess.
   - Add button "Generate Interview Questions".
   - On click: call POST /api/ai/interview-questions/generate with candidate's relevant jobId.
   - Display questions list in the page.
8) Remove admin Questions page if it depends on assessment routes: update or deprecate components/pages using /api/v1/assessment/*.

Verification
9) Repo-wide searches for /api/v1/assessment and Assessment page.
10) Run backend start and frontend build.

