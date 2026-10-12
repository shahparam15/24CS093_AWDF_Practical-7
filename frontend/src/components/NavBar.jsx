import { NavLink } from "react-router-dom";

function NavBar({ isDarkMode = false, onToggleTheme, currentUser, onLogout }) {
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/tasks", label: "Task Manager" },
    { to: "/projects", label: "Projects (API)" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="portfolio-navbar" aria-label="Main Navigation">
      <div className="navbar-container">
        <ul className="navbar-menu">
          {navLinks.map((link) => (
            <li key={link.to} className="navbar-item">
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          {/* User Authentication Status */}
          {currentUser ? (
            <div className="navbar-user-section">
              <span className="navbar-user-email" title={`Logged in as ${currentUser.email}`}>
                <span className="user-icon" aria-hidden="true">👤</span>
                {currentUser.email}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="navbar-logout-btn"
                title="Log out of your account"
              >
                Log Out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar-auth-link ${isActive ? "active" : ""}`
              }
            >
              Sign In
            </NavLink>
          )}

          {/* Theme Switcher */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="theme-toggle-btn"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="theme-icon" aria-hidden="true">
                {isDarkMode ? "☀️" : "🌙"}
              </span>
              <span className="theme-label">
                {isDarkMode ? "Light" : "Dark"}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
