import { useState, useEffect } from "react";
import { STORAGE_KEYS, getSavedPlants, savePlants, defaultPlants } from "../utils";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./Settings.css";

function Settings({ onPageChange, onLogout }) {
  // Session User State
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      return raw ? JSON.parse(raw) : { name: "Dattu", email: "dattu@gardenguide.io", role: "Urban Balcony Gardener" };
    } catch {
      return { name: "Dattu", email: "dattu@gardenguide.io", role: "Urban Balcony Gardener" };
    }
  });

  const [userName, setUserName] = useState(user.name || "Dattu");
  const [userEmail, setUserEmail] = useState(user.email || "dattu@gardenguide.io");
  const [userRole, setUserRole] = useState(user.role || "Balcony Enthusiast");
  const [userBio, setUserBio] = useState(
    user.bio || "Passionate about container gardening, fresh herbs, and balcony tomatoes."
  );

  // Saved Environment State
  const [environment, setEnvironment] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.environment);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      pincode: "500081",
      location: "Balcony",
      space: "Medium",
      sunlight: "Full Sun",
      temperature: "20°C - 30°C",
      climate: "Tropical",
      humidity: "Medium",
      medium: "Potting Mix",
    };
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem("gardenGuideNotifications");
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      morningWatering: true,
      weatherAlerts: true,
      diseaseWarnings: true,
      aiRecommendations: true,
      weeklySummary: false,
    };
  });

  // Units & Display Preferences
  const [preferences, setPreferences] = useState(() => {
    try {
      const raw = localStorage.getItem("gardenGuidePreferences");
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      tempUnit: "Celsius (°C)",
      measurementUnit: "Metric (cm / m)",
      autoWaterLogging: true,
      theme: "Botanical Light",
    };
  });

  // Active section tab inside Settings
  const [activeSection, setActiveSection] = useState("profile"); // profile | environment | notifications | preferences | data
  const [toastMsg, setToastMsg] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Garden Stats
  const [plantsCount, setPlantsCount] = useState(0);

  useEffect(() => {
    const plants = getSavedPlants();
    setPlantsCount(Array.isArray(plants) ? plants.length : 0);
  }, []);

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Save User Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: userName.trim() || "Gardener",
      email: userEmail.trim() || "gardener@gardenguide.io",
      role: userRole,
      bio: userBio,
      isLoggedIn: true,
    };
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      showToast("✓ Profile information updated successfully!");
    } catch {
      showToast("❌ Could not save profile.");
    }
  };

  // Update Environment Field
  const handleUpdateEnvironment = (field, value) => {
    setEnvironment((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEYS.environment, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast(`✓ Environment ${field} updated!`);
  };

  // Toggle Notification
  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("gardenGuideNotifications", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast("✓ Notification preferences saved.");
  };

  // Update Preference
  const handleUpdatePreference = (key, value) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem("gardenGuidePreferences", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast("✓ Display preference updated.");
  };

  // Export Garden Data
  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      environment,
      plants: getSavedPlants(),
      notifications,
      preferences,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `garden-guide-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("📥 Garden data backup downloaded!");
  };

  // Restore Default Plants
  const handleRestoreDefaults = () => {
    savePlants(defaultPlants);
    setPlantsCount(defaultPlants.length);
    showToast("🌿 Default botanical plants restored!");
  };

  // Reset Garden Cache
  const handleResetGarden = () => {
    savePlants([]);
    setPlantsCount(0);
    setShowResetConfirm(false);
    showToast("🗑️ Garden plants collection cleared.");
  };

  // Perform Logout
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <main className="settings-page">
      {/* =========================================
          1. SETTINGS HEADER BANNER
          ========================================= */}
      <PageHeaderBanner
        eyebrow="ACCOUNT & SYSTEM CONTROLS"
        title="Settings & Preferences"
        titleAccent="⚙️"
        subtitle="Manage your personal gardener profile, saved microclimate environment, notifications, and garden data backups."
        badgeIcon="👤"
        badgeTitle={userName}
        badgeSubtitle={`${userRole} • Pincode ${environment.pincode || "500081"}`}
      />

      {/* =========================================
          2. SETTINGS MAIN TWO-COLUMN LAYOUT
          ========================================= */}
      <div className="settings-layout-grid">
        {/* Left: Navigation Tabs Sidebar */}
        <aside className="settings-sidebar-nav slow-popup animate-slow-pop" style={{ animationDelay: "60ms" }}>
          <button
            type="button"
            className={`settings-nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <span className="nav-ico">👤</span>
            <div className="nav-text">
              <strong>User Profile</strong>
              <small>Name, email & gardener bio</small>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeSection === "environment" ? "active" : ""}`}
            onClick={() => setActiveSection("environment")}
          >
            <span className="nav-ico">⛅</span>
            <div className="nav-text">
              <strong>Saved Environment</strong>
              <small>Microclimate & growing space</small>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeSection === "notifications" ? "active" : ""}`}
            onClick={() => setActiveSection("notifications")}
          >
            <span className="nav-ico">🔔</span>
            <div className="nav-text">
              <strong>Notifications & Alerts</strong>
              <small>Watering reminders & weather</small>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeSection === "preferences" ? "active" : ""}`}
            onClick={() => setActiveSection("preferences")}
          >
            <span className="nav-ico">📐</span>
            <div className="nav-text">
              <strong>Units & Display</strong>
              <small>Temperature & measurement</small>
            </div>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeSection === "data" ? "active" : ""}`}
            onClick={() => setActiveSection("data")}
          >
            <span className="nav-ico">💾</span>
            <div className="nav-text">
              <strong>Data & Backup</strong>
              <small>Export JSON & reset cache</small>
            </div>
          </button>

          <div className="settings-sidebar-divider" />

          {/* Quick Logout button in sidebar */}
          <button
            type="button"
            className="settings-sidebar-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <span className="nav-ico">↪</span>
            <div className="nav-text">
              <strong>Sign Out</strong>
              <small>End current active session</small>
            </div>
          </button>
        </aside>

        {/* Right: Active Section Content Card */}
        <div className="settings-main-card slow-popup animate-slow-pop" style={{ animationDelay: "120ms" }}>
          {/* -----------------------------------------
              SECTION 1: USER PROFILE
              ----------------------------------------- */}
          {activeSection === "profile" && (
            <div className="settings-section-panel animate-slow-pop">
              <div className="section-header-block">
                <div>
                  <h2>Personal Profile</h2>
                  <p>Update your personal information and urban gardener identity.</p>
                </div>
                <span className="section-badge-active">Active Profile</span>
              </div>

              <div className="profile-hero-card">
                <div className="profile-avatar-large">
                  <span>{userName ? userName.charAt(0).toUpperCase() : "G"}</span>
                  <div className="avatar-online-dot" />
                </div>
                <div className="profile-hero-meta">
                  <h3>{userName}</h3>
                  <p className="profile-email-tag">{userEmail}</p>
                  <div className="profile-chips-row">
                    <span className="profile-chip">🌿 {userRole}</span>
                    <span className="profile-chip">📍 Pincode {environment.pincode}</span>
                    <span className="profile-chip">🌱 {plantsCount} Plants in Garden</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="form-two-cols">
                  <div className="settings-input-group">
                    <label htmlFor="user-name">Full Name</label>
                    <input
                      id="user-name"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="settings-input-group">
                    <label htmlFor="user-email">Email Address</label>
                    <input
                      id="user-email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your.email@gardenguide.io"
                      required
                    />
                  </div>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="user-role">Gardening Experience Level</label>
                  <select
                    id="user-role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <option value="Beginner Gardener">Beginner Gardener (Learning the basics)</option>
                    <option value="Balcony Enthusiast">Balcony Enthusiast (Container & herb lover)</option>
                    <option value="Intermediate Green Thumb">Intermediate Green Thumb (Vegetables & flowers)</option>
                    <option value="Master Urban Farmer">Master Urban Farmer (Hydroponics & multi-tier)</option>
                  </select>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="user-bio">Gardener Bio & Interests</label>
                  <textarea
                    id="user-bio"
                    rows={3}
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    placeholder="Tell us what you love to grow..."
                  />
                </div>

                <div className="form-actions-footer">
                  <button type="submit" className="settings-primary-btn slow-pop-btn">
                    Save Profile Changes ✓
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* -----------------------------------------
              SECTION 2: SAVED ENVIRONMENT
              ----------------------------------------- */}
          {activeSection === "environment" && (
            <div className="settings-section-panel animate-slow-pop">
              <div className="section-header-block">
                <div>
                  <h2>Saved Environment Details</h2>
                  <p>Your calibrated garden microclimate and space settings saved in local storage.</p>
                </div>
                <button
                  type="button"
                  className="shortcut-nav-btn slow-pop-btn"
                  onClick={() => {
                    if (onPageChange) onPageChange("recommendations");
                  }}
                >
                  Open in Smart Recommendations ↗
                </button>
              </div>

              <div className="env-summary-banner">
                <div className="env-banner-icon">⛅</div>
                <div className="env-banner-text">
                  <strong>Microclimate Calibrated: Pincode {environment.pincode || "500081"}</strong>
                  <p>
                    {environment.location} setup • {environment.space} Space • {environment.sunlight} • {environment.climate} climate.
                  </p>
                </div>
              </div>

              {/* Environment Details Grid */}
              <div className="env-details-grid">
                <div className="env-detail-item">
                  <span className="env-item-ico">📍</span>
                  <div className="env-item-text">
                    <small>Location Pincode</small>
                    <strong>{environment.pincode || "500081"}</strong>
                    <span className="env-item-sub">Indian Region Code</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">🏡</span>
                  <div className="env-item-text">
                    <small>Garden Location</small>
                    <strong>{environment.location}</strong>
                    <span className="env-item-sub">Outdoor or indoor space</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">📐</span>
                  <div className="env-item-text">
                    <small>Growing Space</small>
                    <strong>{environment.space} Space</strong>
                    <span className="env-item-sub">Pot capacity & area</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">☀️</span>
                  <div className="env-item-text">
                    <small>Sunlight Exposure</small>
                    <strong>{environment.sunlight}</strong>
                    <span className="env-item-sub">Natural light intensity</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">🌡️</span>
                  <div className="env-item-text">
                    <small>Temperature Range</small>
                    <strong>{environment.temperature}</strong>
                    <span className="env-item-sub">Average growing range</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">🌿</span>
                  <div className="env-item-text">
                    <small>Climate Type</small>
                    <strong>{environment.climate}</strong>
                    <span className="env-item-sub">Microclimate zone</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">💧</span>
                  <div className="env-item-text">
                    <small>Humidity Level</small>
                    <strong>{environment.humidity} Humidity</strong>
                    <span className="env-item-sub">Air moisture level</span>
                  </div>
                </div>

                <div className="env-detail-item">
                  <span className="env-item-ico">🪴</span>
                  <div className="env-item-text">
                    <small>Growing Medium</small>
                    <strong>{environment.medium}</strong>
                    <span className="env-item-sub">Substrate type</span>
                  </div>
                </div>
              </div>

              {/* Quick Adjustment Selectors */}
              <div className="quick-adjust-card">
                <h3>Quick Environment Adjustments</h3>
                <p>Modify key settings right here without switching pages.</p>

                <div className="quick-adjust-row">
                  <div className="settings-input-group">
                    <label htmlFor="quick-sunlight">Sunlight Hours</label>
                    <select
                      id="quick-sunlight"
                      value={environment.sunlight}
                      onChange={(e) => handleUpdateEnvironment("sunlight", e.target.value)}
                    >
                      <option value="Low Light">Low Light (0–2 hrs)</option>
                      <option value="Medium Light">Medium Light (3–5 hrs)</option>
                      <option value="High Light">High Light (6+ hrs)</option>
                      <option value="Full Sun">Full Sun (6–8+ hrs direct sun)</option>
                    </select>
                  </div>

                  <div className="settings-input-group">
                    <label htmlFor="quick-medium">Growing Medium</label>
                    <select
                      id="quick-medium"
                      value={environment.medium}
                      onChange={(e) => handleUpdateEnvironment("medium", e.target.value)}
                    >
                      <option value="Soil">Garden Soil</option>
                      <option value="Potting Mix">Potting Mix</option>
                      <option value="Cocopeat">Cocopeat / Coir</option>
                      <option value="Hydroponics">Hydroponics / Water</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------
              SECTION 3: NOTIFICATIONS & REMINDERS
              ----------------------------------------- */}
          {activeSection === "notifications" && (
            <div className="settings-section-panel animate-slow-pop">
              <div className="section-header-block">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Configure automated care reminders, weather updates, and plant disease alerts.</p>
                </div>
              </div>

                <div className="toggles-list">
                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-ico">💧</span>
                    <div>
                      <strong>Daily Morning Watering Alert</strong>
                      <small>Receive a notification at 7:30 AM with moisture check reminders.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-morning-watering">
                    <input
                      id="switch-morning-watering"
                      type="checkbox"
                      checked={notifications.morningWatering}
                      onChange={() => handleToggleNotification("morningWatering")}
                    />
                    <span className="slider-round" />
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-ico">⚠️</span>
                    <div>
                      <strong>Extreme Weather & Heatwave Warnings</strong>
                      <small>Alerts for sudden temperature spikes, heavy rainfall, or strong wind.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-weather-alerts">
                    <input
                      id="switch-weather-alerts"
                      type="checkbox"
                      checked={notifications.weatherAlerts}
                      onChange={() => handleToggleNotification("weatherAlerts")}
                    />
                    <span className="slider-round" />
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-ico">🔍</span>
                    <div>
                      <strong>Pest & Fungal Disease Alerts</strong>
                      <small>Periodic reminders to inspect leaf undersides during humid seasons.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-disease-warnings">
                    <input
                      id="switch-disease-warnings"
                      type="checkbox"
                      checked={notifications.diseaseWarnings}
                      onChange={() => handleToggleNotification("diseaseWarnings")}
                    />
                    <span className="slider-round" />
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-ico">✦</span>
                    <div>
                      <strong>New AI Plant Recommendation Suggestions</strong>
                      <small>Notifications when new seasonal plants match your microclimate.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-ai-recommendations">
                    <input
                      id="switch-ai-recommendations"
                      type="checkbox"
                      checked={notifications.aiRecommendations}
                      onChange={() => handleToggleNotification("aiRecommendations")}
                    />
                    <span className="slider-round" />
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-ico">📊</span>
                    <div>
                      <strong>Weekly Garden Health Digest</strong>
                      <small>Receive a weekly progress summary of thriving plants and completed tasks.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-weekly-summary">
                    <input
                      id="switch-weekly-summary"
                      type="checkbox"
                      checked={notifications.weeklySummary}
                      onChange={() => handleToggleNotification("weeklySummary")}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------
              SECTION 4: UNITS & DISPLAY PREFERENCES
              ----------------------------------------- */}
          {activeSection === "preferences" && (
            <div className="settings-section-panel animate-slow-pop">
              <div className="section-header-block">
                <div>
                  <h2>Units & Garden Measurements</h2>
                  <p>Choose your preferred temperature scales and measurement conventions.</p>
                </div>
              </div>

              <div className="preferences-form">
                <div className="settings-input-group">
                  <label htmlFor="temp-unit">Temperature Scale</label>
                  <select
                    id="temp-unit"
                    value={preferences.tempUnit}
                    onChange={(e) => handleUpdatePreference("tempUnit", e.target.value)}
                  >
                    <option value="Celsius (°C)">Celsius (°C) — Standard International</option>
                    <option value="Fahrenheit (°F)">Fahrenheit (°F)</option>
                  </select>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="measure-unit">Measurement System</label>
                  <select
                    id="measure-unit"
                    value={preferences.measurementUnit}
                    onChange={(e) => handleUpdatePreference("measurementUnit", e.target.value)}
                  >
                    <option value="Metric (cm / m)">Metric (cm / meters, liters)</option>
                    <option value="Imperial (inches / ft)">Imperial (inches / feet, gallons)</option>
                  </select>
                </div>

                <div className="toggle-item-row" style={{ marginTop: "10px" }}>
                  <div className="toggle-info">
                    <span className="toggle-ico">💧</span>
                    <div>
                      <strong>Auto-Log Watering on Click</strong>
                      <small>Automatically sets plant moisture to 90% and updates last watered time.</small>
                    </div>
                  </div>
                  <label className="switch-toggle" htmlFor="switch-auto-water-logging">
                    <input
                      id="switch-auto-water-logging"
                      type="checkbox"
                      checked={preferences.autoWaterLogging}
                      onChange={() =>
                        handleUpdatePreference("autoWaterLogging", !preferences.autoWaterLogging)
                      }
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------
              SECTION 5: DATA, BACKUP & RESET
              ----------------------------------------- */}
          {activeSection === "data" && (
            <div className="settings-section-panel animate-slow-pop">
              <div className="section-header-block">
                <div>
                  <h2>Garden Data & Storage Management</h2>
                  <p>Export your plants and settings, restore botanical catalogs, or manage storage cache.</p>
                </div>
              </div>

              {/* Data Overview Cards */}
              <div className="data-stats-row">
                <div className="data-stat-card">
                  <span className="data-stat-ico">🌿</span>
                  <div>
                    <strong>{plantsCount} Plants</strong>
                    <small>Stored in My Garden</small>
                  </div>
                </div>

                <div className="data-stat-card">
                  <span className="data-stat-ico">⛅</span>
                  <div>
                    <strong>{environment.location}</strong>
                    <small>Active Environment</small>
                  </div>
                </div>

                <div className="data-stat-card">
                  <span className="data-stat-ico">🔒</span>
                  <div>
                    <strong>Offline Secure</strong>
                    <small>Browser LocalStorage</small>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="data-actions-list">
                <div className="data-action-row">
                  <div>
                    <strong>Export Garden Backup (JSON)</strong>
                    <p>Download a full backup of all your saved plants, care schedules, and microclimate profile.</p>
                  </div>
                  <button
                    type="button"
                    className="data-btn export slow-pop-btn"
                    onClick={handleExportData}
                  >
                    📥 Download Backup
                  </button>
                </div>

                <div className="data-action-row">
                  <div>
                    <strong>Restore Default Plant Catalog</strong>
                    <p>Replenish the garden with the 6 verified starting plants (Tomato, Mint, Rose, Tulsi, Aloe, Curry Leaf).</p>
                  </div>
                  <button
                    type="button"
                    className="data-btn restore slow-pop-btn"
                    onClick={handleRestoreDefaults}
                  >
                    🌿 Restore Defaults
                  </button>
                </div>

                <div className="data-action-row danger-zone">
                  <div>
                    <strong className="danger-text">Clear Garden Plants Collection</strong>
                    <p>Removes all plants from your garden collection. Your environment settings and account will be preserved.</p>
                  </div>
                  <button
                    type="button"
                    className="data-btn danger"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    🗑️ Clear Plants
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Security & Signout Footer */}
          <div className="settings-account-footer">
            <div className="account-footer-left">
              <span className="footer-avatar">👤</span>
              <div>
                <strong>Signed in as {userName}</strong>
                <small>{userEmail} • Garden Guide v2.4.0</small>
              </div>
            </div>

            <button
              type="button"
              className="logout-action-btn slow-pop-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <span>↪</span>
              <strong>Sign Out</strong>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          CONFIRMATION MODALS
          ========================================= */}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="settings-modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div
            className="settings-modal-dialog slow-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-danger-header">
              <span className="danger-icon">⚠️</span>
              <h3>Clear Garden Plants?</h3>
            </div>
            <p className="modal-confirm-text">
              Are you sure you want to remove all plants from your garden? This will empty your "My Garden" view. You can restore default plants or add new ones at any time.
            </p>
            <div className="modal-actions-group">
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-danger-btn"
                onClick={handleResetGarden}
              >
                Yes, Clear Plants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="settings-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div
            className="settings-modal-dialog slow-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-info-header">
              <span className="info-icon">🚪</span>
              <h3>Sign Out of Garden Guide?</h3>
            </div>
            <p className="modal-confirm-text">
              You are about to sign out from your session ({userEmail}). Your saved plants and environment configuration will remain safe on this browser.
            </p>
            <div className="modal-actions-group">
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Stay Signed In
              </button>
              <button
                type="button"
                className="modal-confirm-btn"
                onClick={handleConfirmLogout}
              >
                Sign Out Now ↪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMsg && (
        <div className="settings-floating-toast slow-popup">
          <span>{toastMsg}</span>
        </div>
      )}
    </main>
  );
}

export default Settings;

