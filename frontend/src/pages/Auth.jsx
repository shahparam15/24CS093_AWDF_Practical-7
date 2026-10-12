import { useState } from "react";
import { loginUser, registerUser } from "../api";

function Auth({ onLoginSuccess, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const res = await loginUser(trimmedEmail, password);
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        // Handle Registration
        await registerUser(trimmedEmail, password);
        setSuccessMessage("Account created successfully! Logging you in...");

        // Auto login on successful registration
        const loginRes = await loginUser(trimmedEmail, password);
        if (onLoginSuccess) {
          onLoginSuccess(loginRes.user);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge" aria-hidden="true">🔐</div>
          <h2 className="auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access your protected tasks and profile"
              : "Register to manage your personal tasks securely with JWT authentication"}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={`auth-tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => handleTabSwitch(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={`auth-tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => handleTabSwitch(false)}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="auth-alert error-alert" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success-alert" role="status">
            <span className="alert-icon" aria-hidden="true">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. 24cs093@charusat.edu.in"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading
              ? isLogin
                ? "Signing in..."
                : "Creating Account..."
              : isLogin
              ? "Sign In"
              : "Register Account"}
          </button>
        </form>

        <div className="auth-footer-notes">
          <small>
            Security Note: Passwords are protected using <code>bcryptjs</code> with 10 salt rounds. Sessions are verified using cryptographically signed JSON Web Tokens (JWT).
          </small>
        </div>
      </div>
    </div>
  );
}

export default Auth;
