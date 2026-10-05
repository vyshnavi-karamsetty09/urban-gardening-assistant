import { Fragment, useEffect, useState } from "react";
import Sidebar from "./components/sidebar";
import Topbar from "./components/Topbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyGarden from "./pages/MyGarden";
import PlantLibrary from "./pages/PlantLibrary";
import SmartRecommendations from "./pages/SmartRecommendations";
import CareScheduler from "./pages/CareScheduler";
import DiseaseDetection from "./pages/DiseaseDetection";
import GardenAssistant from "./pages/GardenAssistant";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Community from "./pages/Community";
import {
  STORAGE_KEYS,
  clearClientWorkspace,
  ensureWorkspaceForUser,
  readStorage,
  writeStorage,
} from "./utils";
import { authApi, getAuthToken, setAuthToken } from "./api";
import "./App.css";

const PRIVATE_PAGES = new Set([
  "dashboard",
  "environment",
  "recommendations",
  "mygarden",
  "library",
  "scheduler",
  "diseasedetection",
  "disease",
  "health",
  "assistant",
  "community",
  "settings",
  "admin",
]);

function readSession() {
  try {
    const session = readStorage(STORAGE_KEYS.session, null);

    if (!session) return null;

    return session?.isLoggedIn ? session : null;
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState(() => readSession());

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(readSession()?.isLoggedIn)
  );

  const [activePage, setActivePage] = useState(() => {
    const stored = readSession();
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get("page");

    if (!stored) {
      return pageParam && PRIVATE_PAGES.has(pageParam)
        ? "landing"
        : pageParam || "landing";
    }

    return pageParam === "login" || pageParam === "signup"
      ? "dashboard"
      : pageParam || stored.activePage || "dashboard";
  });

  const [pagePayload, setPagePayload] = useState(null);
  const [workspaceRevision, setWorkspaceRevision] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);

      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch {
      // fallback
    }

    return "light";
  });

  /*
   * Keep the URL synchronized with the current application page.
   */
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("page") !== activePage) {
      url.searchParams.set("page", activePage);

      window.history.replaceState(
        { page: activePage, payload: pagePayload },
        "",
        url
      );
    }
  }, [activePage, pagePayload]);

  /*
   * Persist the application theme.
   */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      // Theme is an app-level preference, so it survives logout/account changes.
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  /*
   * Handle global unauthorized events.
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthToken(null);
      clearClientWorkspace({ clearSession: true });

      setSession(null);
      setIsAuthenticated(false);
      setActivePage("landing");
      setPagePayload(null);

      const url = new URL(window.location.href);
      url.searchParams.set("page", "landing");

      window.history.replaceState(
        { page: "landing", payload: null },
        "",
        url
      );
    };

    window.addEventListener(
      "garden-guide:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "garden-guide:unauthorized",
        handleUnauthorized
      );
    };
  }, []);

  /*
   * Keep the App session synchronized with workspace changes
   * coming from Settings and other pages.
   */
  useEffect(() => {
    const handleWorkspaceUpdated = () => {
      setWorkspaceRevision((revision) => revision + 1);

      try {
        const next = readStorage(STORAGE_KEYS.session, null);

        if (next?.isLoggedIn) {
          setSession(next);
        }
      } catch {
        // Ignore workspace event/read failures.
      }
    };

    window.addEventListener(
      "garden-guide:workspace-updated",
      handleWorkspaceUpdated
    );

    return () => {
      window.removeEventListener(
        "garden-guide:workspace-updated",
        handleWorkspaceUpdated
      );
    };
  }, []);

  /*
   * Validate the current token and refresh the authenticated user
   * when the application starts.
   */
  useEffect(() => {
    const token = getAuthToken();

    if (!token) return;

    authApi
      .me()
      .then(({ user }) => {
        ensureWorkspaceForUser(user);

        const current = readSession() || {};

        const next = {
          ...current,
          ...user,
          isLoggedIn: true,
          accessToken: token,
        };

        writeStorage(STORAGE_KEYS.session, next);

        setSession(next);
        setIsAuthenticated(true);

        if (
          user?.preferences?.theme === "dark" ||
          user?.preferences?.theme === "light"
        ) {
          setTheme(user.preferences.theme);
        }
      })
      .catch((error) => {
        if (error?.status === 401) {
          setAuthToken(null);
          clearClientWorkspace({ clearSession: true });

          setSession(null);
          setIsAuthenticated(false);
          setActivePage("landing");
          setPagePayload(null);
        }

        // Keep the cached session when the API is temporarily unavailable.
      });
  }, []);

  /*
   * Handle browser Back and Forward navigation.
   */
  useEffect(() => {
    const handlePopState = (event) => {
      const urlParams = new URLSearchParams(window.location.search);

      const pageFromState = event.state?.page;
      const pageFromUrl = urlParams.get("page");

      const nextPage =
        pageFromState || pageFromUrl || "landing";

      if (PRIVATE_PAGES.has(nextPage) && !isAuthenticated) {
        setPagePayload(null);
        setActivePage("landing");

        const url = new URL(window.location.href);
        url.searchParams.set("page", "landing");

        window.history.replaceState(
          { page: "landing", payload: null },
          "",
          url
        );

        return;
      }

      if (
        (nextPage === "login" || nextPage === "signup") &&
        isAuthenticated
      ) {
        setPagePayload(null);
        setActivePage("dashboard");

        const url = new URL(window.location.href);
        url.searchParams.set("page", "dashboard");

        window.history.replaceState(
          { page: "dashboard", payload: null },
          "",
          url
        );

        return;
      }

      setPagePayload(event.state?.payload || null);
      setActivePage(nextPage);
      setIsMobileMenuOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isAuthenticated]);

  /*
   * Application navigation.
   */
  const handlePageChange = (
    page,
    payload = null,
    isReplace = false
  ) => {
    if (PRIVATE_PAGES.has(page) && !isAuthenticated) {
      setPagePayload(null);
      setActivePage("landing");

      const url = new URL(window.location.href);
      url.searchParams.set("page", "landing");

      window.history.replaceState(
        { page: "landing", payload: null },
        "",
        url
      );

      return;
    }

    setPagePayload(payload);
    setActivePage(page);
    setIsMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const url = new URL(window.location.href);
    url.searchParams.set("page", page);

    if (isReplace) {
      window.history.replaceState(
        { page, payload },
        "",
        url
      );
    } else {
      window.history.pushState(
        { page, payload },
        "",
        url
      );
    }

    if (isAuthenticated) {
      try {
        const current = readSession() || {};

        writeStorage(STORAGE_KEYS.session, {
          ...current,
          activePage: page,
        });
      } catch {
        // Ignore navigation persistence failures.
      }
    }
  };

  /*
   * CENTRAL USER UPDATE HANDLER
   *
   * This is the important Settings -> App -> Topbar connection.
   *
   * When Settings receives a confirmed user from MongoDB:
   * 1. Merge it into the current session.
   * 2. Save the new session to localStorage.
   * 3. Update App state.
   * 4. Keep authentication state alive.
   * 5. Synchronize the theme when applicable.
   * 6. Notify workspace listeners.
   */
  const handleUserUpdate = (updatedUser, tokenOverride = null) => {
    if (!updatedUser) return;

    const token = tokenOverride || getAuthToken();

    ensureWorkspaceForUser(updatedUser);

    const current = readSession() || {};

    const nextSession = {
      ...current,
      ...updatedUser,
      isLoggedIn: true,
      accessToken: token || current.accessToken,
      activePage:
        activePage ||
        current.activePage ||
        "dashboard",
    };

    writeStorage(STORAGE_KEYS.session, nextSession);

    setSession(nextSession);
    setIsAuthenticated(true);

    writeStorage(STORAGE_KEYS.session, nextSession);

setSession(nextSession);
setIsAuthenticated(true);

setWorkspaceRevision((revision) => revision + 1);

window.dispatchEvent(
  new CustomEvent("garden-guide:workspace-updated", {
    detail: {
      type: "account",
      user: nextSession,
    },
  })
);

    setWorkspaceRevision((revision) => revision + 1);

    window.dispatchEvent(
      new CustomEvent("garden-guide:workspace-updated", {
        detail: {
          type: "account",
          user: nextSession,
        },
      })
    );
  };

  /*
   * Handle successful login/register/demo login.
   */
  const handleAuthSuccess = ({ token, user }) => {
    setAuthToken(token);
    ensureWorkspaceForUser(user);

    const nextSession = {
      ...user,
      isLoggedIn: true,
      activePage: "dashboard",
      accessToken: token,
    };

    writeStorage(STORAGE_KEYS.session, nextSession);

    setSession(nextSession);
    setIsAuthenticated(true);

    if (
      user?.preferences?.theme === "dark" ||
      user?.preferences?.theme === "light"
    ) {
      setTheme(user.preferences.theme);
    }

    setActivePage("dashboard");
    setIsMobileMenuOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.set("page", "dashboard");

    window.history.replaceState(
      { page: "dashboard", payload: null },
      "",
      url
    );
  };

  const requestLogout = () => {
    setShowLogoutConfirm(true);
  };

  /*
   * Allow Escape to close logout confirmation.
   */
  useEffect(() => {
  const publicPage = ["landing", "login", "signup"].includes(activePage);

  // Public/authentication pages always use the light theme.
  // Authenticated Garden Guide pages use the user's selected theme.
  const appliedTheme = publicPage ? "light" : theme;

  document.documentElement.setAttribute("data-theme", appliedTheme);

  try {
    // Save the user's preference, not the temporary public-page theme.
    // This means selecting dark mode is not lost when the user logs out.
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // Ignore storage failures.
  }

  return () => {
    // No cleanup needed.
  };
}, [theme, activePage]);

  /*
   * Perform logout.
   */
  const performLogout = () => {
    setAuthToken(null);
    clearClientWorkspace({ clearSession: true });

    setSession(null);
    setIsAuthenticated(false);
    setShowLogoutConfirm(false);
    setActivePage("landing");
    setPagePayload(null);
    setIsMobileMenuOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.set("page", "landing");

    window.history.replaceState(
      { page: "landing", payload: null },
      "",
      url
    );
  };

  /*
   * Render the active page.
   */
  const renderPage = () => {
    /*
     * Settings is kept mounted across workspace revisions so a successful
     * save does not unnecessarily destroy/recreate its local form state.
     *
     * Other workspace pages use the revision to refresh their data after
     * Settings or another shared workspace update.
     */
    const pageKey =
      activePage === "settings"
        ? "settings"
        : `${activePage}-${workspaceRevision}`;

    let page;

    switch (activePage) {
      case "landing":
        page = (
          <Landing
            onNavigate={handlePageChange}
          />
        );
        break;

      case "login":
        page = (
          <Login
            onNavigate={handlePageChange}
            onLogin={handleAuthSuccess}
          />
        );
        break;

      case "signup":
        page = (
          <Signup
            onNavigate={handlePageChange}
            onLogin={handleAuthSuccess}
          />
        );
        break;

      case "dashboard":
        page = (
          <Dashboard
            onPageChange={handlePageChange}
          />
        );
        break;

      case "environment":
      case "recommendations":
        page = (
          <SmartRecommendations
            onPageChange={handlePageChange}
            initialTab={
              activePage === "environment"
                ? "environment"
                : "recommendations"
            }
          />
        );
        break;

      case "mygarden":
        page = (
          <MyGarden
            onPageChange={handlePageChange}
          />
        );
        break;

      case "library":
        page = (
          <PlantLibrary
            onPageChange={handlePageChange}
            initialPlantId={pagePayload?.plantId}
            initialPlant={pagePayload?.plant}
          />
        );
        break;

      case "diseasedetection":
      case "disease":
      case "health":
        page = (
          <DiseaseDetection
            onPageChange={handlePageChange}
            initialSymptom={pagePayload?.symptom || ""}
          />
        );
        break;

      case "scheduler":
        page = (
          <CareScheduler
            onPageChange={handlePageChange}
          />
        );
        break;

      case "assistant":
        page = (
          <GardenAssistant
            onPageChange={handlePageChange}
            userId={
              session?.id ||
              session?._id ||
              session?.email ||
              "guest"
            }
          />
        );
        break;

      case "community":
        page = (
          <Community
            onPageChange={handlePageChange}
          />
        );
        break;

      /*
       * SETTINGS
       *
       * The authenticated App session is passed down.
       * Settings reports confirmed changes back through onUserUpdate.
       */
      case "settings":
        page = (
          <Settings
            user={session}
            onUserUpdate={handleUserUpdate}
            onPageChange={handlePageChange}
            onLogout={requestLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        );
        break;

      case "admin":
        page = (
          <Admin
            onPageChange={handlePageChange}
          />
        );
        break;

      default:
        page = (
          <Landing
            onNavigate={handlePageChange}
          />
        );
        break;
    }

    return (
      <Fragment key={pageKey}>
        {page}
      </Fragment>
    );
  };

  const showSidebar =
    isAuthenticated &&
    !["landing", "login", "signup"].includes(activePage);

  return (
    <div className="app">
      {showSidebar && (
        <Sidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={requestLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() =>
            setIsMobileMenuOpen(false)
          }
          userRole={session?.role}
        />
      )}

      <main
        className={
          showSidebar
            ? "main-content"
            : "auth-or-landing-content"
        }
      >
        {showSidebar && (
          <Topbar
            activePage={activePage}
            user={session}
            onPageChange={handlePageChange}
            onLogout={requestLogout}
            onToggleSidebar={() =>
              setIsMobileMenuOpen((prev) => !prev)
            }
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}

        <div
          key={activePage}
          className="page-transition-container"
        >
          {renderPage()}
        </div>
      </main>

      {showSidebar && activePage !== "assistant" && (
        <button
          type="button"
          className="floating-ai-assistant"
          onClick={() =>
            handlePageChange("assistant")
          }
          aria-label="Open Garden Guide AI Assistant"
          title="Open Garden Guide AI Assistant"
        >
          <span aria-hidden="true">🤖</span>
        </button>
      )}

      {showSidebar && (
        <MobileBottomNav
          activePage={activePage}
          onPageChange={handlePageChange}
        />
      )}

      {showLogoutConfirm && (
        <div
          className="logout-modal-backdrop"
          onClick={() =>
            setShowLogoutConfirm(false)
          }
        >
          <div
            className="logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="logout-modal-icon"
              aria-hidden="true"
            >
              ↪
            </div>

            <h2 id="logout-modal-title">
              Are you sure you want to logout?
            </h2>

            <p>
              Your garden data is saved. You can sign
              back in anytime.
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() =>
                  setShowLogoutConfirm(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={performLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;