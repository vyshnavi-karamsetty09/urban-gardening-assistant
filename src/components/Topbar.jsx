import { useState, useEffect, useRef } from "react";
import { STORAGE_KEYS } from "../utils";
import "./Topbar.css";

const PAGE_META = {
  dashboard: { title: "Dashboard", icon: "⌂", subtitle: "Overview & Daily Care" },
  environment: { title: "Environment Setup", icon: "☀", subtitle: "Sunlight, Climate & Space" },
  mygarden: { title: "My Garden", icon: "🌿", subtitle: "Plants & Health Status" },
  recommendations: { title: "Smart Recommendations", icon: "✦", subtitle: "Personalized Plant Suggestions" },
  diseasedetection: { title: "Disease Detection", icon: "🔍", subtitle: "AI Scanner & Treatment Hub" },
  disease: { title: "Disease Detection", icon: "🔍", subtitle: "AI Scanner & Treatment Hub" },
  health: { title: "Plant Health", icon: "♡", subtitle: "Diagnosis & Symptoms" },
  scheduler: { title: "Care Scheduler", icon: "✓", subtitle: "Daily Watering & Tasks" },
  assistant: { title: "Garden Assistant", icon: "🤖", subtitle: "Offline Gardening Helper" },
};

function Topbar({ activePage = "dashboard", onPageChange, onLogout }) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Session user
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || "Gardener";
  const userEmail = user?.email || "gardener@urban.io";

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Watering Reminder",
      message: "4 plants need soil moisture checks this morning.",
      time: "Just now",
      icon: "💧",
      page: "scheduler",
      read: false,
    },
    {
      id: 2,
      title: "Fungal Spore Alert",
      message: "High balcony humidity. Check leaf undersides for Powdery Mildew.",
      time: "1h ago",
      icon: "🔍",
      page: "diseasedetection",
      payload: { symptom: "White powdery coating" },
      read: false,
    },
    {
      id: 3,
      title: "Smart Recommendation",
      message: "Snake Plant & Aloe Vera match your low-light indoor profile.",
      time: "3h ago",
      icon: "✦",
      page: "recommendations",
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotifOpen(false);
    if (onPageChange && notif.page) {
      onPageChange(notif.page, notif.payload || null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Direct search to Disease Detection if disease or symptom related, else My Garden
    const isDiseaseQuery = /leaf|spot|rot|blight|mildew|mite|aphid|yellow|pest|fungus|disease|curl|wilt/i.test(query);
    if (isDiseaseQuery && onPageChange) {
      onPageChange("diseasedetection", { symptom: query });
    } else if (onPageChange) {
      onPageChange("mygarden");
    }
    setIsSearchFocused(false);
  };

  const currentPage = PAGE_META[activePage] || {
    title: "Dashboard",
    icon: "🌱",
    subtitle: "Urban Garden Assistant",
  };

  return (
    <header className="topbar" role="banner">
      {/* LEFT: Page Breadcrumb & Title */}
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          <button
            type="button"
            className="breadcrumb-home-link"
            onClick={() => onPageChange && onPageChange("dashboard")}
            title="Go to Dashboard"
          >
            <span>🌱</span> Garden
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            <span className="breadcrumb-icon">{currentPage.icon}</span>
            <span className="breadcrumb-title">{currentPage.title}</span>
          </span>
        </div>
      </div>

      {/* CENTER: Search Bar */}
      <div className="topbar-search-wrapper" ref={searchRef}>
        <form className={`topbar-search ${isSearchFocused ? "focused" : ""}`} onSubmit={handleSearchSubmit}>
          <span className="search-icon">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search diseases, plants, symptoms..."
            aria-label="Search diseases, plants, or symptoms"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <span className="search-shortcut" title="Press Enter to search">↵</span>
        </form>

        {isSearchFocused && (
          <div className="search-quick-panel">
            <p className="quick-search-label">Quick Suggestions</p>
            <div className="quick-search-tags">
              <button
                type="button"
                className="quick-search-tag"
                onClick={() => {
                  setSearchQuery("Powdery Mildew");
                  if (onPageChange) onPageChange("diseasedetection", { symptom: "Powdery Mildew" });
                  setIsSearchFocused(false);
                }}
              >
                🔬 Powdery Mildew
              </button>
              <button
                type="button"
                className="quick-search-tag"
                onClick={() => {
                  setSearchQuery("Root Rot");
                  if (onPageChange) onPageChange("diseasedetection", { symptom: "Root Rot" });
                  setIsSearchFocused(false);
                }}
              >
                💧 Root Rot
              </button>
              <button
                type="button"
                className="quick-search-tag"
                onClick={() => {
                  setSearchQuery("Spider Mites");
                  if (onPageChange) onPageChange("diseasedetection", { symptom: "Spider Mites" });
                  setIsSearchFocused(false);
                }}
              >
                🕷️ Spider Mites
              </button>
              <button
                type="button"
                className="quick-search-tag"
                onClick={() => {
                  setSearchQuery("Tomato Care");
                  if (onPageChange) onPageChange("mygarden");
                  setIsSearchFocused(false);
                }}
              >
                🍅 Tomato Care
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Actions (Weather, Notifications, Profile) */}
      <div className="topbar-actions">
        {/* Weather status pill */}
        <div className="topbar-weather-pill" title="Current garden conditions">
          <span className="weather-icon">☀️</span>
          <div className="weather-info">
            <span className="weather-temp">28°C</span>
            <span className="weather-label">Optimal</span>
          </div>
        </div>

        {/* Quick Nav Shortcuts for Mobile / Tablet */}
        <div className="topbar-nav-pills">
          <button
            type="button"
            className={`nav-pill ${activePage === "diseasedetection" ? "active" : ""}`}
            onClick={() => onPageChange && onPageChange("diseasedetection")}
            title="Scan plant for disease"
          >
            🔍 Scan Leaf
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="notif-dropdown-wrapper" ref={notifRef}>
          <button
            type="button"
            className={`notification-btn ${isNotifOpen ? "active" : ""}`}
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-label="Garden Notifications"
            aria-expanded={isNotifOpen}
          >
            <span className="notification-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-count" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notif-menu">
              <div className="notif-header">
                <div className="notif-header-title">
                  <strong>Notifications</strong>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button type="button" className="notif-mark-read" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.map((notif) => (
                  <button
                    type="button"
                    key={notif.id}
                    className={`notif-item ${!notif.read ? "unread" : ""}`}
                    onClick={() => handleNotifClick(notif)}
                  >
                    <span className="notif-item-icon">{notif.icon}</span>
                    <div className="notif-item-body">
                      <div className="notif-item-head">
                        <span className="notif-item-title">{notif.title}</span>
                        <span className="notif-item-time">{notif.time}</span>
                      </div>
                      <p className="notif-item-msg">{notif.message}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="notif-footer">
                <button
                  type="button"
                  className="notif-footer-link"
                  onClick={() => {
                    setIsNotifOpen(false);
                    if (onPageChange) onPageChange("scheduler");
                  }}
                >
                  View All Care Tasks →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`profile-btn ${isProfileOpen ? "active" : ""}`}
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            aria-label="User profile menu"
            aria-expanded={isProfileOpen}
          >
            <span className="profile-avatar">🌱</span>
            <div className="profile-user-info">
              <span className="profile-name">{userName}</span>
              <span className="profile-status">Gardener</span>
            </div>
            <span className="profile-arrow">{isProfileOpen ? "▴" : "▾"}</span>
          </button>

          {isProfileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <div className="profile-menu-avatar">🌱</div>
                <div className="profile-menu-info">
                  <strong>{userName}</strong>
                  <small>{userEmail}</small>
                </div>
              </div>

              <div className="profile-menu-links">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onPageChange) onPageChange("dashboard");
                  }}
                >
                  <span>⌂</span> Dashboard
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onPageChange) onPageChange("mygarden");
                  }}
                >
                  <span>🌿</span> My Garden Collection
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onPageChange) onPageChange("diseasedetection");
                  }}
                >
                  <span>🔍</span> Plant Disease Scanner
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onPageChange) onPageChange("environment");
                  }}
                >
                  <span>⚙️</span> Garden Environment Settings
                </button>
              </div>

              <div className="profile-menu-footer">
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <span>↪</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;