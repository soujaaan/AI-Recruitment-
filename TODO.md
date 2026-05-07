# TODO - Final ATS Decontamination (deterministic-only)

- [ ] Step 1: Audit search confirm remaining ATS contamination points (ai.service.js, user.controller.js, etc.)
- [ ] Step 2: Clean `backend/services/ai.service.js` to remove Groq/OpenAI resume parsing + ATS scoring + mock ATS
- [ ] Step 3: Update `backend/controllers/user.controller.js` to remove resume upload/profile update ATS scoring; persist resume only
- [ ] Step 4: Ensure ATS score inference happens only in Flask (`backend/ai/app.py` /analyze) via existing deterministic controller flow
- [ ] Step 5: Re-run repo-wide search to verify zero remaining ATS generators/prompts
- [ ] Step 6: Final validation: only one ATS origin path and no mock score remnants

