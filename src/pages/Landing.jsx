import { useEffect } from "react";
import heroGardenImg from "../assets/hero-garden.jpg";
import plantOfWeekImg from "../assets/plant-of-week.png";
import "./Landing.css";

function Landing({ onNavigate }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.12 }
    );

    const fadeElements = document.querySelectorAll(".landing-page .fade");
    fadeElements.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 5) * 70}ms`;
      observer.observe(el);
    });

    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="landing-page" id="top">
      {/* =========================================
          HEADER
          ========================================= */}
      <header>
        <div className="container nav">
          <button
            type="button"
            className="brand"
            onClick={() => scrollToSection("top")}
          >
            <span className="logo">🌱</span>
            GreenGuide
          </button>

          <nav>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how")}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
          </nav>

          <div className="actions">
            <button
              type="button"
              className="login"
              onClick={() => handleNavigate("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => handleNavigate("signup")}
            >
              Get Started →
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          MAIN CONTENT
          ========================================= */}
      <main>
        {/* =========================================
            HERO
            ========================================= */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="fade">
              <span className="pill">🍃 Your gardening companion</span>
              <h1 className="display">
                Grow Smarter.
                <br />
                <span className="italic">Garden Better.</span>
              </h1>
              <p>
                Your personal gardening companion for healthier plants, beautiful
                gardens, and a greener tomorrow.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleNavigate("signup")}
                >
                  Get Started →
                </button>
                <button
                  type="button"
                  className="btn outline"
                  onClick={() => scrollToSection("features")}
                >
                  Explore Features
                </button>
              </div>
              <p className="note">
                <span className="check">✓</span> No experience required — perfect
                for beginners
              </p>
            </div>

            <div className="hero-image fade">
              <img
                src={heroGardenImg}
                alt="Terracotta pots with plants, seed packets and a watering can"
              />
              <div className="badge sun">
                ☀️ <span className="sun-icon">Sunlight checked</span>
              </div>
              <div className="badge water">
                💧 <span className="water-icon">Watering scheduled</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            FEATURES
            ========================================= */}
        <section id="features" className="section">
          <div className="container">
            <div className="center intro fade">
              <div className="eyebrow">Complete gardening toolkit</div>
              <h2 className="display">Everything You Need to Grow</h2>
              <p className="sub">
                Simple tools to help you plan, grow and maintain your dream garden.
              </p>
            </div>

            <div className="features">
              {/* Feature 1 */}
              <article
                className="card fade"
                onClick={() => handleNavigate("mygarden")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate("mygarden")}
              >
                <div className="icon">🌱</div>
                <h3>Smart Plant Care</h3>
                <p>
                  Personalized care schedules based on your plants, seasons and
                  local climate conditions.
                </p>
                <div className="explore">Explore →</div>
              </article>

              {/* Feature 2 */}
              <article
                className="card fade"
                onClick={() => handleNavigate("environment")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate("environment")}
              >
                <div className="icon">📍</div>
                <h3>Garden Planner</h3>
                <p>
                  Design your dream garden with AI-powered planning tools tailored
                  to your space.
                </p>
                <div className="explore">Explore →</div>
              </article>

              {/* Feature 3 */}
              <article
                className="card fade"
                onClick={() => handleNavigate("diseasedetection")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleNavigate("diseasedetection")
                }
              >
                <div className="icon">🔎</div>
                <h3>Disease Detection</h3>
                <p>
                  Snap a photo to identify plant diseases and get instant
                  treatment recommendations.
                </p>
                <div className="explore">Explore →</div>
              </article>

              {/* Feature 4 */}
              <article
                className="card fade"
                onClick={() => handleNavigate("scheduler")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate("scheduler")}
              >
                <div className="icon">📅</div>
                <h3>Care Scheduler</h3>
                <p>
                  Never forget watering, fertilizing, or pruning with intelligent
                  reminders.
                </p>
                <div className="explore">Explore →</div>
              </article>

              {/* Feature 5 */}
              <article
                className="card fade"
                onClick={() => handleNavigate("assistant")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate("assistant")}
              >
                <div className="icon">✨</div>
                <h3>AI Gardening Assistant</h3>
                <p>
                  Get answers to any gardening question from our knowledgeable AI
                  assistant.
                </p>
                <div className="explore">Explore →</div>
              </article>
            </div>
          </div>
        </section>

        {/* =========================================
            HOW IT WORKS
            ========================================= */}
        <section id="how" className="how section">
          <div className="container">
            <div className="center intro fade">
              <div className="eyebrow">Simple process</div>
              <h2 className="display">Start Growing in 3 Simple Steps</h2>
              <p className="sub">
                Getting started with your dream garden is easier than you think.
              </p>
            </div>

            <div className="steps">
              <article className="card step fade">
                <div className="num">1</div>
                <div className="round">📍</div>
                <h3>Tell Us About Your Environment</h3>
                <p>
                  Share your space, climate and sunlight conditions. We'll help you
                  understand your garden's unique microclimate.
                </p>
              </article>

              <article className="card step fade">
                <div className="num">2</div>
                <div className="round">🌱</div>
                <h3>Get Personalized Recommendations</h3>
                <p>
                  Receive custom plant suggestions and care plans tailored to your
                  skill level and garden environment.
                </p>
              </article>

              <article className="card step fade">
                <div className="num">3</div>
                <div className="round">📈</div>
                <h3>Grow &amp; Track Your Garden</h3>
                <p>
                  Follow guided tasks, track plant progress and watch your garden
                  flourish with our smart monitoring.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* =========================================
            ABOUT
            ========================================= */}
        <section id="about" className="section">
          <div className="container about">
            <div className="fade">
              <div className="eyebrow">Why GreenGuide</div>
              <h2 className="display">
                Gardening Made <span className="italic">Simple.</span>
              </h2>
              <p>
                We believe everyone can grow a beautiful garden. Whether you're a
                beginner or a seasoned pro, GreenGuide makes gardening enjoyable and
                stress-free.
              </p>
              <ul className="checks">
                <li>
                  <span className="checkmark">✓</span>
                  Personalized recommendations
                </li>
                <li>
                  <span className="checkmark">✓</span>
                  Plant health scanner
                </li>
                <li>
                  <span className="checkmark">✓</span>
                  Care reminders
                </li>
                <li>
                  <span className="checkmark">✓</span>
                  Community support
                </li>
              </ul>
            </div>

            <div className="plant-wrap fade">
              <div className="circle"></div>
              <img
                className="plant"
                src={plantOfWeekImg}
                alt="Healthy potted fern"
              />
              <div className="week">✨ Plant of the week</div>
            </div>
          </div>
        </section>

        {/* =========================================
            STATS
            ========================================= */}
        <section className="stats">
          <div className="container stat-grid">
            <div className="fade">
              <div className="stat-value" data-target="50000" data-suffix="+">
                50K+
              </div>
              <div className="stat-label">Happy gardeners</div>
            </div>

            <div className="fade">
              <div className="stat-value" data-target="1200000" data-suffix="">
                1.2M
              </div>
              <div className="stat-label">Plants cared for</div>
            </div>

            <div className="fade">
              <div className="stat-value">4.9/5</div>
              <div className="stat-label">Average rating</div>
            </div>

            <div className="fade">
              <div className="stat-value">98%</div>
              <div className="stat-label">Plant survival rate</div>
            </div>
          </div>
        </section>

        {/* =========================================
            CTA
            ========================================= */}
        <section className="cta">
          <div className="fade">
            <h2 className="display">
              Ready to grow something <span className="italic">wonderful?</span>
            </h2>
            <p>
              Join thousands of gardeners who use GreenGuide to keep their plants
              happy and thriving.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => handleNavigate("signup")}
            >
              Start Your Garden →
            </button>
          </div>
        </section>
      </main>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer id="contact">
        <div className="container footer">
          <div className="brand">
            <span className="logo">🌱</span>GreenGuide
          </div>
          <div>© 2026 GreenGuide. Grow something wonderful.</div>
          <div className="footer-links">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how")}
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;