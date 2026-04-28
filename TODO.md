# MERN Project Cleanup Plan

## Analysis Summary

**Active Architecture:** `backend/index.js` is the entry point (per `package.json`).
**Legacy Architecture:** `backend/server.js` and old `*Controller.js` / `*Routes.js` files are duplicates.

---

## Phase 1: BACKEND Cleanup

### Step 1.1: Remove Legacy Entry Point
- **DELETE:** `backend/server.js` — legacy Express server, `index.js` is active

### Step 1.2: Remove Duplicate Controllers (CamelCase = legacy)
- **DELETE:** `backend/controllers/authController.js` — only imported by legacy `userRoutes.js`
- **DELETE:** `backend/controllers/userController.js` — only imported by legacy `userRoutes.js`
- **DELETE:** `backend/controllers/jobController.js` — only imported by legacy `jobRoutes.js`
- **DELETE:** `backend/controllers/applicationController.js` — only imported by legacy `applicationRoutes.js`

### Step 1.3: Remove Legacy Routes
- **DELETE:** `backend/routes/userRoutes.js` — not mounted in `index.js`
- **DELETE:** `backend/routes/jobRoutes.js` — not mounted in `index.js`
- **DELETE:** `backend/routes/applicationRoutes.js` — not mounted in `index.js`

### Step 1.4: Remove Old Models (NOT imported by active code)
- **DELETE:** `backend/models/User.js` — active code uses `user.model.js`
- **DELETE:** `backend/models/Job.js` — active code uses `job.model.js`
- **DELETE:** `backend/models/Application.js` — active code uses `application.model.js`

### Step 1.5: Remove Legacy Middleware Folder
- **DELETE:** `backend/middleware/auth.js` — active code uses `middlewares/auth.middleware.js`
- **DELETE:** `backend/middleware/errorHandler.js` — active code uses `middlewares/error.middleware.js`
- **DELETE:** `backend/middleware/` folder (will be empty after above deletions)

### Step 1.6: Remove Unused Utils
- **DELETE:** `backend/utils/connectDB.js` — active code uses `utils/db.js`
- **DELETE:** `backend/utils/generateToken.js` — only used by legacy `authController.js`
- **DELETE:** `backend/utils/sanitize.js` — not imported anywhere

### Step 1.7: Remove Unused Middleware Files
- **DELETE:** `backend/middlewares/rateLimiter.js` — `index.js` uses `express-rate-limit` directly
- **DELETE:** `backend/middlewares/security.middleware.js` — not imported anywhere

### Step 1.8: Remove Root Fix Scripts
- **DELETE:** `fix-admin-jobs.js`
- **DELETE:** `write_admin_jobs.py`
- **DELETE:** `fix_it.py`
- **DELETE:** `fix_it.js`
- **DELETE:** `fix_setup.js`
- **DELETE:** `fix_create.js`

---

## Phase 2: FRONTEND Cleanup

### Step 2.1: Remove Duplicate Hook
- **DELETE:** `frontend/src/hooks/useRegisterMutation.js` — duplicate function exists in `useAuthMutations.jsx` which is actually imported by Signup.jsx

### Step 2.2: Remove Unused Hooks
- **DELETE:** `frontend/src/hooks/useCurrentUser.jsx` — not imported anywhere
- **DELETE:** `frontend/src/hooks/useAIMutations.jsx` — not imported anywhere

### Step 2.3: Remove Unused AI Components
- **DELETE:** `frontend/src/components/ai/ResumeScoreCard.jsx` — not imported anywhere
- **DELETE:** `frontend/src/components/ai/JobMatchCard.jsx` — not imported anywhere
- **DELETE:** `frontend/src/components/ai/AIInterviewPanel.jsx` — not imported anywhere
- **DELETE:** `frontend/src/components/ai/AIFeedbackBox.jsx` — not imported anywhere
- **DELETE:** `frontend/src/components/ai/` folder (will be empty)

### Step 2.4: Remove Unused Services
- **DELETE:** `frontend/src/services/ai.service.js` — not imported anywhere

### Step 2.5: Remove Unused Redux Slice
- **DELETE:** `frontend/src/redux/aiSlice.js` — no components/hooks dispatch actions from it
- **UPDATE:** `frontend/src/redux/store.js` — remove `ai: aiSlice` from combineReducers

### Step 2.6: Remove Unused Admin Helper
- **DELETE:** `frontend/src/components/admin/ProtectedRoute.jsx` — just re-exports `common/ProtectedRoute`, not imported anywhere

### Step 2.7: Remove Unused Assets & CSS
- **DELETE:** `frontend/src/App.css` — not imported anywhere
- **DELETE:** `frontend/src/assets/expenselogo.png` — not referenced anywhere
- **DELETE:** `frontend/src/assets/react.svg` — not referenced anywhere

### Step 2.8: Remove Unused Utils/Schemas (verify first)
- **DELETE:** `frontend/src/utils/constant.js` — not imported anywhere
- **VERIFY & DELETE:** `frontend/src/schemas/application.schema.js` — likely unused
- **VERIFY & DELETE:** `frontend/src/schemas/job.schema.js` — likely unused
- **VERIFY & DELETE:** `frontend/src/lib/debounce.js` — check if useDebounce is imported

---

## Phase 3: Clean Unused Imports in Kept Files
- Remove dead imports across all kept frontend/backend files
- Remove `console.log` debug statements (except critical ones)

---

## Phase 4: Validation (MANDATORY)
1. Backend starts without errors: `cd backend && node index.js`
2. Frontend builds without errors: `cd frontend && npm run build`
3. Smoke tests: Login, Company creation, Recruiter dashboard

---

## Files to KEEP (Reference)

### Backend:
- `index.js`, `package.json`, `.gitignore`
- `config/env.js`, `config/cors.js`, `config/security.js`
- `controllers/company.controller.js`, `job.controller.js`, `application.controller.js`, `user.controller.js`
- `routes/company.route.js`, `job.route.js`, `application.route.js`, `user.route.js`
- `models/company.model.js`, `job.model.js`, `application.model.js`, `user.model.js`
- `middlewares/auth.middleware.js`, `authorizeRoles.js`, `error.middleware.js`, `validation.middleware.js`, `mutler.js`, `upload.middleware.js`, `isAuthenticated.js`
- `utils/db.js`, `apiError.js`, `asyncHandler.js`, `cloudinary.js`, `datauri.js`, `logger.js`, `pagination.js`, `requestLogger.js`, `response.js`, `role.utils.js`
- `services/ai.service.js` (keep as it's backend logic, may be used by controllers)

### Frontend:
- All components imported in App.jsx and their dependencies
- `components/ui/*` (all UI primitives used across app)
- `hooks/useAuthMutations.jsx`, `useJobMutations.jsx`, `useGetAllJobs.jsx`, `useGetAllAdminJobs.jsx`, `useGetAppliedJobs.jsx`, `useGetApplicants.jsx`, `useGetCompanyById.jsx`, `useGetJobById.jsx`, `useGetAllCompanies.jsx`
- `redux/store.js`, `authSlice.js`, `jobSlice.js`, `companySlice.js`, `applicationSlice.js`
- `services/auth.service.js`, `company.service.js`, `job.service.js`, `application.service.js`
- `lib/api.js`, `queryClient.js`, `utils.js`, `normalize.js`
- `schemas/auth.schema.js`

