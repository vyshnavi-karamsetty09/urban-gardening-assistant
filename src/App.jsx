import { useState, useEffect } from "react";
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
import { STORAGE_KEYS } from "./utils";
import "./App.css";

function App() {
  const [_isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      if (!raw) return true; // Default to true so user sees full dashboard on initial open
      return JSON.parse(raw)?.isLoggedIn !== false;
    } catch {
      return true;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get("page");
      if (pageParam) return pageParam;
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      const session = raw ? JSON.parse(raw) : null;
      if (session?.activePage) return session.activePage;
      return "landing"; // Default to index page
    } catch {
      return "landing";
    }
  });

  const [pagePayload, setPagePayload] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.session)) {
        localStorage.setItem(
          STORAGE_KEYS.session,
          JSON.stringify({ name: "Dattu", email: "dattu@gardenguide.io", isLoggedIn: true, activePage: "landing" })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePageChange = (page, payload = null) => {
    setPagePayload(payload);
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      const session = raw ? JSON.parse(raw) : {};
      session.activePage = page;
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } catch {
      // ignore
    }
  };

  const handleLogin = (session) => {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    setIsAuthenticated(true);
    setActivePage("dashboard");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setIsAuthenticated(false);
    setActivePage("landing");
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "landing": return <Landing onNavigate={handlePageChange} />;
      case "login": return <Login onNavigate={handlePageChange} onLogin={handleLogin} />;
      case "signup": return <Signup onNavigate={handlePageChange} />;
      case "dashboard": return <Dashboard onPageChange={handlePageChange} />;
      case "environment":
      case "recommendations":
        return (
          <SmartRecommendations
            onPageChange={handlePageChange}
            initialTab={activePage === "environment" ? "environment" : "recommendations"}
          />
        );
      case "mygarden": return <MyGarden onPageChange={handlePageChange} />;
      case "library": return <PlantLibrary onPageChange={handlePageChange} />;
      case "diseasedetection":
      case "disease":
        return <DiseaseDetection onPageChange={handlePageChange} initialSymptom={pagePayload?.symptom || ""} />;
      case "scheduler": return <CareScheduler />;
      case "health":
        return <DiseaseDetection onPageChange={handlePageChange} initialSymptom={pagePayload?.symptom || ""} />;
      case "assistant": return <GardenAssistant />;
      case "settings": return <Settings onPageChange={handlePageChange} onLogout={handleLogout} />;
      default: return <Landing onNavigate={handlePageChange} />;
    }
  };

  const showSidebar = !["landing", "login", "signup"].includes(activePage);

  return (
    <div className="app">
      {showSidebar && (
        <Sidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      )}
      <main className={showSidebar ? "main-content" : "auth-or-landing-content"}>
        {showSidebar && (
          <Topbar
            activePage={activePage}
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        )}
        <div key={activePage} className="page-transition-container">
          {renderPage()}
        </div>
      </main>

      {/* Mobile Bottom Navigation for phone screens */}
      {showSidebar && (
        <MobileBottomNav
          activePage={activePage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default App;

