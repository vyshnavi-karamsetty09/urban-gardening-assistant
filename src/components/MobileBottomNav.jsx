import "./MobileBottomNav.css";

function MobileBottomNav({ activePage, onPageChange }) {
  const navItems = [
    { key: "dashboard", label: "Home", icon: "⌂", target: "dashboard" },
    { key: "mygarden", label: "My Garden", icon: "🌿", target: "mygarden" },
    { key: "recommendations", label: "Smart Recs", icon: "✦", target: "recommendations" },
    { key: "scheduler", label: "Care", icon: "📅", target: "scheduler" },
    { key: "diseasedetection", label: "Diagnosis", icon: "🔍", target: "diseasedetection" },
  ];

  const isActive = (item) => {
    if (item.key === "dashboard") return activePage === "dashboard";
    if (item.key === "mygarden") return activePage === "mygarden";
    if (item.key === "recommendations") return activePage === "recommendations" || activePage === "environment";
    if (item.key === "scheduler") return activePage === "scheduler";
    if (item.key === "diseasedetection") return activePage === "diseasedetection" || activePage === "disease";
    return false;
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.key}
              type="button"
              className={`mobile-nav-btn ${active ? "active" : ""}`}
              onClick={() => onPageChange(item.target)}
              aria-label={item.label}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
              {active && <span className="mobile-nav-indicator"></span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;

