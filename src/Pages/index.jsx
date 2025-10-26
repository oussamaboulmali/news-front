/**
 * @fileoverview Main Layout Component
 * 
 * Main application layout wrapper that contains the navigation structure
 * Provides responsive layout for desktop and mobile devices
 * 
 * @module Pages/Main
 */

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Outlet } from "react-router-dom";
import Sidebar from "../Menu/SideBarMenu/index";
import Navbar from "../Menu/NavBar/index";
import Footer from "../Menu/Footer/index";
import "../assets/styles/menu.css";

/**
 * Main layout component that wraps all protected pages
 * Provides navigation structure with sidebar, navbar, and footer
 * Adapts layout based on screen size (mobile/desktop)
 * 
 * @component
 * @returns {JSX.Element} Main layout with navigation and content outlet
 * 
 * @description
 * Layout Structure:
 * - Desktop: Sidebar (left) + Content area (right with navbar + outlet + footer)
 * - Mobile: Navbar (top) + Collapsible sidebar (overlay) + Content + Footer
 */
const Main = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(isMobile ? false : true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="main-container">
      {isMobile ? (
        // Structure mobile
        <div className={`mobile-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
          {/* Navbar mobile qui reste en haut */}
          <div className="navbar-mobile">
            <Navbar
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              isMobileView={isMobile}
            />
          </div>
          {/* Sidebar mobile qui apparaît sous la navbar quand ouvert */}
          {isSidebarOpen && (
            <div className="mobile-sidebar-wrapper">
              <Sidebar
                isSidebarOpen={true}
                isMobile={isMobile}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            </div>
          )}

          {/* Content mobile qui s'ajuste selon l'état du sidebar */}
          <div className="content-mobile">
            <Outlet />
          </div>

          {/* Footer mobile */}
          <div className="footer-mobile">
            <Footer isSidebarOpen={false} />
          </div>
        </div>
      ) : (
        // Layout desktop (structure modifiée)
        <>
          <div className="main-container">
            <Sidebar isSidebarOpen={isSidebarOpen} isMobile={isMobile} />
            <div
              className={
                isSidebarOpen ? "content-container" : "content-container-small"
              }
            >
              <Navbar
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
              />

              <div className="content">
                <Outlet />
              </div>
              <Footer isSidebarOpen={isSidebarOpen} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
