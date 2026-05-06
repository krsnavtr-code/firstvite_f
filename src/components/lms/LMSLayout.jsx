import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import LMSNavbar from "./LMSNavbar";
import LMSSidebar from "./LMSSidebar";

const LMSLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the very top */}
      <header className="fixed top-0 left-0 w-full z-[1000]">
        <LMSNavbar theme={theme} onThemeChange={setTheme} />
      </header>

      {/* Main content area */}
      <div className="flex mt-12 flex-1 text-black dark:text-white">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-12 bottom-0 z-[900] transition-all duration-200 overflow-hidden shadow-md
            ${collapsed ? "w-[60px]" : "w-[160px]"}`}
        >
          <LMSSidebar
            collapsed={collapsed}
            theme={theme}
            onCollapse={setCollapsed}
          />
        </aside>

        {/* Page Content */}
        <main
          className={`flex-1 transition-all duration-200 min-h-[calc(100vh-50px)] bg-[#001529] dark:bg-slate-900
            ${collapsed ? "ml-[60px]" : "ml-[160px]"}`}
        >
          <div className="bg-white dark:bg-slate-800 min-h-full shadow-sm">
            <div className="lms-container p-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LMSLayout;
