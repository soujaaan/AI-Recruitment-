import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoadingScreen from "./components/common/LoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";

const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const Jobs = lazy(() => import("./components/Jobs"));
const Browse = lazy(() => import("./components/Browse"));
const Profile = lazy(() => import("./components/Profile"));
const JobDescription = lazy(() => import("./components/JobDescription"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Companies = lazy(() => import("./components/admin/Companies"));
const CompanyCreate = lazy(() => import("./pages/admin/CreateCompany"));
const CompanySetup = lazy(() => import("./components/admin/CompanySetup"));
const AdminJobs = lazy(() => import("./components/admin/AdminJobs"));
const PostJob = lazy(() => import("./components/admin/PostJob"));
const Applicants = lazy(() => import("./components/admin/Applicants"));

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
    element: withSuspense(<Home />)
  },
  {
    path: '/signup',
    element: withSuspense(<Home />)
  },
  {
    path: "/jobs",
    element: withSuspense(<Jobs />)
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
    element: <ProtectedRoute allowedRoles={["candidate", "recruiter", "admin"]} />,
    children: [
      {
        path: "/profile",
        element: withSuspense(<Profile />)
      },
      {
        path: "/dashboard",
        element: withSuspense(<Dashboard />)
      }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["recruiter", "admin"]} />,
    children: [
      {
        path: "/admin/dashboard",
        element: withSuspense(<Dashboard />)
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
        path: "/admin/companies/:id",
        element: withSuspense(<CompanySetup />)
      },
      {
        path: "/admin/jobs",
        element: withSuspense(<AdminJobs />)
      },
      {
        path: "/admin/jobs/:id/applicants",
        element: withSuspense(<Applicants />)
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
function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Ambient Background Blobs — Neon Accent Tuned */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-[#00ff88]/5 via-emerald-500/5 to-transparent blur-[100px] rounded-full animate-blob"></div>
        <div className="absolute bottom-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-[#00ff88]/5 via-teal-500/5 to-transparent blur-[80px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-2/3 -right-10 w-64 h-64 bg-gradient-to-br from-emerald-400/5 via-[#00ff88]/5 to-transparent blur-[90px] rounded-full animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/[0.02] blur-[120px] rounded-full"></div>
      </div>

      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App

