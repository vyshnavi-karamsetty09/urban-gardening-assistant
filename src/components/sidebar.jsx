import "./sidebar.css";

function Sidebar({ activePage, onPageChange, onLogout }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "⌂" },
    { key: "environment", label: "Environment Setup", icon: "☀" },
    { key: "mygarden", label: "My Garden", icon: "🌿" },
    { key: "recommendations", label: "Smart Recommendations", icon: "✦" },
    { key: "scheduler", label: "Care Scheduler", icon: "✓" },
    { key: "health", label: "Plant Health", icon: "♡" },
    { key: "assistant", label: "Garden Assistant", icon: "🤖" },
  ];

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={() => onPageChange("landing")} aria-label="Return to Garden Guide home">
        <div className="brand-icon">🌱</div>
        <div className="brand-text">
          <span className="brand-title">Garden Guide</span>
          <span className="brand-subtitle">Grow smarter. Garden better.</span>
        </div>
      </button>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <p className="nav-label">MENU</p>
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onPageChange(item.key)}
            className={`sidebar-link ${activePage === item.key ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-tip">
        <div className="tip-icon">💡</div>
        <div className="tip-content">
          <strong>Garden Tip</strong>
          <p>Healthy plants need consistent care.</p>
        </div>
      </div>

      <button type="button" className="sidebar-logout" onClick={onLogout}>
        ↪ <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
