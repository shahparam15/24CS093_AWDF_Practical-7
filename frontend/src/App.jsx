import { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TaskManager from "./pages/TaskManager";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Toast from "./components/Toast";
import { getUser, getToken, getMe, logoutUser } from "./api";
import "./App.css";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => (getToken() ? getUser() : null));
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Verify stored session on app mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((user) => {
          if (user) setCurrentUser(user);
        })
        .catch(() => {
          // Token invalid or expired
          setCurrentUser(null);
        });
    }
  }, []);

  // Listen for global auth events (session expiration or logout)
  useEffect(() => {
    const handleAuthExpired = (event) => {
      setCurrentUser(null);
      const msg = event?.detail?.message || "Session expired. Please log in again.";
      showToast("error", msg);
      navigate("/login");
    };

    const handleAuthLogout = () => {
      setCurrentUser(null);
      showToast("info", "You have been logged out successfully.");
      navigate("/");
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    window.addEventListener("auth-logout", handleAuthLogout);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
      window.removeEventListener("auth-logout", handleAuthLogout);
    };
  }, [navigate, showToast]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast("success", `Welcome back, ${user.email}!`);
    navigate("/tasks");
  };

  const handleLogout = () => {
    logoutUser();
  };

  const studentName = "Param Shah";
  const studentEmail = "24cs093@charusat.edu.in";
  const studentBio =
    "Enthusiastic Computer Science Engineering student passionate about full-stack engineering, JWT authentication, Express middleware pipelines, and MongoDB integration.";

  const studentDetails = {
    rollNo: "24CS093",
    department: "Computer Science & Engineering",
    institution: "CSPIT, Charusat University",
  };

  const skillList = [
    "Authentication (JWT, bcryptjs)",
    "Middleware Pipeline & Route Protection",
    "MongoDB & Mongoose ODM",
    "React.js (Routing, Context, State)",
    "RESTful API Design & Full-Stack Integration",
    "Vite & Modern Tooling",
  ];

  return (
    <div className={`portfolio-app ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Header
        name={studentName}
        themeColor={isDarkMode ? "#0f172a" : "#1e3a5f"}
        subtitle="Advanced Web Development Frameworks (ITUE301) — Practical 7"
      />

      <NavBar
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="portfolio-main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                studentName={studentName}
                studentBio={studentBio}
                studentDetails={studentDetails}
                skillList={skillList}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TaskManager
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route
            path="/login"
            element={
              currentUser ? (
                <TaskManager
                  currentUser={currentUser}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : (
                <div className="page-container">
                  <Auth onLoginSuccess={handleLoginSuccess} />
                </div>
              )
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact studentEmail={studentEmail} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer email={studentEmail} name={studentName} />
    </div>
  );
}

export default App;
