import React, { useEffect, useState } from "react";
import Home from "./home/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Tests from "./Tests/Tests";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import OtpSignup from "./components/OtpSignup";
import QuizInfo from "./components/QuizInfo";
import Question from "./components/Question";
import ScoreCard from "./components/ScoreCard";
import UserProfile from "./components/ProfilePage";
import UpdateProfile from "./components/UpdateProfile";
import AdminDashboard from "./components/admin/AdminDashbooard";
import AdminUserDetail from "./components/admin/AdminUserDetail";
import AdminUsers from "./components/admin/AdminUsers";
import AdminSchools from "./components/admin/AdminSchools";
import AdminClasses from "./components/admin/AdminClasses";
import AdminTests from "./components/admin/AdminTests";
import AdminEditTest from "./components/admin/AdminEditTest";
import AdminCreateTest from "./components/admin/AdminCreateTest";
import AdminAuthProvider, { useAdminAuth } from "./context/AdminAuthProvider";
import NotFound from "./components/NotFound";
import Feedback from "./components/Feedback";
import Feedbacks from "./components/admin/Feedbacks";

function App() {
  const [authUser] = useAuth();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );

  const element = document.documentElement;
  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      <div className="min-h-screen dark:bg-slate-900 dark:text-white bg-white text-black">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/tests"
            element={authUser ? <Tests /> : <Navigate to="/signup" />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp-signup" element={<OtpSignup />} />
          <Route path="/test" element={authUser ? <QuizInfo /> : <Navigate to="/signup" />} />
          <Route path="/question" element={authUser ? <Question /> : <Navigate to="/signup" />} />
          <Route path="/feedback" element={authUser ? <Feedback /> : <Navigate to="/signup" />} />
          <Route path="/results" 
          element={authUser ? <ScoreCard /> : <Navigate to="/signup" />}
          /> 
          <Route
            path="/profile"
            element={authUser ? <UserProfile /> : <Navigate to="/signup" />}
          />
          <Route
            path="/update-profile"
            element={authUser ? <UpdateProfile /> : <Navigate to="/signup" />}
          />
          <Route
            path="/admin/*"
            element={
              <AdminAuthProvider>
                <Routes>
                  <Route path="" element={<AdminDashboard />} />
                  <Route path="schools" element={<AdminSchools />} />
                  <Route path="classes" element={<AdminClasses />} />
                  <Route path="user/:userId" element={<AdminUserDetail />} />
                  <Route path="tests" element={<AdminTests />} />
                  <Route path="test/:testId" element={<AdminEditTest />} />
                  <Route path="create-test" element={<AdminCreateTest />} />
                  <Route path="feedbacks" element={<Feedbacks />} /> 
                  <Route path="*" element={<NotFound />} /> 
                </Routes>
              </AdminAuthProvider>
            }
          />
          <Route path="*" element={<NotFound />} /> 
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
