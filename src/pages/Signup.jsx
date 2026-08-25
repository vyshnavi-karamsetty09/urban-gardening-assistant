import { useState } from "react";
import { STORAGE_KEYS } from "../utils";

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
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [gardenUpdates, setGardenUpdates] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
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
      setError("Please enter a valid phone number.");
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
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
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

    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(user)
    );

    alert(
      "Account created successfully! Please log in to continue."
    );

    onNavigate("login");
  };

  return (
    <div className="auth-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          padding: 22px;
          background: #071a0c;
          font-family: Arial, Helvetica, sans-serif;
        }

        .auth-container {
          width: 100%;
          max-width: 1140px;
          min-height: calc(100vh - 44px);
          margin: auto;
          display: grid;
          grid-template-columns: 43% 57%;
          overflow: hidden;
          border-radius: 0 24px 24px 0;
          background: #f5f4ed;
        }

        .auth-brand-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 54px 48px 38px;
          color: white;
          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(68, 125, 70, 0.15),
              transparent 35%
            ),
            #09220e;
        }

        .auth-brand {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .auth-brand-icon {
          font-size: 34px;
          line-height: 1;
          margin-top: 7px;
        }

        .auth-brand h1 {
          margin: 0;
          max-width: 250px;
          color: #ffffff;
          font-size: 31px;
          line-height: 1.05;
          font-weight: 700;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
        }

        .auth-divider-line {
          width: 40px;
          height: 2px;
          background: #6bbd63;
        }

        .auth-divider-icon {
          color: #6bbd63;
          font-size: 18px;
        }

        .auth-tagline {
          margin: 18px 0 0;
          color: #f0f5ee;
          font-size: 17px;
          line-height: 1.45;
        }

        .auth-benefits {
          margin-top: auto;
          margin-bottom: 72px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .auth-benefit {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .auth-benefit-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #edf3e9;
          color: #244d29;
          font-size: 21px;
        }

        .auth-benefit h3 {
          margin: 0 0 4px;
          color: white;
          font-size: 15px;
          font-weight: 600;
        }

        .auth-benefit p {
          margin: 0;
          color: #c8d4c7;
          font-size: 12px;
        }

        .auth-quote {
          position: absolute;
          left: 48px;
          bottom: 28px;
          color: #d8e5d6;
          font-family: Georgia, serif;
          font-size: 14px;
          font-style: italic;
        }

        .auth-form-panel {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px 38px;
          background: #f3f2eb;
        }

        .auth-form-panel::after {
          content: "";
          position: absolute;
          top: 15px;
          right: 22px;
          width: 54px;
          height: 54px;
          border-top: 2px solid #b7c7b2;
          border-right: 2px solid #b7c7b2;
          border-radius: 0 45px 0 0;
          opacity: 0.8;
        }

        .auth-form {
          width: 100%;
          max-width: 540px;
        }

        .auth-form-header {
          text-align: center;
          margin-bottom: 18px;
        }

        .auth-form-header h2 {
          margin: 0;
          color: #10271a;
          font-size: 29px;
          font-weight: 700;
        }

        .auth-form-decoration {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin: 8px 0;
        }

        .auth-form-decoration span {
          display: block;
          width: 35px;
          height: 1px;
          background: #b8c8b4;
        }

        .auth-form-decoration strong {
          width: 13px;
          height: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #628060;
          font-size: 8px;
        }

        .auth-form-header p {
          margin: 0;
          color: #78857b;
          font-size: 13px;
        }

        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .auth-field {
          margin-bottom: 10px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 5px;
          color: #162a1d;
          font-size: 12px;
          font-weight: 600;
        }

        .auth-input-wrapper {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #80927f;
          font-size: 15px;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          height: 38px;
          padding: 0 40px 0 37px;
          border: 1px solid #d7d8cd;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #203426;
          font-family: inherit;
          font-size: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auth-input::placeholder {
          color: #9aa59c;
        }

        .auth-input:focus {
          border-color: #4c884e;
          box-shadow: 0 0 0 3px rgba(76, 136, 78, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #748675;
          cursor: pointer;
          font-size: 15px;
          padding: 2px;
        }

        .auth-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 2px 0 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #435448;
          font-size: 11px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: #2d6b31;
          cursor: pointer;
        }

        .auth-error {
          margin: 0 0 10px;
          padding: 8px 10px;
          border: 1px solid #efc8bd;
          border-radius: 7px;
          background: #fff0ec;
          color: #a74730;
          font-size: 11px;
        }

        .auth-submit {
          width: 100%;
          height: 41px;
          border: none;
          border-radius: 8px;
          background: #2e6b2e;
          color: white;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(36, 91, 39, 0.18);
          transition: background 0.2s, transform 0.2s;
        }

        .auth-submit:hover {
          background: #255a28;
          transform: translateY(-1px);
        }

        .auth-bottom {
          margin-top: 10px;
          text-align: center;
          color: #7a857d;
          font-size: 11px;
        }

        .auth-link {
          border: none;
          padding: 0;
          background: transparent;
          color: #23652d;
          font-family: inherit;
          font-size: inherit;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 850px) {
          .auth-page {
            padding: 0;
          }

          .auth-container {
            min-height: 100vh;
            grid-template-columns: 1fr;
            border-radius: 0;
          }

          .auth-brand-panel {
            min-height: 300px;
            padding: 35px 28px;
          }

          .auth-benefits {
            display: none;
          }

          .auth-quote {
            display: none;
          }

          .auth-form-panel {
            min-height: 650px;
            padding: 35px 24px;
          }
        }

        @media (max-width: 550px) {
          .auth-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .auth-brand-panel {
            min-height: 230px;
          }

          .auth-brand h1 {
            font-size: 27px;
          }

          .auth-form-panel {
            padding: 30px 18px;
          }

          .auth-form-header h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="auth-container">

        <section className="auth-brand-panel">

          <div className="auth-brand">
            <div className="auth-brand-icon">🌱</div>

            <h1>
              Garden
              <br />
              Guide
            </h1>
          </div>

          <div className="auth-divider">
            <span className="auth-divider-line"></span>
            <span className="auth-divider-icon">🌱</span>
            <span className="auth-divider-line"></span>
          </div>

          <p className="auth-tagline">
            Grow smarter.
            <br />
            Garden better.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <div className="auth-benefit-icon">🌿</div>

              <div>
                <h3>Smart Plant Recommendations</h3>
                <p>Find the best plants for your environment.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <div className="auth-benefit-icon">💧</div>

              <div>
                <h3>Care Reminders</h3>
                <p>Never miss watering or plant care again.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <div className="auth-benefit-icon">🪴</div>

              <div>
                <h3>Personalized Garden Planning</h3>
                <p>Design and manage your perfect garden.</p>
              </div>
            </div>

          </div>

          <div className="auth-quote">
            "A greener tomorrow starts today." 🌿
          </div>

        </section>

        <section className="auth-form-panel">

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="auth-form-header">

              <h2>Create Your Account</h2>

              <div className="auth-form-decoration">
                <span></span>
                <strong>●</strong>
                <span></span>
              </div>

              <p>
                Join Garden Guide and grow smarter gardens
              </p>

            </div>

            <div className="auth-row">

              <div className="auth-field">

                <label htmlFor="firstName">
                  First Name
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ♙
                  </span>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="auth-input"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />

                </div>

              </div>

              <div className="auth-field">

                <label htmlFor="lastName">
                  Last Name
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ♙
                  </span>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="auth-input"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />

                </div>

              </div>

            </div>

            <div className="auth-field">

              <label htmlFor="signup-email">
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉
                </span>

                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>

            <div className="auth-field">

              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ☎
                </span>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="auth-input"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />

              </div>

            </div>

            <div className="auth-field">

              <label htmlFor="signup-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "◉"}
                </button>

              </div>

            </div>

            <div className="auth-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  className="auth-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "🙈" : "◉"}
                </button>

              </div>

            </div>

            <div className="auth-checkboxes">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) =>
                    setAgreeTerms(event.target.checked)
                  }
                />

                I agree to the Terms of Service and Privacy Policy

              </label>

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  checked={gardenUpdates}
                  onChange={(event) =>
                    setGardenUpdates(event.target.checked)
                  }
                />

                Send me gardening tips and updates

              </label>

            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
            >
              🌱 &nbsp; Create Account
            </button>

            <div className="auth-bottom">

              Already have an account?{" "}

              <button
                type="button"
                className="auth-link"
                onClick={() => onNavigate("login")}
              >
                Login
              </button>

            </div>

          </form>

        </section>

      </div>
    </div>
  );
}

export default Signup;