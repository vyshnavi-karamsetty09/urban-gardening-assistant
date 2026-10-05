import { useState, useEffect, useRef } from "react";
import {
  DEMO_NOTIFICATIONS,
  getNotificationInbox,
  isDemoAccount,
  saveNotificationInbox,
} from "../utils";
import "./Topbar.css";

const PAGE_META = {
  dashboard: { title: "Dashboard", icon: "⌂", subtitle: "Overview & Daily Care" },
  environment: {
    title: "Smart Recommendations",
    icon: "✦",
    subtitle: "Weather, Environment & Plant Matching",
  },
  mygarden: { title: "My Garden", icon: "🌿", subtitle: "Plants & Health Status" },
  library: {
    title: "Plant Library",
    icon: "📖",
    subtitle: "Botanical Encyclopedia & Care Guides",
  },
  recommendations: {
    title: "Smart Recommendations",
    icon: "✦",
    subtitle: "Weather, Environment & Plant Matching",
  },
  diseasedetection: {
    title: "Disease Detection",
    icon: "🔍",
    subtitle: "AI Scanner & Treatment Hub",
  },
  disease: {
    title: "Disease Detection",
    icon: "🔍",
    subtitle: "AI Scanner & Treatment Hub",
  },
  health: { title: "Plant Health", icon: "♡", subtitle: "Diagnosis & Symptoms" },
  scheduler: {
    title: "Care Scheduler",
    icon: "✓",
    subtitle: "Daily Watering & Tasks",
  },
  assistant: {
    title: "Garden Assistant",
    icon: "🤖",
    subtitle: "AI Gardening Helper",
  },
  community: {
    title: "Community Hub",
    icon: "👥",
    subtitle: "Discussions, Tips & Plant Showcases",
  },
  settings: {
    title: "Settings & Preferences",
    icon: "⚙",
    subtitle: "Profile, Microclimate & Garden Data",
  },
  admin: {
    title: "Admin Console",
    icon: "🛠️",
    subtitle: "Catalog, Users & Disease Reports",
  },
};

function filterNotificationItems(items, prefs = {}) {
  return Array.isArray(items)
    ? items.filter((item) => {
        const title = String(item?.title || "").toLowerCase();

        if (/watering|water/i.test(title)) {
          return prefs.morningWatering !== false;
        }

        if (/weather/i.test(title)) {
          return prefs.weatherAlerts !== false;
        }

        if (/disease|fungal|plant health|health/i.test(title)) {
          return prefs.diseaseWarnings !== false;
        }

        if (/recommend|smart match|recommendation/i.test(title)) {
          return prefs.aiRecommendations !== false;
        }

        return true;
      })
    : [];
}

function Topbar({
  activePage = "dashboard",
  user: userProp = null,
  onPageChange,
  onLogout,
  onToggleSidebar,
  theme = "light",
  onToggleTheme,
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // App's authenticated user is the single source of truth.
  // Do not keep a second local copy of profile identity in Topbar.
  const user = userProp || null;
  const userName = String(user?.name || "").trim() || "Gardener";
  const userEmail =
    String(user?.email || "").trim() || "gardener@gardenguide.io";

  // Notifications
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const stored = getNotificationInbox();

    if (stored.length > 0) {
      const prefs = user?.notificationPreferences || {};
      setNotifications(filterNotificationItems(stored, prefs));
      return;
    }

    // Sample notifications belong only to the explicit demo account.
    if (isDemoAccount(user)) {
      saveNotificationInbox(DEMO_NOTIFICATIONS);
      const prefs = user?.notificationPreferences || {};
      setNotifications(filterNotificationItems(DEMO_NOTIFICATIONS, prefs));
    } else {
      setNotifications([]);
    }
  }, [
    user?.id,
    user?.email,
    user?.notificationPreferences?.morningWatering,
    user?.notificationPreferences?.weatherAlerts,
    user?.notificationPreferences?.diseaseWarnings,
    user?.notificationPreferences?.aiRecommendations,
  ]);

  // Refresh notifications when another part of the workspace updates them.
  useEffect(() => {
    const refreshWorkspace = () => {
      const prefs = user?.notificationPreferences || {};
      const stored = getNotificationInbox();

      setNotifications(filterNotificationItems(stored, prefs));
    };

    window.addEventListener(
      "garden-guide:workspace-updated",
      refreshWorkspace
    );

    return () =>
      window.removeEventListener(
        "garden-guide:workspace-updated",
        refreshWorkspace
      );
  }, [
    user?.id,
    user?.email,
    user?.notificationPreferences?.morningWatering,
    user?.notificationPreferences?.weatherAlerts,
    user?.notificationPreferences?.diseaseWarnings,
    user?.notificationPreferences?.aiRecommendations,
  ]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotificationInbox(next);
      return next;
    });
  };

  const handleNotifClick = (notif) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      );

      saveNotificationInbox(next);
      return next;
    });

    setIsNotifOpen(false);

    if (onPageChange && notif.page) {
      onPageChange(notif.page, notif.payload);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    if (onPageChange) {
      onPageChange("library");
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
      {/* LEFT: Mobile Menu Button & Breadcrumb */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <span className="menu-btn-bar"></span>
          <span className="menu-btn-bar"></span>
          <span className="menu-btn-bar"></span>
        </button>

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
        <form
          className={`topbar-search ${
            isSearchFocused ? "focused" : ""
          }`}
          onSubmit={handleSearchSubmit}
        >
          <span className="search-icon">🔍</span>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search plants, care tips, diseases..."
            aria-label="Search plants, care tips, diseases..."
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

          <span
            className="search-shortcut"
            title="Press Enter to search"
          >
            ↵
          </span>
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

                  if (onPageChange) {
                    onPageChange("diseasedetection", {
                      symptom: "Powdery Mildew",
                    });
                  }

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

                  if (onPageChange) {
                    onPageChange("diseasedetection", {
                      symptom: "Root Rot",
                    });
                  }

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

                  if (onPageChange) {
                    onPageChange("diseasedetection", {
                      symptom: "Spider Mites",
                    });
                  }

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

                  if (onPageChange) {
                    onPageChange("mygarden");
                  }

                  setIsSearchFocused(false);
                }}
              >
                🍅 Tomato Care
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Actions (Theme Toggle, Notifications, Profile) */}
      <div className="topbar-actions">
        {/* Theme Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          <span
            className="theme-toggle-icon"
            aria-hidden="true"
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line
                  x1="18.36"
                  y1="18.36"
                  x2="19.78"
                  y2="19.79"
                />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line
                  x1="18.36"
                  y1="5.64"
                  x2="19.79"
                  y2="4.22"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div
          className="notif-dropdown-wrapper"
          ref={notifRef}
        >
          <button
            type="button"
            className={`notification-btn ${
              isNotifOpen ? "active" : ""
            }`}
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsProfileOpen(false);
            }}
            aria-label="Garden Notifications"
            aria-expanded={isNotifOpen}
          >
            <span
              className={`notification-icon ${
                unreadCount > 0 ? "bell-active" : ""
              }`}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </span>

            {unreadCount > 0 && (
              <span
                className="notification-count"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notif-menu">
              <div className="notif-header">
                <div className="notif-header-title">
                  <strong>Notifications</strong>

                  {unreadCount > 0 && (
                    <span className="notif-badge">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notif-mark-read"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <span aria-hidden="true">🌱</span>
                    <strong>No notifications yet</strong>
                    <small>
                      Your garden alerts will appear here.
                    </small>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      type="button"
                      key={notif.id}
                      className={`notif-item ${
                        !notif.read ? "unread" : ""
                      }`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <span className="notif-item-icon">
                        {notif.icon}
                      </span>

                      <div className="notif-item-body">
                        <div className="notif-item-head">
                          <span className="notif-item-title">
                            {notif.title}
                          </span>

                          <span className="notif-item-time">
                            {notif.time}
                          </span>
                        </div>

                        <p className="notif-item-msg">
                          {notif.message}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="notif-footer">
                <button
                  type="button"
                  className="notif-footer-link"
                  onClick={() => {
                    setIsNotifOpen(false);

                    if (onPageChange) {
                      onPageChange("scheduler");
                    }
                  }}
                >
                  View All Care Tasks →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div
          className="profile-dropdown-wrapper"
          ref={profileRef}
        >
          <button
            type="button"
            className={`profile-btn ${
              isProfileOpen ? "active" : ""
            }`}
            onClick={() => {
              setIsProfileOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            aria-label="User profile menu"
            aria-expanded={isProfileOpen}
          >
            <span className="profile-avatar">👨‍🌾</span>

            <div className="profile-user-info">
              <span className="profile-name">
                Hello, {userName}
              </span>

              <span className="profile-status">
                Plant Lover
              </span>
            </div>

            <span className="profile-arrow">
              {isProfileOpen ? "▴" : "▾"}
            </span>
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

                    if (onPageChange) {
                      onPageChange("dashboard");
                    }
                  }}
                >
                  <span>⌂</span> Dashboard
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);

                    if (onPageChange) {
                      onPageChange("mygarden");
                    }
                  }}
                >
                  <span>🌿</span> My Garden Collection
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);

                    if (onPageChange) {
                      onPageChange("diseasedetection");
                    }
                  }}
                >
                  <span>🔍</span> Plant Disease Scanner
                </button>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);

                    if (onPageChange) {
                      onPageChange("settings");
                    }
                  }}
                >
                  <span>⚙️</span> Settings & Profile
                </button>
              </div>

              <div className="profile-menu-footer">
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);

                    if (onLogout) {
                      onLogout();
                    }
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