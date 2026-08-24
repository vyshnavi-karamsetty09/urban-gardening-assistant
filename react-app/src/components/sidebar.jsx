import "./sidebar.css";

function Sidebar({ activePage, onPageChange }) {
  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      key: "environment",
      label: "Environment Setup",
      icon: "☀",
    },
    {
      key: "mygarden",
      label: "My Garden",
      icon: "🌿",
    },
    {
      key: "recommendations",
      label: "Smart Recommendations",
      icon: "✦",
    },
  ];

  return (
    <aside className="sidebar">

      {/* ================= BRAND ================= */}

      <button
        type="button"
        className="sidebar-brand"
        onClick={() => onPageChange("dashboard")}
      >
        <div className="brand-icon">
          🌱
        </div>

        <div className="brand-text">
          <span className="brand-title">Garden Guide</span>
          <span className="brand-subtitle">
            Grow smarter. Garden better.
          </span>
        </div>
      </button>


      {/* ================= NAVIGATION ================= */}

      <nav className="sidebar-nav">

        <p className="nav-label">
          MENU
        </p>

        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onPageChange(item.key)}
            className={`sidebar-link ${
              activePage === item.key ? "active" : ""
            }`}
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span className="sidebar-link-text">
              {item.label}
            </span>

          </button>
        ))}

      </nav>


      {/* ================= TIP ================= */}

      <div className="sidebar-tip">

        <div className="tip-icon">
          💡
        </div>

        <div className="tip-content">

          <strong>
            Garden Tip
          </strong>

          <p>
            Healthy plants need consistent care.
          </p>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;