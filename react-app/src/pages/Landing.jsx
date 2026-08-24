import "./Landing.css";

function Landing({ onNavigate }) {
  /* =========================================
     NAVIGATION
     ========================================= */

  const goToLogin = () => {
    if (onNavigate) {
      onNavigate("login");
    }
  };

  const goToSignup = () => {
    if (onNavigate) {
      onNavigate("signup");
    }
  };

  /* =========================================
     SCROLL TO SECTION
     ========================================= */

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================
     FEATURE BUTTON
     ========================================= */

  const handleFeatureClick = () => {
    goToSignup();
  };

  return (
    <div className="landing-page">

      {/* =========================================
          NAVBAR
          ========================================= */}

      <header className="landing-navbar">

        {/* LOGO */}

        <button
          type="button"
          className="landing-logo"
          onClick={() => scrollToSection("home")}
        >
          <span className="landing-logo-icon">
            🌱
          </span>

          <span className="landing-logo-text">
            <strong>Urban Gardening</strong>
            <span>Assistant</span>
          </span>
        </button>


        {/* NAVIGATION */}

        <nav className="landing-nav">

          <button
            type="button"
            className="landing-nav-link active"
            onClick={() => scrollToSection("home")}
          >
            Home
          </button>

          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>

          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("how-it-works")}
          >
            How It Works
          </button>

          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("about")}
          >
            About
          </button>

          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("contact")}
          >
            Contact
          </button>

        </nav>


        {/* LOGIN / SIGNUP */}

        <div className="landing-nav-buttons">

          <button
            type="button"
            className="landing-btn landing-btn-outline"
            onClick={goToLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="landing-btn landing-btn-primary"
            onClick={goToSignup}
          >
            Get Started
          </button>

        </div>

      </header>


      {/* =========================================
          MAIN
          ========================================= */}

      <main>

        {/* =========================================
            HERO
            ========================================= */}

        <section
          className="landing-hero"
          id="home"
        >

          <div className="hero-content">

            <span className="hero-small-title">
              🌿 SMARTER URBAN GARDENING
            </span>

            <h1>
              Grow Smarter.
              <br />
              <span>Garden Better.</span>
            </h1>

            <p>
              Your smart companion for healthy plants,
              beautiful gardens, and a greener tomorrow.
            </p>


            <div className="hero-buttons">

              <button
                type="button"
                className="landing-btn landing-btn-primary hero-btn"
                onClick={goToSignup}
              >
                Get Started →
              </button>

              <button
                type="button"
                className="landing-btn landing-btn-outline hero-btn"
                onClick={() => scrollToSection("features")}
              >
                Explore Features
              </button>

            </div>


            <div className="hero-note">
              🌱 Personalized gardening made simple for everyone.
            </div>

          </div>


          {/* HERO VISUAL */}

          <div className="hero-visual">

            <div className="hero-circle hero-circle-one"></div>

            <div className="hero-circle hero-circle-two"></div>


            <div className="hero-plant-main">
              🪴
            </div>


            <div className="hero-floating-card hero-card-one">

              <span>
                💧
              </span>

              <div>
                <strong>
                  Plant Care
                </strong>

                <small>
                  Water today
                </small>
              </div>

            </div>


            <div className="hero-floating-card hero-card-two">

              <span>
                ☀️
              </span>

              <div>
                <strong>
                  Sunlight
                </strong>

                <small>
                  6–8 hours
                </small>
              </div>

            </div>


            <div className="hero-leaf leaf-one">
              🌿
            </div>

            <div className="hero-leaf leaf-two">
              🌱
            </div>

          </div>

        </section>


        {/* =========================================
            FEATURES
            ========================================= */}

        <section
          className="landing-section features-section"
          id="features"
        >

          <div className="landing-section-heading">

            <span>
              OUR FEATURES
            </span>

            <h2>
              Everything You Need to
              <span> Grow</span>
            </h2>

            <p>
              Simple tools to help you plan, grow and maintain
              your urban garden.
            </p>

          </div>


          <div className="features-grid">

            {/* FEATURE 1 */}

            <article className="feature-card">

              <div className="feature-icon">
                🌱
              </div>

              <h3>
                Smart Plant Recommendation
              </h3>

              <p>
                Get plant suggestions based on your
                environment, space and preferences.
              </p>

              <button
                type="button"
                onClick={handleFeatureClick}
              >
                Explore →
              </button>

            </article>


            {/* FEATURE 2 */}

            <article className="feature-card">

              <div className="feature-icon">
                📅
              </div>

              <h3>
                Garden Planner
              </h3>

              <p>
                Plan your garden and organize your plants
                according to your available space.
              </p>

              <button
                type="button"
                onClick={handleFeatureClick}
              >
                Explore →
              </button>

            </article>


            {/* FEATURE 3 */}

            <article className="feature-card">

              <div className="feature-icon">
                🔍
              </div>

              <h3>
                Disease Detection
              </h3>

              <p>
                Detect common plant diseases and learn
                what steps you can take to care for them.
              </p>

              <button
                type="button"
                onClick={handleFeatureClick}
              >
                Explore →
              </button>

            </article>


            {/* FEATURE 4 */}

            <article className="feature-card">

              <div className="feature-icon">
                🔔
              </div>

              <h3>
                Care Scheduler
              </h3>

              <p>
                Keep track of watering, fertilizing and
                other important plant-care tasks.
              </p>

              <button
                type="button"
                onClick={handleFeatureClick}
              >
                Explore →
              </button>

            </article>


            {/* FEATURE 5 */}

            <article className="feature-card">

              <div className="feature-icon">
                🤖
              </div>

              <h3>
                AI Gardening Assistant
              </h3>

              <p>
                Ask gardening questions and receive
                helpful AI-powered guidance.
              </p>

              <button
                type="button"
                onClick={handleFeatureClick}
              >
                Explore →
              </button>

            </article>

          </div>

        </section>


        {/* =========================================
            HOW IT WORKS
            ========================================= */}

        <section
          className="landing-section how-section"
          id="how-it-works"
        >

          <div className="landing-section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              Start Growing in
              <span> 3 Simple Steps</span>
            </h2>

            <p>
              Getting started with your urban garden is easier
              than you think.
            </p>

          </div>


          <div className="steps">

            {/* STEP 1 */}

            <article className="step">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                📋
              </div>

              <h3>
                Tell Us About Your Environment
              </h3>

              <p>
                Share information about your space,
                sunlight, climate and preferences.
              </p>

            </article>


            <div className="step-line"></div>


            {/* STEP 2 */}

            <article className="step">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                🌱
              </div>

              <h3>
                Get Personalized Recommendations
              </h3>

              <p>
                Receive plant suggestions and useful
                care tips based on your environment.
              </p>

            </article>


            <div className="step-line"></div>


            {/* STEP 3 */}

            <article className="step">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                🪴
              </div>

              <h3>
                Grow & Track Your Garden
              </h3>

              <p>
                Track your plants and stay updated with
                important care reminders.
              </p>

            </article>

          </div>

        </section>


        {/* =========================================
            ABOUT
            ========================================= */}

        <section
          className="about-section"
          id="about"
        >

          <div className="about-decoration">
            🌿
          </div>


          <div className="about-content">

            <span>
              WHY URBAN GARDENING ASSISTANT?
            </span>

            <h2>
              Gardening Made
              <span> Simple.</span>
            </h2>

            <p>
              Growing plants in an urban environment can be
              challenging. Limited space, changing weather
              and lack of gardening knowledge can make it
              difficult to maintain healthy plants.
            </p>

            <p>
              Our Urban Gardening Assistant brings useful
              gardening tools together in one place.
            </p>


            <div className="benefits">

              <div>
                <span>✓</span>
                Personalized recommendations
              </div>

              <div>
                <span>✓</span>
                Easy garden planning
              </div>

              <div>
                <span>✓</span>
                Plant health assistance
              </div>

              <div>
                <span>✓</span>
                Smart care reminders
              </div>

            </div>

          </div>


          <div className="about-visual">

            <div className="about-card">

              <div className="about-card-icon">
                🌱
              </div>

              <strong>
                Your Garden
              </strong>

              <span>
                Grow smarter every day
              </span>

            </div>


            <div className="about-big-plant">
              🪴
            </div>

          </div>

        </section>


        {/* =========================================
            CTA
            ========================================= */}

        <section className="cta-section">

          <div>

            <span className="cta-label">
              START YOUR GARDEN TODAY
            </span>

            <h2>
              Ready to Start Your
              <br />
              <span>Greener Journey?</span> 🌱
            </h2>

            <p>
              Start planning your urban garden today.
            </p>

          </div>


          <button
            type="button"
            className="landing-btn landing-btn-primary cta-btn"
            onClick={goToSignup}
          >
            Start Your Garden →
          </button>

        </section>

      </main>


      {/* =========================================
          FOOTER
          ========================================= */}

      <footer
        className="landing-footer"
        id="contact"
      >

        {/* FOOTER BRAND */}

        <div className="footer-brand">

          <button
            type="button"
            className="landing-logo footer-logo"
            onClick={() => scrollToSection("home")}
          >

            <span className="landing-logo-icon">
              🌱
            </span>

            <span className="landing-logo-text">
              <strong>
                Urban Gardening
              </strong>

              <span>
                Assistant
              </span>
            </span>

          </button>

          <p>
            Grow smarter. Garden better.
          </p>

        </div>


        {/* QUICK LINKS */}

        <div className="footer-links">

          <h3>
            Quick Links
          </h3>

          <button
            type="button"
            onClick={() => scrollToSection("home")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("features")}
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
          >
            How It Works
          </button>

        </div>


        {/* PROJECT LINKS */}

        <div className="footer-links">

          <h3>
            Project
          </h3>

          <button
            type="button"
            onClick={() => scrollToSection("about")}
          >
            About
          </button>

          <button
            type="button"
            onClick={goToLogin}
          >
            Login
          </button>

          <button
            type="button"
            onClick={goToSignup}
          >
            Get Started
          </button>

        </div>

      </footer>


      {/* =========================================
          COPYRIGHT
          ========================================= */}

      <div className="landing-copyright">

        <p>
          © 2026 Urban Gardening Assistant.
          Built for smarter and greener urban living.
        </p>

      </div>

    </div>
  );
}

export default Landing;