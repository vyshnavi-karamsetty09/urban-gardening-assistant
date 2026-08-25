import { useState } from "react";
import Sidebar from "./components/sidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EnvironmentSetup from "./pages/EnvironmentSetup";
import MyGarden from "./pages/MyGarden";
import SmartRecommendations from "./pages/SmartRecommendations";
import CareScheduler from "./pages/CareScheduler";
import PlantHealth from "./pages/PlantHealth";
import GardenAssistant from "./pages/GardenAssistant";
import { STORAGE_KEYS } from "./utils";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null")?.isLoggedIn === true;
    } catch {
      return false;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null")?.isLoggedIn === true
        ? "dashboard"
        : "landing";
    } catch {
      return "landing";
    }
  });

  const handlePageChange = (page) => {
    const publicPages = ["landing", "login", "signup"];
    if (publicPages.includes(page)) {
      setActivePage(page);
      return;
    }
    if (!isAuthenticated) {
      setActivePage("login");
      return;
    }
    setActivePage(page);
  };

  const handleLogin = (session) => {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setIsAuthenticated(false);
    setActivePage("landing");
  };

  const renderPage = () => {
    switch (activePage) {
      case "landing": return <Landing onNavigate={handlePageChange} />;
      case "login": return <Login onNavigate={handlePageChange} onLogin={handleLogin} />;
      case "signup": return <Signup onNavigate={handlePageChange} />;
      case "dashboard": return <Dashboard onPageChange={handlePageChange} />;
      case "environment": return <EnvironmentSetup onPageChange={handlePageChange} />;
      case "mygarden": return <MyGarden onPageChange={handlePageChange} />;
      case "recommendations": return <SmartRecommendations onPageChange={handlePageChange} />;
      case "scheduler": return <CareScheduler />;
      case "health": return <PlantHealth />;
      case "assistant": return <GardenAssistant />;
      default: return <Landing onNavigate={handlePageChange} />;
    }
  };

  const showSidebar = isAuthenticated && !["landing", "login", "signup"].includes(activePage);

  return (
    <div className="app">
      {showSidebar && (
        <Sidebar activePage={activePage} onPageChange={handlePageChange} onLogout={handleLogout} />
      )}
      <main className={showSidebar ? "main-content" : "auth-or-landing-content"}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
