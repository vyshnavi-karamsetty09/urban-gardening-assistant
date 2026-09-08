import { useState } from "react";
import { STORAGE_KEYS } from "../utils";
import "./Signup.css";

function Signup({ onNavigate }) {
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

  const handleSubmit = (event) => {
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

    const user = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      gardenUpdates,
    };

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    alert("Account created successfully! Please log in to continue.");
    onNavigate("login");
  };

  const handleGoogleSignup = () => {
    const user = {
      firstName: "Alex",
      lastName: "Gardener",
      email: "gardener.google@gmail.com",
      phone: "9876543210",
      password: "password123",
      gardenUpdates: true,
    };
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    alert("Google sign up successful! Please log in with Google to continue.");
    onNavigate("login");
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
              <h2>Create Your Account</h2>
              <div className="auth-card-divider">
                <span className="card-divider-line"></span>
                <span className="card-divider-sprout">🌱</span>
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
                <span>🌱</span>
                <span>Create Account</span>
              </button>

              {/* OR Divider */}
              <div className="auth-or-separator">
                <span className="separator-line"></span>
                <span>OR</span>
                <span className="separator-line"></span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogleSignup}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
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