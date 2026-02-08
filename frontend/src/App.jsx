import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import "./styles/global.css";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuizList from "./pages/QuizList";
import QuizStart from "./pages/QuizStart";
import Result from "./pages/Result";
import MyResults from "./pages/MyResults";
import Leaderboard from "./pages/Leaderboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import ManageUsers from "./pages/ManageUsers";
import Profile from "./pages/Profile";
import ReviewQuiz from "./pages/ReviewQuiz";
import ManageQuiz from "./pages/ManageQuiz";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ManageAdmins from "./pages/ManageAdmins";
import ManageSirs from './pages/ManageSirs';
import MyQuizzes from './pages/MyQuizzes';
import QuizResults from './pages/QuizResults';
import ContactTeacher from './pages/ContactTeacher';
import CreateAdmin from './pages/CreateAdmin';
import ApproveQuizzes from './pages/ApproveQuizzes';
import RegisterSir from './pages/RegisterSir';
import UserQueries from './pages/UserQueries';
import AdminRequests from './pages/AdminRequests';
import BulkRegister from './pages/BulkRegister';
import ManageColleges from './pages/ManageColleges';
import ManageSubjects from './pages/ManageSubjects';
import DepartmentDetail from './pages/DepartmentDetail';
import ManageDepartmentHODs from './pages/ManageDepartmentHODs';
import ManageHODs from './pages/ManageHODs';
import HODDashboard from './pages/HODDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentNotifications from './pages/StudentNotifications';
import TeacherNotifications from './pages/TeacherNotifications';


import StudentDashboard from './pages/StudentDashboard';
import StudentMessages from './pages/StudentMessages';
import AuthPoller from "./components/AuthPoller";

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthPoller />
        <main>
          <Routes>

            {/* ---------- USER PORTAL (Public) ---------- */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ---------- STUDENT PORTAL (Protected) ---------- */}
            <Route element={<ProtectedRoute />}>
              <Route element={<StudentLayout />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/notifications" element={<StudentNotifications />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/quiz/:id" element={<QuizStart />} />
                <Route path="/result/:id" element={<Result />} />
                <Route path="/myresults" element={<MyResults />} />
                <Route path="/contact-teacher" element={<ContactTeacher />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/review/:id" element={<ReviewQuiz />} />
              </Route>
            </Route>

            {/* ---------- ADMIN PORTAL ---------- */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/department-dashboard" element={<DepartmentDashboard />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/admin/notifications" element={<TeacherNotifications />} />

                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/create-quiz" element={<CreateQuiz />} />
                <Route path="/admin/manage-quiz/:id" element={<ManageQuiz />} />
                <Route path="/admin/manage-sirs" element={<ManageSirs />} />
                <Route path="/admin/assign-subject" element={<ManageSirs />} /> {/* Reusing ManageSirs Component */}
                <Route path="/admin/quizzes" element={<MyQuizzes />} />
                <Route path="/admin/approve-quizzes" element={<ApproveQuizzes />} />
                <Route path="/admin/register-sir" element={<RegisterSir />} />
                <Route path="/admin/quiz-results/:id" element={<QuizResults />} />
                <Route path="/admin/manage-hods" element={<ManageDepartmentHODs />} />

                {/* Super Admin Routes - Using AdminLayout for now (shared) */}
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/manage-admins" element={<ManageAdmins />} />
                <Route path="/super-admin/manage-hods" element={<ManageHODs />} />
                <Route path="/super-admin/departments" element={<ManageColleges />} />
                <Route path="/admin/departments" element={<ManageSubjects />} />
                <Route path="/super-admin/department/:id" element={<DepartmentDetail />} />
                <Route path="/admin/queries" element={<UserQueries />} />
                <Route path="/super-admin/create-admin" element={<CreateAdmin />} />
                <Route path="/admin/admin-requests" element={<AdminRequests />} />
                <Route path="/admin/bulk-register" element={<BulkRegister />} />
                <Route path="/teacher/contact-student" element={<StudentMessages />} />
                <Route path="/admin/contact-student" element={<Navigate to="/teacher/contact-student" replace />} />
                <Route path="/admin/messages" element={<Navigate to="/teacher/contact-student" replace />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
