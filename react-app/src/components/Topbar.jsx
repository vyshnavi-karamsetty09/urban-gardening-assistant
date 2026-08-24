import "./Topbar.css";

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button
          type="button"
          className="notification-btn"
          aria-label="Notifications"
        >
          <span className="notification-icon">♧</span>
          <span className="notification-count">3</span>
        </button>

        <button
          type="button"
          className="profile-btn"
          aria-label="User profile"
        >
          <span className="profile-avatar">👤</span>

          <span className="profile-name">
            Gardener
          </span>

          <span className="profile-arrow">
            ⌄
          </span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;