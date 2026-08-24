import { useState } from "react";

import Sidebar from "./components/sidebar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import EnvironmentSetup from "./pages/EnvironmentSetup";
import MyGarden from "./pages/MyGarden";
import SmartRecommendations from "./pages/SmartRecommendations";

import "./App.css";


function App() {

  /*
   * Check whether the user already has
   * an active login session.
   */
  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    const savedSession =
      localStorage.getItem("urbanGardenSession");

    if (!savedSession) {
      return false;
    }

    try {
      const session = JSON.parse(savedSession);

      return session.isLoggedIn === true;

    } catch {
      return false;
    }
  });


  /*
   * Decide which page should be displayed.
   *
   * If someone is not logged in, they can only
   * access:
   *
   * Landing
   * Login
   * Signup
   */
  const [activePage, setActivePage] = useState(() => {

    const savedSession =
      localStorage.getItem("urbanGardenSession");

    if (savedSession) {

      try {

        const session = JSON.parse(savedSession);

        if (session.isLoggedIn === true) {
          return "dashboard";
        }

      } catch {
        // Ignore invalid session
      }
    }

    return "landing";
  });


  /*
   * Central navigation function.
   */
  const handlePageChange = (page) => {

    /*
     * Public pages.
     */
    if (
      page === "landing" ||
      page === "login" ||
      page === "signup"
    ) {
      setActivePage(page);
      return;
    }


    /*
     * Protected pages.
     *
     * If the user is not logged in,
     * send them to Login instead.
     */
    if (!isAuthenticated) {

      setActivePage("login");

      return;
    }


    setActivePage(page);
  };


  /*
   * Called when login succeeds.
   */
  const handleLogin = (session) => {

    localStorage.setItem(
      "urbanGardenSession",
      JSON.stringify(session)
    );

    setIsAuthenticated(true);

    setActivePage("dashboard");
  };


  /*
   * Logout.
   */
  const handleLogout = () => {

    localStorage.removeItem(
      "urbanGardenSession"
    );

    setIsAuthenticated(false);

    setActivePage("landing");
  };


  /*
   * Render the correct page.
   */
  const renderPage = () => {

    switch (activePage) {

      case "landing":

        return (
          <Landing
            onNavigate={handlePageChange}
          />
        );


      case "login":

        return (
          <Login
            onNavigate={handlePageChange}
            onLogin={handleLogin}
          />
        );


      case "signup":

        return (
          <Signup
            onNavigate={handlePageChange}
          />
        );


      case "dashboard":

        return (
          <Dashboard />
        );


      case "environment":

        return (
          <EnvironmentSetup />
        );


      case "mygarden":

        return (
          <MyGarden />
        );


      case "recommendations":

        return (
          <SmartRecommendations />
        );


      default:

        return (
          <Landing
            onNavigate={handlePageChange}
          />
        );
    }
  };


  /*
   * Sidebar should NOT appear on:
   *
   * Landing
   * Login
   * Signup
   */
  const showSidebar =
    isAuthenticated &&
    activePage !== "landing" &&
    activePage !== "login" &&
    activePage !== "signup";


  return (

    <div className="app">

      {showSidebar && (

        <Sidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />

      )}


      <main
        className={
          showSidebar
            ? "main-content"
            : "auth-or-landing-content"
        }
      >

        {renderPage()}

      </main>

    </div>
  );
}


export default App;