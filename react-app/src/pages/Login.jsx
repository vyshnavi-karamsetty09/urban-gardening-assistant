import { useState } from "react";

function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const savedUser = localStorage.getItem("urbanGardenUser");

    if (!savedUser) {
      setError("No account found. Please create an account first.");
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      setError("Unable to read account information. Please sign up again.");
      return;
    }

    if (
      email.trim().toLowerCase() !== user.email.toLowerCase() ||
      password !== user.password
    ) {
      setError("Incorrect email or password.");
      return;
    }

    const session = {
      isLoggedIn: true,
      email: user.email,
      name: user.firstName || "Gardener",
    };

    localStorage.setItem(
      "urbanGardenSession",
      JSON.stringify(session)
    );

    if (rememberMe) {
      localStorage.setItem("urbanGardenRemember", "true");
    }

    if (onLogin) {
      onLogin(session);
    }

    onNavigate("dashboard");
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
          padding: 46px 40px;
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
          max-width: 535px;
        }

        .auth-form-header {
          text-align: center;
          margin-bottom: 24px;
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
          margin: 10px 0;
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

        .auth-field {
          margin-bottom: 13px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 6px;
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
          font-size: 16px;
          pointer-events: none;
        }

        .auth-input {
          width: 100%;
          height: 41px;
          padding: 0 42px 0 38px;
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
          font-size: 16px;
          padding: 2px;
        }

        .auth-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 3px 0 12px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #435448;
          font-size: 11px;
          cursor: pointer;
        }

        .remember-label input {
          width: 16px;
          height: 16px;
          accent-color: #2d6b31;
          cursor: pointer;
        }

        .forgot-button {
          border: none;
          background: transparent;
          color: #2f6c35;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-error {
          margin: 0 0 12px;
          padding: 9px 11px;
          border: 1px solid #efc8bd;
          border-radius: 7px;
          background: #fff0ec;
          color: #a74730;
          font-size: 11px;
        }

        .auth-submit {
          width: 100%;
          height: 43px;
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
          margin-top: 12px;
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
            min-height: 600px;
            padding: 35px 24px;
          }
        }

        @media (max-width: 500px) {
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
              Urban
              <br />
              Gardening
              <br />
              Assistant
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

              <h2>Welcome Back</h2>

              <div className="auth-form-decoration">
                <span></span>
                <strong>●</strong>
                <span></span>
              </div>

              <p>
                Login to access your personalized urban garden
              </p>

            </div>

            <div className="auth-field">

              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />

              </div>

            </div>

            <div className="auth-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span className="auth-input-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label="Show or hide password"
                >
                  {showPassword ? "🙈" : "◉"}
                </button>

              </div>

            </div>

            <div className="auth-options">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                Remember me

              </label>

              <button
                type="button"
                className="forgot-button"
                onClick={() =>
                  alert(
                    "Password recovery will be connected when the backend is added."
                  )
                }
              >
                Forgot password?
              </button>

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
              ↪ &nbsp; Login to Account
            </button>

            <div className="auth-bottom">

              Don't have an account?{" "}

              <button
                type="button"
                className="auth-link"
                onClick={() => onNavigate("signup")}
              >
                Create Account
              </button>

            </div>

          </form>

        </section>

      </div>
    </div>
  );
}

export default Login;