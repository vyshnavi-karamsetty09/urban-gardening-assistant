import { useEffect, useRef, useState } from "react";
import PageHeaderBanner from "../components/PageHeaderBanner";
import {
  EMPTY_ENVIRONMENT,
  STORAGE_KEYS,
  getSavedPlants,
  getSavedTasks,
  readStorage,
  removeStorage,
  writeStorage,
} from "../utils";
import {
  authApi,
  environmentApi,
  gardenApi,
  taskApi,
  getAuthToken,
  setAuthToken,
} from "../api";
import "./Settings.css";

const DEFAULT_NOTIFICATIONS = {
  morningWatering: true,
  weatherAlerts: true,
  diseaseWarnings: true,
  aiRecommendations: true,
};

const DEFAULT_PREFERENCES = {
  tempUnit: "Celsius (°C)",
  measurementUnit: "Metric (cm / m)",
  autoWaterLogging: true,
};

function SettingsNavIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  const icons = {
    profile: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c.9-3.2 3.1-5 6.5-5s5.6 1.8 6.5 5" /></>,
    environment: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    preferences: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
    data: <><ellipse cx="12" cy="5" rx="7" ry="2.5" /><path d="M5 5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5M5 11v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /></>,
    signout: <><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /><path d="m14 8 4 4-4 4M9 12h9" /></>,
  };
  return <svg {...common}>{icons[name] || null}</svg>;
}

function Settings({ user: userProp = null, onUserUpdate, onPageChange, onLogout, theme = "light", onToggleTheme }) {
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(() => userProp || readStorage(STORAGE_KEYS.session, {}));
  const [userName, setUserName] = useState(() => (userProp || readStorage(STORAGE_KEYS.session, {}))?.name || "");
  const [userEmail, setUserEmail] = useState(() => (userProp || readStorage(STORAGE_KEYS.session, {}))?.email || "");
  const [userPhone, setUserPhone] = useState(() => (userProp || readStorage(STORAGE_KEYS.session, {}))?.phone || "");
  const [userBio, setUserBio] = useState(() => (userProp || readStorage(STORAGE_KEYS.session, {}))?.bio || "");
  const [environment, setEnvironment] = useState(() => readStorage(STORAGE_KEYS.environment, EMPTY_ENVIRONMENT));
  const [notifications, setNotifications] = useState(() => ({
    ...DEFAULT_NOTIFICATIONS,
    ...readStorage(STORAGE_KEYS.notificationPrefs, {}),
  }));
  const [gardenUpdates, setGardenUpdates] = useState(() => Boolean(readStorage(STORAGE_KEYS.user, {})?.gardenUpdates));
  const [preferences, setPreferences] = useState(() => ({
    ...DEFAULT_PREFERENCES,
    ...readStorage(STORAGE_KEYS.preferences, {}),
  }));
  const [plantsCount, setPlantsCount] = useState(() => getSavedPlants().length);
  const [tasksCount, setTasksCount] = useState(() => getSavedTasks().length);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEnvironment, setSavingEnvironment] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const settingsMutationRef = useRef(0);

  const showToast = (message) => {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(""), 2600);
  };

  const notifyWorkspaceUpdate = (detail = {}) => {
    window.dispatchEvent(new CustomEvent("garden-guide:workspace-updated", { detail }));
  };

  useEffect(() => {
    if (!userProp) return;
    setUser(userProp);
    setUserName(userProp.name || "");
    setUserEmail(userProp.email || "");
    setUserPhone(userProp.phone || "");
    setUserBio(userProp.bio || "");
    if (userProp.notificationPreferences) {
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...userProp.notificationPreferences });
    }
    if (userProp.gardenUpdates !== undefined) setGardenUpdates(Boolean(userProp.gardenUpdates));
    if (userProp.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...userProp.preferences });
    }
  }, [userProp]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!getAuthToken()) return;
      const loadRevision = settingsMutationRef.current;

      const [profileSettled, environmentSettled, gardenSettled, tasksSettled] = await Promise.allSettled([
        authApi.me(),
        environmentApi.get(),
        gardenApi.list(),
        taskApi.list(),
      ]);

      if (cancelled) return;

      const profileResult = profileSettled.status === "fulfilled" ? profileSettled.value : null;
      const environmentResult = environmentSettled.status === "fulfilled" ? environmentSettled.value : null;
      const gardenResult = gardenSettled.status === "fulfilled" ? gardenSettled.value : null;
      const tasksResult = tasksSettled.status === "fulfilled" ? tasksSettled.value : null;

      if (profileResult?.user && settingsMutationRef.current === loadRevision) {
        const remoteUser = profileResult.user;
        setUser(remoteUser);
        setUserName(remoteUser.name || "");
        setUserEmail(remoteUser.email || "");
        setUserPhone(remoteUser.phone || "");
        setUserBio(remoteUser.bio || "");
        const remoteNotifications = {
          ...DEFAULT_NOTIFICATIONS,
          ...(remoteUser.notificationPreferences || {}),
        };
        const remotePreferences = {
          ...DEFAULT_PREFERENCES,
          ...(remoteUser.preferences || {}),
        };
        setNotifications(remoteNotifications);
        setGardenUpdates(Boolean(remoteUser.gardenUpdates));
        setPreferences(remotePreferences);
        writeStorage(STORAGE_KEYS.session, {
          ...readStorage(STORAGE_KEYS.session, {}),
          ...remoteUser,
          isLoggedIn: true,
          accessToken: getAuthToken(),
        });
        writeStorage(STORAGE_KEYS.notificationPrefs, remoteNotifications);
        writeStorage(STORAGE_KEYS.preferences, remotePreferences);
        writeStorage(STORAGE_KEYS.user, remoteUser);
      }

      if (environmentResult?.environment && settingsMutationRef.current === loadRevision) {
        const nextEnvironment = environmentResult.environment.configured === true
          ? { ...EMPTY_ENVIRONMENT, ...environmentResult.environment, configured: true }
          : { ...EMPTY_ENVIRONMENT };
        setEnvironment(nextEnvironment);
        writeStorage(STORAGE_KEYS.environment, nextEnvironment);
      }

      if (Array.isArray(gardenResult?.plants)) setPlantsCount(gardenResult.plants.length);
      if (Array.isArray(tasksResult?.tasks)) setTasksCount(tasksResult.tasks.length);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const fullName = userName.trim().replace(/\s+/g, " ");
    const nameParts = fullName.split(" ");
    const payload = {
      name: fullName,
      firstName: nameParts.shift() || fullName,
      lastName: nameParts.join(" "),
      email: userEmail.trim(),
      phone: userPhone.trim(),
      bio: userBio.trim(),
    };
    if (!payload.name || !payload.email) {
      showToast("Enter your name and email.");
      return;
    }
    if (!getAuthToken()) {
      showToast("Your session has expired. Please sign in again.");
      return;
    }

    settingsMutationRef.current += 1;
    setSavingProfile(true);
    try {
      const result = await authApi.updateProfile(payload);
      if (!result?.user) throw new Error("The profile update did not return the saved account.");
      if (result?.token) setAuthToken(result.token);

      // The PUT response is serialized from the document MongoDB just saved.
      // Treat that server response as authoritative instead of immediately
      // performing another request that can race and reintroduce stale data.
      const confirmedUser = result.user;
      if (String(confirmedUser.name || "").trim() !== fullName) {
        throw new Error("The profile save was not persisted by the server. Please try again.");
      }

      const next = {
        ...readStorage(STORAGE_KEYS.session, {}),
        ...confirmedUser,
        isLoggedIn: true,
        accessToken: getAuthToken(),
      };
      writeStorage(STORAGE_KEYS.session, next);
      writeStorage(STORAGE_KEYS.user, confirmedUser);
      setUser(next);
      onUserUpdate?.(confirmedUser, getAuthToken());
      setUserName(confirmedUser.name || payload.name);
      setUserEmail(confirmedUser.email || payload.email);
      setUserPhone(confirmedUser.phone || payload.phone);
      setUserBio(confirmedUser.bio || payload.bio);
      notifyWorkspaceUpdate({ type: "profile", user: next });
      showToast("Profile saved successfully.");
    } catch (error) {
      showToast(error?.message || "Could not save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEnvironment = async (event) => {
    event.preventDefault();
    const required = [
      ["pincode", "Pincode"],
      ["location", "Garden location"],
      ["space", "Growing space"],
      ["sunlight", "Sunlight"],
      ["medium", "Growing medium"],
      ["watering", "Watering availability"],
      ["soilMoisture", "Soil moisture"],
      ["experience", "Gardening experience"],
    ];
    const missing = required.filter(([field]) => !String(environment[field] || "").trim()).map(([, label]) => label);
    if (!/^\d{6}$/.test(String(environment.pincode || ""))) {
      showToast("Enter a valid 6-digit pincode.");
      return;
    }
    if (missing.length) {
      showToast(`Complete: ${missing.join(", ")}`);
      return;
    }
    if (!getAuthToken()) {
      showToast("Your session has expired. Please sign in again.");
      return;
    }

    settingsMutationRef.current += 1;
    setSavingEnvironment(true);
    const payload = { ...EMPTY_ENVIRONMENT, ...environment, configured: true };
    try {
      const result = await environmentApi.save(payload);
      if (!result?.environment) throw new Error("The environment update did not return the saved setup.");

      const finalEnvironment = { ...EMPTY_ENVIRONMENT, ...result.environment, configured: true };
      const environmentMatches = [
        "pincode", "location", "space", "sunlight", "medium", "watering", "soilMoisture", "experience",
      ].every((field) => String(finalEnvironment[field] || "").trim() === String(payload[field] || "").trim());
      if (!environmentMatches) {
        throw new Error("The environment save was not persisted by the server. Please try again.");
      }

      setEnvironment(finalEnvironment);
      writeStorage(STORAGE_KEYS.environment, finalEnvironment);
      notifyWorkspaceUpdate({ type: "environment", environment: finalEnvironment });
      showToast("Garden environment saved successfully.");
    } catch (error) {
      showToast(error?.message || "Could not save the garden environment.");
    } finally {
      setSavingEnvironment(false);
    }
  };

  const updateNotification = (key) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const saveNotifications = async () => {
    if (!getAuthToken()) {
      showToast("Your session has expired. Please sign in again.");
      return;
    }
    settingsMutationRef.current += 1;
    setSavingNotifications(true);
    try {
      const result = await authApi.updateProfile({ notificationPreferences: notifications, gardenUpdates });
      if (!result?.user) throw new Error("The notification preferences were not confirmed by the server.");
      if (result?.token) setAuthToken(result.token);

      const nextUser = result.user;
      const savedNotifications = { ...DEFAULT_NOTIFICATIONS, ...(nextUser.notificationPreferences || {}) };
      const expectedKeys = Object.keys(DEFAULT_NOTIFICATIONS);
      const verifiedAll = expectedKeys.every((key) => Boolean(savedNotifications[key]) === Boolean(notifications[key]));
      if (!verifiedAll || Boolean(nextUser.gardenUpdates) !== Boolean(gardenUpdates)) {
        throw new Error("The notification preferences were not fully persisted. Please try again.");
      }

      const next = { ...readStorage(STORAGE_KEYS.session, {}), ...nextUser, isLoggedIn: true, accessToken: getAuthToken() };
      writeStorage(STORAGE_KEYS.notificationPrefs, savedNotifications);
      writeStorage(STORAGE_KEYS.user, nextUser);
      writeStorage(STORAGE_KEYS.session, next);
      setUser(next);
      onUserUpdate?.(nextUser, getAuthToken());
      setGardenUpdates(Boolean(nextUser.gardenUpdates));
      setNotifications(savedNotifications);
      notifyWorkspaceUpdate({ type: "notifications", notifications: savedNotifications, user: next });
      showToast("Notification preferences saved.");
    } catch (error) {
      showToast(error?.message || "Could not save notification preferences.");
    } finally {
      setSavingNotifications(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const savePreferences = async () => {
    if (!getAuthToken()) {
      showToast("Your session has expired. Please sign in again.");
      return;
    }
    settingsMutationRef.current += 1;
    setSavingPreferences(true);
    const nextPreferences = { ...preferences, theme };
    try {
      const result = await authApi.updateProfile({ preferences: nextPreferences });
      if (!result?.user) throw new Error("The preferences update was not confirmed by the server.");
      if (result?.token) setAuthToken(result.token);

      const nextUser = result.user;
      const persistedPreferences = { ...DEFAULT_PREFERENCES, ...(nextUser.preferences || {}) };
      const preferenceKeys = Object.keys(nextPreferences);
      const verifiedAll = preferenceKeys.every((key) => String(persistedPreferences[key]) === String(nextPreferences[key]));
      if (!verifiedAll) throw new Error("The preferences were not fully persisted. Please try again.");
      const next = { ...readStorage(STORAGE_KEYS.session, {}), ...nextUser, isLoggedIn: true, accessToken: getAuthToken() };
      writeStorage(STORAGE_KEYS.preferences, persistedPreferences);
      writeStorage(STORAGE_KEYS.user, nextUser);
      writeStorage(STORAGE_KEYS.session, next);
      setUser(next);
      onUserUpdate?.(nextUser, getAuthToken());
      setPreferences(persistedPreferences);
      notifyWorkspaceUpdate({ type: "preferences", preferences: persistedPreferences, user: next });
      showToast("Preferences saved.");
    } catch (error) {
      showToast(error?.message || "Could not save preferences.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      environment,
      plants: getSavedPlants(),
      tasks: getSavedTasks(),
      notifications,
      preferences,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `garden-guide-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded.");
  };

  const clearGarden = async () => {
    try {
      if (getAuthToken()) {
        // Do not clear the local cache until both account-scoped API deletes succeed.
        await gardenApi.clear();
        await taskApi.clear();
      }

      writeStorage(STORAGE_KEYS.plants, []);
      removeStorage(STORAGE_KEYS.tasks);
      setPlantsCount(0);
      setTasksCount(0);
      setConfirmClear(false);
      notifyWorkspaceUpdate({ type: "garden-cleared" });
      showToast("Your garden data was cleared.");
    } catch (error) {
      showToast(error?.message || "Could not clear your garden data. Nothing was removed locally.");
    }
  };

  const navItems = [
    ["profile", "Profile"],
    ["environment", "Environment"],
    ["notifications", "Notifications"],
    ["preferences", "Preferences"],
    ["data", "Garden data"],
  ];

  return (
    <main className="settings-page settings2-page">
      <PageHeaderBanner
        showBackButton
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="ACCOUNT & APP CONTROLS"
        title="Settings"
        titleAccent="⚙️"
        subtitle="Manage your profile, garden setup, alerts, appearance, and local backup."
        badgeIcon="🌿"
        badgeTitle={`${plantsCount} plants`}
        badgeSubtitle={`${tasksCount} saved tasks`}
      />

      <div className="settings2-shell">
        <aside className="settings2-nav" aria-label="Settings sections">
          {navItems.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`settings2-nav-item ${activeSection === id ? "active" : ""}`}
              aria-current={activeSection === id ? "page" : undefined}
              onClick={() => setActiveSection(id)}
            >
              <span className="settings2-nav-icon"><SettingsNavIcon name={id} /></span>
              <strong>{label}</strong>
            </button>
          ))}
          <button type="button" className="settings2-nav-item settings2-signout" onClick={() => onLogout?.()}>
            <span className="settings2-nav-icon"><SettingsNavIcon name="signout" /></span>
            <strong>Sign out</strong>
          </button>
        </aside>

        <section className="settings2-content">
          {activeSection === "profile" && (
            <div className="settings2-panel">
              <div className="settings2-heading"><div><span className="settings2-kicker">PROFILE</span><h2>Account details</h2><p>Update the information shown across your account.</p></div></div>
              <form onSubmit={saveProfile} className="settings2-form">
                <div className="settings2-grid-2">
                  <label>Full name<input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Your name" required /></label>
                  <label>Email<input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="you@example.com" required /></label>
                  <label>Phone<input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="Optional phone number" maxLength={20} /></label>
                </div>
                <label>About you<textarea value={userBio} onChange={(e) => setUserBio(e.target.value)} placeholder="A short note about your garden." rows={4} maxLength={300} /></label>
                <div className="settings2-actions"><button className="settings2-primary" type="submit" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</button></div>
              </form>
            </div>
          )}

          {activeSection === "environment" && (
            <div className="settings2-panel">
              <div className="settings2-heading">
                <div><span className="settings2-kicker">GARDEN</span><h2>Environment</h2><p>Save the real conditions of your garden. These values are shared with recommendations and the Garden AI.</p></div>
              </div>
              <form className="settings2-environment-form" onSubmit={saveEnvironment}>
                <div className="settings2-grid-2">
                  <label>Pincode<input value={environment.pincode || ""} inputMode="numeric" maxLength={6} onChange={(e) => setEnvironment((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} placeholder="6-digit pincode" required /></label>
                  <label>Garden location<select value={environment.location || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, location: e.target.value }))} required><option value="">Select location</option><option>Balcony</option><option>Terrace</option><option>Indoor</option><option>Garden / Yard</option></select></label>
                  <label>Growing space<select value={environment.space || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, space: e.target.value }))} required><option value="">Select space</option><option>Small</option><option>Medium</option><option>Large</option></select></label>
                  <label>Sunlight<select value={environment.sunlight || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, sunlight: e.target.value }))} required><option value="">Select sunlight</option><option>Low Light</option><option>Partial Sun</option><option>Full Sun</option><option>Bright Indirect</option></select></label>
                  <label>Growing medium<input value={environment.medium || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, medium: e.target.value, soil: e.target.value }))} placeholder="e.g. rich loamy mix" required /></label>
                  <label>Watering availability<select value={environment.watering || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, watering: e.target.value }))} required><option value="">Select watering</option><option>Daily</option><option>Every 2–3 days</option><option>2–3 times/week</option><option>Weekly</option></select></label>
                  <label>Soil moisture<select value={environment.soilMoisture || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, soilMoisture: e.target.value }))} required><option value="">Select moisture</option><option>Dry</option><option>Moderate</option><option>Moist</option><option>Consistently moist</option></select></label>
                  <label>Gardening experience<select value={environment.experience || ""} onChange={(e) => setEnvironment((prev) => ({ ...prev, experience: e.target.value }))} required><option value="">Select experience</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
                </div>

                <div className="settings2-regional-readings">
                  <div><span>Regional temperature</span><strong>{environment.temperature || "Not configured"}</strong></div>
                  <div><span>Regional climate</span><strong>{environment.climate || "Not configured"}</strong></div>
                  <div><span>Regional humidity</span><strong>{environment.humidity || "Not configured"}</strong></div>
                  <p>Regional readings are optional enrichment. They never replace your own garden settings.</p>
                </div>

                <div className="settings2-actions"><button className="settings2-primary" type="submit" disabled={savingEnvironment}>{savingEnvironment ? "Saving…" : "Save environment"}</button><button className="settings2-secondary" type="button" onClick={() => onPageChange?.("environment")}>Open detailed setup</button></div>
              </form>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="settings2-panel">
              <div className="settings2-heading"><div><span className="settings2-kicker">ALERTS</span><h2>Notifications</h2><p>Turn local garden alerts on or off.</p></div></div>
              <div className="settings2-option-list">
                {[["morningWatering", "Watering reminders", "Care task alerts"], ["weatherAlerts", "Weather alerts", "Growing-condition notices"], ["diseaseWarnings", "Disease warnings", "Plant health alerts"], ["aiRecommendations", "Recommendations", "Smart match updates"]].map(([key, label, desc]) => (
                  <label className="settings2-toggle" key={key}><span><strong>{label}</strong><small>{desc}</small></span><input type="checkbox" checked={Boolean(notifications[key])} onChange={() => updateNotification(key)} /><i /></label>
                ))}
              </div>
              <div className="settings2-option-list settings2-option-list-secondary">
                <label className="settings2-toggle">
                  <span><strong>Garden updates</strong><small>Allow useful garden guidance and account updates.</small></span>
                  <input type="checkbox" checked={gardenUpdates} onChange={() => setGardenUpdates((value) => !value)} />
                  <i />
                </label>
              </div>
              <div className="settings2-actions"><button className="settings2-primary" type="button" onClick={saveNotifications} disabled={savingNotifications}>{savingNotifications ? "Saving…" : "Save notification preferences"}</button></div>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="settings2-panel">
              <div className="settings2-heading"><div><span className="settings2-kicker">DISPLAY</span><h2>Preferences</h2><p>Keep the interface and measurements comfortable for you.</p></div></div>
              <div className="settings2-pref-grid">
                <div className="settings2-pref-card"><div><strong>Theme</strong><small>{theme === "dark" ? "Dark mode" : "Light mode"}</small></div><div className="settings2-theme-actions"><button className={theme === "light" ? "active" : ""} type="button" onClick={() => theme !== "light" && onToggleTheme?.()}>Light</button><button className={theme === "dark" ? "active" : ""} type="button" onClick={() => theme !== "dark" && onToggleTheme?.()}>Dark</button></div></div>
                <label className="settings2-pref-card"><span><strong>Temperature</strong></span><select value={preferences.tempUnit} onChange={(e) => updatePreference("tempUnit", e.target.value)}><option>Celsius (°C)</option><option>Fahrenheit (°F)</option></select></label>
                <label className="settings2-pref-card"><span><strong>Measurements</strong></span><select value={preferences.measurementUnit} onChange={(e) => updatePreference("measurementUnit", e.target.value)}><option>Metric (cm / m)</option><option>Imperial (in / ft)</option></select></label>
                <label className="settings2-toggle settings2-pref-card"><span><strong>Auto-log watering</strong><small>Record quick watering actions locally.</small></span><input type="checkbox" checked={Boolean(preferences.autoWaterLogging)} onChange={() => updatePreference("autoWaterLogging", !preferences.autoWaterLogging)} /><i /></label>
              </div>
              <div className="settings2-actions"><button className="settings2-primary" type="button" onClick={savePreferences} disabled={savingPreferences}>{savingPreferences ? "Saving…" : "Save preferences"}</button></div>
            </div>
          )}

          {activeSection === "data" && (
            <div className="settings2-panel">
              <div className="settings2-heading"><div><span className="settings2-kicker">DATA</span><h2>Garden data</h2><p>Back up or remove data belonging to this account.</p></div></div>
              <div className="settings2-stat-row"><div><strong>{plantsCount}</strong><span>Plants</span></div><div><strong>{tasksCount}</strong><span>Saved tasks</span></div><div><strong>{environment.configured ? "Ready" : "Setup needed"}</strong><span>Environment</span></div></div>
              <div className="settings2-data-actions">
                <div><strong>Export backup</strong><p>Save your current Garden Guide data as JSON.</p><button type="button" className="settings2-secondary" onClick={exportData}>Download backup</button></div>
                <div className="danger"><strong>Clear garden</strong><p>Removes this account's plants and saved tasks. Your account remains intact.</p><button type="button" className="settings2-danger" onClick={() => setConfirmClear(true)}>Clear garden</button></div>
              </div>
            </div>
          )}
        </section>
      </div>

      {confirmClear && (
        <div className="settings2-modal-backdrop" onClick={() => setConfirmClear(false)}>
          <div className="settings2-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Clear your garden?</h3>
            <p>This removes only your plants and saved care tasks.</p>
            <div className="settings2-modal-actions"><button type="button" className="settings2-secondary" onClick={() => setConfirmClear(false)}>Cancel</button><button type="button" className="settings2-danger" onClick={clearGarden}>Clear garden</button></div>
          </div>
        </div>
      )}
      {toastMsg && <div className="settings2-toast" role="status">{toastMsg}</div>}
    </main>
  );
}

export default Settings;
