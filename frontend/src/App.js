import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Landing & Selection
import Home from "./pages/Home";
import LoginSelect from "./pages/LoginSelect";
import SignupSelect from "./pages/SignupSelect";

// Login Pages
import StudentLogin from "./pages/StudentLogin";
import EmployerLogin from "./pages/EmployerLogin";
import AdminLogin from "./pages/AdminLogin";

// Signup Pages
import SignupStudent from "./pages/SignupStudent";
import SignupEmployer from "./pages/SignupEmployer";
import SignupAdmin from "./pages/SignupAdmin";

// Dashboards & Chat
import StudentDashboard from "./pages/StudentDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";

// Route Guard component for authentication
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-light dark:bg-brand-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard if they are logged in but tried to view other dashboards
    if (user.role === "student") return <Navigate to="/student-dashboard" replace />;
    if (user.role === "employer") return <Navigate to="/employer-dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === "student") return <Navigate to="/student-dashboard" replace />;
    if (user.role === "employer") return <Navigate to="/employer-dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<Home />} />

          {/* Authentication Selectors */}
          <Route path="/login" element={<PublicRoute><LoginSelect /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupSelect /></PublicRoute>} />

          {/* Role Logins */}
          <Route path="/student-login" element={<PublicRoute><StudentLogin /></PublicRoute>} />
          <Route path="/employer-login" element={<PublicRoute><EmployerLogin /></PublicRoute>} />
          <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

          {/* Role Signups */}
          <Route path="/signup-student" element={<PublicRoute><SignupStudent /></PublicRoute>} />
          <Route path="/signup-employer" element={<PublicRoute><SignupEmployer /></PublicRoute>} />
          <Route path="/signup-admin" element={<PublicRoute><SignupAdmin /></PublicRoute>} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/student-dashboard"
            element={
              <PrivateRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employer-dashboard"
            element={
              <PrivateRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Chat - Accessible to verified Students and Employers */}
          <Route
            path="/chat"
            element={
              <PrivateRoute allowedRoles={["student", "employer"]}>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;