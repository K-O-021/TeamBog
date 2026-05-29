import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider } from "@/context/AppContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/AdminLayout";

// PAGES
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/Login.tsx";
import SignupPage from "./pages/SignupPage.tsx";

// TEACHER
import TeacherDashboard from "./pages/TeacherHome";
import TeacherIEPRequests from "./pages/TeacherIEPRequests";

// PARENT
import ParentDashboard from "./pages/ParentDashboard";
import ParentProgress from "./pages/ParentProgress";
import ParentReports from "./pages/ParentReports";
import ParentAlerts from "./pages/ParentAlerts";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminPeopleManagement from "./pages/AdminPeopleManagement";
import AdminStudents from "./pages/AdminStudents";
import AdminLogs from "./pages/AdminLogs";
import AdminProfile from "./pages/AdminProfile";
import AdminAnalytics from "./pages/AdminAnalytics";

// SHARED
import ArchivedRecords from "./pages/ArchivedRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>

              {/* HOME */}
              <Route path="/" element={<Index />} />

              {/* LOGIN */}
              <Route path="/login" element={<LoginPage />} />

              {/* SIGNUP VERIFICATION (The "Choices" Page) */}
              <Route path="/signup-verify" element={<SignupPage />} />

              {/* REDIRECT */}
              <Route
                path="/app.html"
                element={<Navigate to="/" replace />}
              />

              {/* ================================================= */}
              {/* TEACHER PORTAL */}
              {/* ================================================= */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["teacher", "admin"]}
                    requiredPlatform="web"
                  />
                }
              >
                <Route element={<AppLayout />}>
                  <Route
                    path="/teacher"
                    element={<TeacherDashboard />}
                  />

                  <Route
                    path="/teacher/iep-requests"
                    element={<TeacherIEPRequests />}
                  />

                  <Route
                    path="/teacher/archived"
                    element={<ArchivedRecords />}
                  />
                </Route>
              </Route>

              {/* ================================================= */}
              {/* PARENT PORTAL */}
              {/* ================================================= */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["parent", "admin"]}
                  />
                }
              >
                <Route element={<AppLayout />}>
                  <Route
                    element={
                      <ProtectedRoute
                        allowedRoles={["parent", "admin"]}
                        requiredPlatform="app"
                      />
                    }
                  >
                    <Route
                      path="/parent"
                      element={<ParentDashboard />}
                    />

                    <Route
                      path="/parent/progress"
                      element={<ParentProgress />}
                    />

                    <Route
                      path="/parent/reports"
                      element={<ParentReports />}
                    />

                    <Route
                      path="/parent/alerts"
                      element={<ParentAlerts />}
                    />
                  </Route>
                </Route>
              </Route>

              {/* ================================================= */}
              {/* ADMIN PORTAL */}
              {/* ================================================= */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/admin/dashboard"
                      replace
                    />
                  }
                />

                <Route
                  path="dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="analytics"
                  element={<AdminAnalytics />}
                />

                <Route
                  path="students"
                  element={<AdminStudents />}
                />

                <Route
                  path="people"
                  element={<AdminPeopleManagement />}
                />

                <Route
                  path="logs"
                  element={<AdminLogs />}
                />

                <Route
                  path="archived"
                  element={<ArchivedRecords />}
                />

                <Route
                  path="profile"
                  element={<AdminProfile />}
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;