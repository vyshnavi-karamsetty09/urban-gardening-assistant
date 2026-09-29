import { useState } from "react";
import { authApi, setAuthToken } from "../api";
import "./Login.css";

function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.login({ email: email.trim(), password });
      setAuthToken(result.token);
      onLogin?.(result);
    } catch (requestError) {
      setError(requestError.message || "Incorrect email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await authApi.demoAccount();
      setAuthToken(result.token);
      onLogin?.(result);
    } catch (requestError) {
      setError(requestError.message || "Demo sign-in is currently unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-layout-grid">
        {/* ================= LEFT HERO PANEL ================= */}
        <section className="auth-hero-col">
          {/* Logo & Title */}
          <div className="auth-hero-brand">
            <div className="auth-sprout-logo">
              <svg viewBox="0 0 44 44" width="48" height="48" fill="none">
                <path
                  d="M14 34 C14 20, 24 10, 38 8 C38 22, 28 32, 16 34 Z"
                  fill="#7cb342"
                />
                <path
                  d="M16 34 C16 27, 9 23, 4 21 C4 29, 9 34, 16 34 Z"
                  fill="#558b2f"
                />
                <path
                  d="M15 34 Q15 41 14 43"
                  stroke="#33691e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="auth-hero-brand-text">
              <h1>Garden<br />Guide</h1>
            </div>
          </div>

          {/* Sprout Divider */}
          <div className="auth-sprout-divider">
            <span className="divider-line"></span>
            <span className="divider-sprout">🌱</span>
            <span className="divider-line"></span>
          </div>

          {/* Tagline */}
          <p className="auth-hero-tagline">
            Grow smarter.<br />Garden better.
          </p>

          {/* 3 Features */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-circle">🍃</div>
              <div className="auth-feature-text">
                <strong>Smart Plant Recommendations</strong>
                <span>Find the best plants for your environment.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-circle">💧</div>
              <div className="auth-feature-text">
                <strong>Care Reminders</strong>
                <span>Never miss watering or plant care again.</span>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-circle">🪴</div>
              <div className="auth-feature-text">
                <strong>Personalized Garden Planning</strong>
                <span>Design and manage your perfect garden.</span>
              </div>
            </div>
          </div>

          {/* Cursive Quote */}
          <div className="auth-hero-quote">
            "A greener tomorrow starts today." <span>🌿</span>
          </div>
        </section>

        {/* ================= RIGHT CARD PANEL ================= */}
        <section className="auth-card-col">
          <div className="auth-card">
            {/* Top Right Decorative Leaf Branch */}
            <svg
              className="auth-card-leaves"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M120 0 C95 15, 80 40, 75 70 C70 50, 78 30, 95 15 Z"
                fill="#81c784"
                opacity="0.6"
              />
              <path
                d="M120 15 C100 28, 88 50, 85 75 C82 58, 90 40, 105 25 Z"
                fill="#4caf50"
                opacity="0.75"
              />
              <path
                d="M110 0 C90 20, 70 45, 60 80 C55 60, 65 38, 85 18 Z"
                fill="#2e7d32"
                opacity="0.85"
              />
              <path
                d="M120 30 Q90 55 65 85"
                stroke="#2e7d32"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>

            {/* Header */}
            <div className="auth-card-header">
              <h2>Welcome Back</h2>
              <div className="auth-card-divider">
                <span className="card-divider-line"></span>
                <span className="card-divider-sprout">🌱</span>
                <span className="card-divider-line"></span>
              </div>
              <p>Login to access your personalized urban garden</p>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error-banner">{error}</div>}

              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">✉</span>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-field-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="login-password">Password</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="auth-field-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="auth-options-bar">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() =>
                    alert("Password recovery link sent if email exists!")
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-primary-btn btn-shimmer"
              >
                <span>🌱</span>
                <span>{isSubmitting ? "Signing in…" : "Login to Account"}</span>
              </button>

              {/* OR Divider */}
              <div className="auth-or-separator">
                <span className="separator-line"></span>
                <span>OR</span>
                <span className="separator-line"></span>
              </div>

              {/* Optional demo account */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
              >
                <span aria-hidden="true">🧪</span>
                <span>Use Demo Account</span>
              </button>

              {/* Bottom Link */}
              <div className="auth-switch-prompt">
                Don't have an account?
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => onNavigate("signup")}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;