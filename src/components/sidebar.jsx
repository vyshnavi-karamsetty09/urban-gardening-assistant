import "./sidebar.css";
import sidebarLeavesImg from "../assets/sidebar-leaves.jpg";

function Sidebar({ activePage, onPageChange, onLogout, isMobileOpen, onCloseMobile }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "⌂", target: "dashboard" },
    { key: "mygarden", label: "My Garden", icon: "🌿", target: "mygarden" },
    { key: "library", label: "Plant Library", icon: "📖", target: "library" },
    { key: "recommendations", label: "Smart Recommendations", icon: "✦", target: "recommendations" },
    { key: "scheduler", label: "Care Scheduler", icon: "📅", target: "scheduler" },
    { key: "diseasedetection", label: "Disease Detection", icon: "🔍", target: "diseasedetection" },
    { key: "community", label: "Community", icon: "👥", target: "assistant" },
    { key: "settings", label: "Settings", icon: "⚙", target: "settings" },
  ];

  const isItemActive = (item) => {
    if (item.key === "dashboard") return activePage === "dashboard";
    if (item.key === "mygarden") return activePage === "mygarden";
    if (item.key === "library") return activePage === "library";
    if (item.key === "recommendations") return activePage === "recommendations" || activePage === "environment";
    if (item.key === "scheduler") return activePage === "scheduler";
    if (item.key === "diseasedetection") return activePage === "diseasedetection" || activePage === "disease";
    if (item.key === "community") return activePage === "assistant";
    if (item.key === "settings") return activePage === "settings";
    return false;
  };

  const handleNavClick = (target) => {
    onPageChange(target);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? "show" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
        >
          ✕
        </button>

        {/* Brand */}
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => handleNavClick("dashboard")}
          aria-label="Garden Guide Dashboard"
        >
          <div className="brand-icon">
            <svg viewBox="0 0 36 36" width="36" height="36" fill="none">
              <path
                d="M11 27 C11 16, 20 8, 31 7 C31 18, 23 25, 13 27 Z"
                fill="#7cb342"
              />
              <path
                d="M13 27 C13 22, 7 18, 3 17 C3 23, 7 27, 13 27 Z"
                fill="#558b2f"
              />
              <path
                d="M12 27 Q12 33 11 35"
                stroke="#33691e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Garden Guide</span>
            <span className="brand-subtitle">Grow Smarter. Garden Better.</span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.target)}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Botanical Leaves Illustration & Quote */}
        <div className="sidebar-bottom-section">
          <div className="sidebar-leaves-decor">
            <img
              src={sidebarLeavesImg}
              alt="Botanical plant leaves"
              className="sidebar-leaves-img"
            />
          </div>

          <div className="sidebar-quote">
            <p>"A greener tomorrow starts today."</p>
            <span className="quote-leaf">🌿</span>
          </div>

          {/* Logout */}
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onLogout();
            }}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

