import { useState, useEffect } from "react";
import balconyHeroImg from "../assets/balcony-hero.jpg";
import macroLeafImg from "../assets/macro-leaf.jpg";
import plantTomatoImg from "../assets/plant-tomato.jpg";
import plantMintImg from "../assets/plant-mint.jpg";
import plantRoseImg from "../assets/plant-rose.jpg";
import plantAloeImg from "../assets/plant-aloe.jpg";
import basilPotImg from "../assets/basil-pot.jpg";
import leafBranchSvg from "../assets/leaf-branch-bg.svg";
import "./Landing.css";

function Landing({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".landing-page .fade-in-up");
    elements.forEach((el, idx) => {
      el.style.transitionDelay = `${(idx % 4) * 80}ms`;
      observer.observe(el);
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    setIsMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigate = (page, payload = null) => {
    setIsMobileNavOpen(false);
    if (onNavigate) {
      onNavigate(page, payload);
    }
  };

  const POPULAR_PLANTS = [
    {
      id: "tomato",
      name: "Cherry Tomato",
      category: "Vegetable",
      image: plantTomatoImg,
      sunlight: "6–8 hrs Sun",
      water: "Daily",
      difficulty: "Moderate",
    },
    {
      id: "basil",
      name: "Sweet Basil",
      category: "Herb",
      image: basilPotImg,
      sunlight: "4–6 hrs Sun",
      water: "2–3x / wk",
      difficulty: "Easy",
    },
    {
      id: "mint",
      name: "Spearmint",
      category: "Herb",
      image: plantMintImg,
      sunlight: "Partial Sun",
      water: "Daily",
      difficulty: "Very Easy",
    },
    {
      id: "aloe",
      name: "Aloe Vera",
      category: "Succulent",
      image: plantAloeImg,
      sunlight: "Bright Indirect",
      water: "Weekly",
      difficulty: "Very Easy",
    },
    {
      id: "rose",
      name: "Miniature Rose",
      category: "Flower",
      image: plantRoseImg,
      sunlight: "6+ hrs Sun",
      water: "Daily",
      difficulty: "Easy",
    },
  ];

  return (
    <div className="landing-page" id="top">
      {/* =========================================
          HEADER & NAVBAR
          ========================================= */}
      <header className={`landing-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-inner">
          <button
            type="button"
            className="brand-logo"
            onClick={() => scrollToSection("top")}
            aria-label="GreenGuide Home"
          >
            <span className="logo-leaf">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 16.5 16 13 21 12C21 17.5 17 21 12 22Z" fill="#52c473" />
                <path d="M12 22C12 16.5 8 13 3 12C3 17.5 7 21 12 22Z" fill="#38a169" />
                <path d="M12 22V10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M12 10C12 5.5 15.5 2 20 2C20 6.5 16.5 10 12 10Z" fill="#7ee298"/>
              </svg>
            </span>
            <span className="brand-title">GreenGuide</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <button type="button" className="nav-link active" onClick={() => scrollToSection("top")}>
              Home
            </button>
            <button type="button" className="nav-link" onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button type="button" className="nav-link" onClick={() => scrollToSection("plants")}>
              Plants
            </button>
            <button type="button" className="nav-link" onClick={() => scrollToSection("community")}>
              Community
            </button>
            <button type="button" className="nav-link" onClick={() => scrollToSection("how-it-works")}>
              About
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="nav-actions">
            <button
              type="button"
              className="btn-signin"
              onClick={() => handleNavigate("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn-get-started"
              onClick={() => handleNavigate("signup")}
            >
              Get Started
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger-bar ${isMobileNavOpen ? "open" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu Drawer */}
        {isMobileNavOpen && (
          <div className="mobile-nav-drawer">
            <button type="button" onClick={() => scrollToSection("top")}>Home</button>
            <button type="button" onClick={() => scrollToSection("features")}>Features</button>
            <button type="button" onClick={() => scrollToSection("plants")}>Plants</button>
            <button type="button" onClick={() => scrollToSection("community")}>Community</button>
            <button type="button" onClick={() => scrollToSection("how-it-works")}>About</button>
            <div className="mobile-drawer-actions">
              <button type="button" className="btn-signin w-full" onClick={() => handleNavigate("login")}>Sign In</button>
              <button type="button" className="btn-get-started w-full" onClick={() => handleNavigate("signup")}>Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section className="hero-section" style={{ backgroundImage: `url(${balconyHeroImg})` }}>
        <div className="hero-overlay-gradient"></div>

        <div className="hero-content-wrapper">
          <div className="hero-left fade-in-up">
            <div className="hero-pill-badge">
              <span className="pill-leaf-icon">🌱</span>
              <span>Your gardening companion</span>
            </div>

            <h1 className="hero-headline">
              <span className="headline-white">Grow Smarter.</span>
              <br />
              <span className="headline-green">Garden Better.</span>
            </h1>

            <p className="hero-description">
              Your personal gardening companion for healthier plants, beautiful gardens, and a greener tomorrow.
            </p>

            <div className="hero-btn-group">
              <button
                type="button"
                className="hero-btn-primary"
                onClick={() => handleNavigate("signup")}
              >
                Get Started →
              </button>
              <button
                type="button"
                className="hero-btn-outline"
                onClick={() => scrollToSection("features")}
              >
                Explore Features
              </button>
            </div>
          </div>

          {/* Right Hero Accents matching mockup */}
          <div className="hero-right-accents">
            {/* Hanging Wooden Sign Plaque */}
            <div className="hanging-wood-sign">
              <div className="wood-grain-texture"></div>
              <div className="wood-plaque-text">
                <span>Good</span>
                <span>Plants</span>
                <span>Brighter</span>
                <span>Days</span>
              </div>
              <div className="wood-plaque-icon">🌿</div>
            </div>

            {/* Script Callout Tag */}
            <div className="script-badge-container">
              <div className="script-badge-text">
                A Greener
                <br />
                Tomorrow <span className="script-sprout">🌿</span>
              </div>
              <svg className="script-underline" viewBox="0 0 110 14" fill="none">
                <path d="M4 11C35 2 75 2 106 9" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Organic Curved Wave Transition to next section */}
        <div className="hero-wave-divider">
          <svg viewBox="0 0 1440 96" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C380,85 1060,85 1440,0 L1440,96 L0,96 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* =========================================
          SECTION 2: EVERYTHING YOU NEED TO GROW
          ========================================= */}
      <section id="features" className="features-section">
        {/* Botanical watermark */}
        <div className="botanical-watermark watermark-right" style={{ backgroundImage: `url(${leafBranchSvg})` }} />

        <div className="section-container">
          <div className="section-header-center fade-in-up">
            <div className="section-tag-eyebrow">
              <span className="tag-icon">🌿</span>
              <span>EVERYTHING YOU NEED</span>
            </div>
            <h2 className="section-main-heading">
              Everything You Need <br />
              <span className="heading-green-accent">to Grow</span>
            </h2>
            <p className="section-subtext">
              From choosing the right plants to keeping them healthy, GreenGuide helps you grow with confidence.
            </p>
          </div>

          <div className="features-four-grid">
            {/* Card 1: Plant Care Guide */}
            <article
              className="feature-card fade-in-up"
              onClick={() => handleNavigate("mygarden")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("mygarden")}
            >
              <div className="feature-icon-circle icon-bg-green">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C12 16 15 13 19 12C19 16.5 16 20.5 12 21Z" fill="#327c49"/>
                  <path d="M12 21C12 16 9 13 5 12C5 16.5 8 20.5 12 21Z" fill="#469b61"/>
                  <path d="M12 21V10" stroke="#255a35" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 10C12 5.5 15 2.5 19 2C19 6 16 9.5 12 10Z" fill="#58b375"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Plant Care Guide</h3>
              <p className="feature-card-desc">
                Get personalized care tips for every plant in your garden.
              </p>
            </article>

            {/* Card 2: Smart Reminders */}
            <article
              className="feature-card fade-in-up"
              onClick={() => handleNavigate("scheduler")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("scheduler")}
            >
              <div className="feature-icon-circle icon-bg-sun">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                  <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Smart Reminders</h3>
              <p className="feature-card-desc">
                Never miss watering, fertilizing or repotting again.
              </p>
            </article>

            {/* Card 3: Disease Detection */}
            <article
              className="feature-card fade-in-up"
              onClick={() => handleNavigate("diseasedetection")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("diseasedetection")}
            >
              <div className="feature-icon-circle icon-bg-leaf">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M20.5 3.5C14 4 6 9 6 16C6 19 9 20 12 19C17 18 20 11 20.5 3.5Z" fill="#3f8854" />
                  <path d="M6 16L15 7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Disease Detection</h3>
              <p className="feature-card-desc">
                Identify plant problems with AI-powered diagnosis.
              </p>
            </article>

            {/* Card 4: Community Support */}
            <article
              className="feature-card fade-in-up"
              onClick={() => handleNavigate("assistant")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("assistant")}
            >
              <div className="feature-icon-circle icon-bg-community">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="8" r="3.5" fill="#3b7d4d" />
                  <path d="M3 18C3 15 5.5 13 9 13C12.5 13 15 15 15 18" stroke="#3b7d4d" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="17" cy="9" r="2.5" fill="#589f6b" />
                  <path d="M15 16C15.8 14.8 17.2 14.2 19 14.2C20.8 14.2 22 15 22 17" stroke="#589f6b" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-card-title">Community Support</h3>
              <p className="feature-card-desc">
                Share, learn and grow with a community of plant lovers.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 3: HOW IT WORKS
          ========================================= */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="journey-card-container">
            {/* Botanical subtle leaves watermark in card */}
            <div className="botanical-watermark watermark-card" style={{ backgroundImage: `url(${leafBranchSvg})` }} />

            {/* Left Image Card with Macro Leaf */}
            <div className="journey-image-box fade-in-up" style={{ backgroundImage: `url(${macroLeafImg})` }}>
              <div className="journey-image-gradient-overlay"></div>
              <div className="journey-image-quote">
                <h3>Plants make<br />life better”</h3>
                <div className="quote-accent-bar"></div>
              </div>
            </div>

            {/* Right Content */}
            <div className="journey-details fade-in-up">
              <div className="journey-tag-eyebrow">
                <span className="tag-icon">🌿</span>
                <span>HOW IT WORKS</span>
              </div>

              <h2 className="journey-title">
                Your Gardening Journey<br />Made Simple
              </h2>

              <div className="journey-steps-grid">
                {/* Step 1 */}
                <div className="journey-step-item">
                  <div className="step-badge-number">1</div>
                  <h4 className="step-title">Choose Plants</h4>
                  <p className="step-desc">
                    Explore a wide variety of plants for your space.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="journey-step-item">
                  <div className="step-badge-number">2</div>
                  <h4 className="step-title">Get Guidance</h4>
                  <p className="step-desc">
                    Receive expert tips and reminders.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="journey-step-item">
                  <div className="step-badge-number">3</div>
                  <h4 className="step-title">Grow Happier</h4>
                  <p className="step-desc">
                    Enjoy a healthier, greener living space.
                  </p>
                </div>
              </div>

              <div className="journey-cta-wrap">
                <button
                  type="button"
                  className="btn-journey-start"
                  onClick={() => handleNavigate("signup")}
                >
                  Start Your Journey →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 4: POPULAR PLANTS
          ========================================= */}
      <section id="plants" className="popular-plants-section">
        <div className="section-container">
          <div className="section-header-center fade-in-up">
            <div className="section-tag-eyebrow">
              <span className="tag-icon">🌿</span>
              <span>POPULAR PLANTS</span>
            </div>
            <h2 className="section-main-heading">Plants for Every Space</h2>
            <p className="section-subtext">
              Beginner-friendly green companions tailored for balconies, windowsills, and bright indoor rooms.
            </p>
          </div>

          <div className="popular-plants-grid">
            {POPULAR_PLANTS.map((plant) => (
              <div
                key={plant.id}
                className="plant-showcase-card fade-in-up"
                onClick={() => handleNavigate("library")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate("library")}
              >
                <div className="plant-image-wrap">
                  <img src={plant.image} alt={plant.name} loading="lazy" />
                  <span className="plant-category-pill">{plant.category}</span>
                </div>
                <div className="plant-card-body">
                  <h4 className="plant-name">{plant.name}</h4>
                  <div className="plant-meta-tags">
                    <span className="meta-tag">☀️ {plant.sunlight}</span>
                    <span className="meta-tag">💧 {plant.water}</span>
                  </div>
                  <div className="plant-card-bottom">
                    <span className="plant-difficulty-tag">{plant.difficulty}</span>
                    <span className="plant-view-link">Guide →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-plants-wrap fade-in-up">
            <button
              type="button"
              className="btn-view-all-plants"
              onClick={() => handleNavigate("library")}
            >
              Browse Full Plant Library (20+ Varieties) →
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 5: STATS & COMMUNITY
          ========================================= */}
      <section id="community" className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-box fade-in-up">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Happy Urban Gardeners</div>
            </div>
            <div className="stat-box fade-in-up">
              <div className="stat-number">1.2M+</div>
              <div className="stat-label">Plants Monitored & Thriving</div>
            </div>
            <div className="stat-box fade-in-up">
              <div className="stat-number">98%</div>
              <div className="stat-label">First-Season Survival Rate</div>
            </div>
            <div className="stat-box fade-in-up">
              <div className="stat-number">4.9 / 5</div>
              <div className="stat-label">Average Community Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECTION 6: FINAL CALL TO ACTION
          ========================================= */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-banner-card fade-in-up">
            <h2>Ready to grow something <span className="highlight-italic">wonderful?</span></h2>
            <p>
              Join thousands of enthusiastic apartment and home growers cultivating thriving green spaces everywhere.
            </p>
            <div className="cta-actions">
              <button
                type="button"
                className="btn-cta-primary"
                onClick={() => handleNavigate("signup")}
              >
                Create Free Account →
              </button>
              <button
                type="button"
                className="btn-cta-secondary"
                onClick={() => handleNavigate("dashboard")}
              >
                Explore Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FOOTER
          ========================================= */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="brand-logo footer-logo">
                <span className="logo-leaf">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 16.5 16 13 21 12C21 17.5 17 21 12 22Z" fill="#52c473" />
                    <path d="M12 22C12 16.5 8 13 3 12C3 17.5 7 21 12 22Z" fill="#38a169" />
                    <path d="M12 22V10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </span>
                <span className="brand-title">GreenGuide</span>
              </div>
              <p className="footer-tagline">
                Nurturing beautiful, sustainable urban gardens with smart botanical intelligence.
              </p>
            </div>

            <div className="footer-nav-columns">
              <div className="footer-col">
                <h5>Product</h5>
                <button type="button" onClick={() => scrollToSection("features")}>Features</button>
                <button type="button" onClick={() => scrollToSection("how-it-works")}>How It Works</button>
                <button type="button" onClick={() => handleNavigate("library")}>Plant Encyclopedia</button>
                <button type="button" onClick={() => handleNavigate("diseasedetection")}>AI Disease Scanner</button>
              </div>

              <div className="footer-col">
                <h5>Tools</h5>
                <button type="button" onClick={() => handleNavigate("scheduler")}>Watering Scheduler</button>
                <button type="button" onClick={() => handleNavigate("environment")}>Sunlight Calculator</button>
                <button type="button" onClick={() => handleNavigate("assistant")}>AI Garden Assistant</button>
                <button type="button" onClick={() => handleNavigate("mygarden")}>My Garden Tracker</button>
              </div>

              <div className="footer-col">
                <h5>Account</h5>
                <button type="button" onClick={() => handleNavigate("login")}>Sign In</button>
                <button type="button" onClick={() => handleNavigate("signup")}>Sign Up</button>
                <button type="button" onClick={() => handleNavigate("dashboard")}>Live App</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 GreenGuide. Grow smarter, garden better.</div>
            <div className="footer-links-inline">
              <button type="button" onClick={() => scrollToSection("top")}>Back to top ↑</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
