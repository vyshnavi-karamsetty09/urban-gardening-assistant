import { useState } from "react";
import { authApi, setAuthToken } from "../api";
import "./Signup.css";

function Signup({ onNavigate, onLogin }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [gardenUpdates, setGardenUpdates] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        gardenUpdates,
      });
      setAuthToken(result.token);
      onLogin?.(result);
    } catch (requestError) {
      setError(requestError.message || "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignup = async () => {
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
    <div className="auth-page auth-signup-page">
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
            "A greener tomorrow starts today."
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
              <h2>Create Your Account</h2>
              <div className="auth-card-divider">
                <span className="card-divider-line"></span>
                <span className="card-divider-line"></span>
              </div>
              <p>Join Garden Guide and grow smarter gardens</p>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error-banner">{error}</div>}

              {/* Name Row */}
              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="auth-field-wrapper">
                    <span className="auth-field-icon">👤</span>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="auth-field-input"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="auth-field-wrapper">
                    <span className="auth-field-icon">👤</span>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="auth-field-input"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="signup-email">Email Address</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">✉</span>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    className="auth-field-input"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="auth-input-group">
                <label htmlFor="signup-phone">Phone Number</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">📞</span>
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    className="auth-field-input"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">🔒</span>
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="auth-field-input"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label htmlFor="signup-confirmPassword">Confirm Password</label>
                <div className="auth-field-wrapper">
                  <span className="auth-field-icon">🔒</span>
                  <input
                    id="signup-confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-field-input"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="auth-signup-checkboxes">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <span
                      className="terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Terms of Service & Privacy Policy: We keep your garden data private and safe.");
                      }}
                    >
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span
                      className="terms-link"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Privacy Policy: Your garden information is stored locally on your device.");
                      }}
                    >
                      Privacy Policy
                    </span>
                  </span>
                </label>

                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={gardenUpdates}
                    onChange={(e) => setGardenUpdates(e.target.checked)}
                  />
                  <span>Send me gardening tips and updates</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-primary-btn btn-shimmer"
              >
                <span>Create Account</span>
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
                onClick={handleDemoSignup}
                disabled={isSubmitting}
              >
                <span>Use Demo Account</span>
              </button>

              {/* Bottom Link */}
              <div className="auth-switch-prompt">
                Already have an account?
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => onNavigate("login")}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;