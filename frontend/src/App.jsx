import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoadingScreen from "./components/common/LoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GlobalChatListener from "./components/shared/GlobalChatListener";
import useCurrentUser from "./hooks/useCurrentUser";

const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const VerifyOTP = lazy(() => import("./components/auth/VerifyOTP"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Jobs = lazy(() => import("./components/Jobs"));
const Browse = lazy(() => import("./components/Browse"));
const Profile = lazy(() => import("./components/Profile"));
const BuildResume = lazy(() => import("./pages/BuildResume"));
const ResumeAnalysis = lazy(() => import("./pages/ResumeAnalysis"));
const JobDescription = lazy(() => import("./components/JobDescription"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Applications = lazy(() => import("./pages/candidate/ApplicationsPage"));
const Messages = lazy(() => import("./pages/messages/MessagesPage"));
const AdminJobs = lazy(() => import("./components/admin/AdminJobs"));
const PostJob = lazy(() => import("./components/admin/PostJob"));
const Applicants = lazy(() => import("./components/admin/Applicants"));
const JobApplicants = lazy(() => import("./pages/admin/JobApplicants"));
const Companies = lazy(() => import("./components/admin/Companies"));
const CompanyCreate = lazy(() => import("./components/admin/CompanyCreate"));
const SystemAdminDashboard = lazy(() => import("./components/system-admin/SystemAdminDashboard"));
const CandidateProfile = lazy(() => import("./pages/recruiter/CandidateProfile"));
const AdminApplicants = lazy(() => import("./pages/admin/AdminApplicants"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

const withSuspense = (element) => (
  <Suspense fallback={<LoadingScreen label="Loading page..." />}>{element}</Suspense>
);

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<Home />)
  },
  {
    path: '/login',
    element: withSuspense(<Login />)
  },
  {
    path: '/signup',
    element: withSuspense(<Signup />)
  },
  {
    path: '/verify-otp',
    element: withSuspense(<VerifyOTP />)
  },
  {
    path: '/forgot-password',
    element: withSuspense(<ForgotPassword />)
  },
  {
    path: '/verify-reset-otp',
    element: withSuspense(<VerifyOtp />)
  },
  {
    path: '/reset-password',
    element: withSuspense(<ResetPassword />)
  },
  {
    path: "/jobs",
    element: withSuspense(<Jobs />)
  },
  {
    path: "/jobs/:id",
    element: withSuspense(<JobDescription />)
  },
  {
    path: "/description/:id",
    element: withSuspense(<JobDescription />)
  },
  {
    path: "/browse",
    element: withSuspense(<Browse />)
  },
  {
    path: "/resume-analysis",
    element: withSuspense(<ResumeAnalysis />)
  },
  {
    element: <ProtectedRoute allowedRoles={["candidate", "recruiter", "admin"]} />,
    children: [
      {
        path: "/profile",
        element: withSuspense(<Profile />)
      },
      {
        path: "/profile/build-resume",
        element: withSuspense(<BuildResume />)
      },
      {
        path: "/notifications",
        element: withSuspense(<NotificationsPage />)
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["candidate"]} />,
    children: [
      {
        path: "/applications",
        element: withSuspense(<Applications />)
      }
    ]
  },
      {
    element: <ProtectedRoute allowedRoles={["recruiter", "admin", "candidate"]} />,
    children: [
      {
        path: "/messages",
        element: withSuspense(<Messages />)
      },
      {
        path: "/dashboard",
        element: withSuspense(<Dashboard />)
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["candidate"]} />,
    children: [
      {
        path: "/dashboard/candidate",
        element: withSuspense(<Dashboard />)
      }
    ]
  },
{
        element: <ProtectedRoute allowedRoles={["recruiter", "admin"]} />,
        children: [
      {
        path: "/dashboard/recruiter",
        element: withSuspense(<Dashboard />)
      },
      {
        path: "/admin/dashboard",
        element: withSuspense(<Dashboard />)
      },
      {
        path: "/admin/jobs",
        element: withSuspense(<AdminJobs />)
      },
      {
        path: "/admin/jobs/:id/applicants",
        element: withSuspense(<JobApplicants />)
      },
      {
        path: "/admin/applicants",
        element: withSuspense(<AdminApplicants />)
      },
      {
        path: "/admin/companies",
        element: withSuspense(<Companies />)
      },
      {
        path: "/admin/companies/create",
        element: withSuspense(<CompanyCreate />)
      },
      {
        path: "/candidate/:candidateId",
        element: withSuspense(<CandidateProfile />)
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["recruiter"]} />,
    children: [
      {
        path: "/admin/jobs/create",
        element: withSuspense(<PostJob />)
      }
    ]
  },
  {
    path: "*",
    element: withSuspense(<Home />)
  }

])
function AuthBootstrap() {
  useCurrentUser();
  return null;
}

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      <AuthBootstrap />
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Ambient Background Blobs — Neon Accent Tuned */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-[#00ff88]/5 via-emerald-500/5 to-transparent blur-[100px] rounded-full animate-blob"></div>
        <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-[#00ff88]/5 via-teal-500/5 to-transparent blur-[80px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-2/3 -right-10 w-64 h-64 bg-gradient-to-br from-emerald-400/5 via-[#00ff88]/5 to-transparent blur-[90px] rounded-full animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/[0.02] blur-[120px] rounded-full"></div>
      </div>

      <GlobalChatListener />
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App

