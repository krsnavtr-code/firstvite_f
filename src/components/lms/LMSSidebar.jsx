import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LMSSidebar = ({
  collapsed,
  theme = "light",
  isMobile,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      path: "/smart-board/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
    },
    {
      key: "my-learning",
      label: "My Learning",
      path: "/smart-board/my-learning",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 8.41m5.96 5.96a14.96 14.96 0 0 1-5.96 5.96m5.96-5.96L9.63 8.41m0 0a14.98 14.98 0 0 1-6.16 12.12A14.98 14.98 0 0 1 9.63 8.41m0 0 5.96 5.96"
          />
        </svg>
      ),
    },
    {
      key: "assignments",
      label: "Assignments",
      path: "/smart-board/assignments",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .415.162.798.425 1.081m-2.748-1.081a4.49 4.49 0 0 1-1.123-.08c-1.13-.094-1.976 1.057-1.976 2.192V16.5A2.25 2.25 0 0 0 5.25 18.75h3m7.5-13.5v-1.125c0-1.135-.845-2.098-1.976-2.192a48.474 48.474 0 0 0-3.048 0c-1.13.094-1.976 1.057-1.976 2.192V5.25"
          />
        </svg>
      ),
    },
    {
      key: "career",
      label: "Career",
      path: "/smart-board/career",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A5.906 5.906 0 0 1 1.5 3.493V4.502a5.906 5.906 0 0 1 3.212 5.256 12.142 12.142 0 0 1 1.048-1.543m11.222 1.944a50.703 50.703 0 0 1 2.658-.813c.7-1.152 1.092-2.5 1.092-3.938V4.502a5.906 5.906 0 0 0-3.212 5.256c0 .545-.077 1.071-.222 1.567m-11.222-1.944A50.67 50.67 0 0 1 12 11.666a50.67 50.67 0 0 1 7.742-1.52"
          />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      path: "/smart-board/settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.246.467c.35.132.744.072 1.066-.12a6.38 6.38 0 0 1 .22-.128c.333-.184.584-.496.648-.87l.213-1.281Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`h-full transition-all duration-300 ease-in-out border-r flex flex-col
        ${collapsed ? "w-[70px]" : "w-64"}
        ${theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}
      `}
    >
      <div className="flex-1 py-4 px-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.key}
              onClick={() => {
                navigate(item.path);
                if (isMobile && onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`w-full flex items-center group relative px-2 py-1 rounded-lg transition-colors duration-200
                ${collapsed ? "justify-center" : "justify-start gap-1.5"}
                ${
                  isActive
                    ? theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600"
                    : theme === "dark"
                      ? "hover:bg-slate-800"
                      : "hover:bg-gray-100"
                }
              `}
              title={collapsed ? item.label : ""}
            >
              <div
                className={`${isActive ? "text-current" : "text-gray-400 group-hover:text-current"}`}
              >
                {item.icon}
              </div>

              {!collapsed && (
                <span className="font-medium text-sm truncate whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip Simulation (Optional) */}
              {collapsed && (
                <div className="absolute left-14 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default LMSSidebar;
