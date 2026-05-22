import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import LMSNavbar from "./LMSNavbar";
import LMSSidebar from "./LMSSidebar";

const LMSLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light",
  );

  const element = document.documentElement;

  useEffect(() => {
    if (theme === "dark") {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme, element]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!mobileSidebarOpen) return;
      
      const clickedInsideSidebar = event.target.closest(".lms-sidebar");
      const clickedToggleBtn = event.target.closest("[data-mobile-toggle]");
      const clickedOverlay = event.target.closest(".mobile-overlay");
      
      // Allow clicking the toggle button and overlay to close
      if (clickedToggleBtn || clickedOverlay) return;
      
      if (!clickedInsideSidebar) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileSidebarOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the very top */}
      <header className="fixed top-0 left-0 w-full z-[1000]">
        <LMSNavbar
          theme={theme}
          onThemeChange={setTheme}
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobileMenuOpen={mobileSidebarOpen}
        />
      </header>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[899] md:hidden mobile-overlay"
          onMouseDown={(e) => {
            e.stopPropagation();
            setMobileSidebarOpen(false);
          }}
        />
      )}

      {/* Main content area */}
      <div className="flex mt-12 flex-1 text-black dark:text-white">
        {/* Sidebar - Fixed on desktop, overlay on mobile */}
        <aside
          className={`lms-sidebar fixed left-0 top-12 bottom-0 z-[900] transition-all duration-300 overflow-hidden shadow-md
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            ${collapsed ? "w-[60px]" : "w-[160px] md:w-[240px]"}
            ${mobileSidebarOpen ? "w-[240px]" : ""}`}
        >
          <LMSSidebar
            collapsed={collapsed}
            theme={theme}
            onCollapse={setCollapsed}
            isMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        </aside>

        {/* Page Content */}
        <main
          className={`flex-1 transition-all duration-300 min-h-[calc(100vh-50px)] bg-[#001529] dark:bg-slate-900
            ${collapsed ? "md:ml-[60px]" : "md:ml-[240px]"}
            ml-0`}
        >
          <div className="bg-white dark:bg-slate-800 min-h-full shadow-sm">
            <div className="lms-container p-4 sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LMSLayout;
