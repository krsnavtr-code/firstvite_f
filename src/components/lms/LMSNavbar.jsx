import React, { useEffect, useMemo, useState } from "react";
import { Menu, Dropdown, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import LiveChatWidget from "./LiveChatWidget";
import { FaSun, FaMoon } from "react-icons/fa";

const logoImg = "http://eklabya.com/api/upload/file/eKlabya-fit-logo-8874.png";

const LMSNavbar = ({ theme, onThemeChange }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(() =>
    Number(localStorage.getItem("lms_chat_unread") || 0),
  );

  const toggleTheme = () => {
    onThemeChange(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const onUnread = (e) =>
      setUnread(
        Number(
          e?.detail?.count ?? localStorage.getItem("lms_chat_unread") ?? 0,
        ),
      );
    const onStorage = (e) => {
      if (e.key === "lms_chat_unread") setUnread(Number(e.newValue || 0));
    };
    window.addEventListener("lms-chat-unread", onUnread);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("lms-chat-unread", onUnread);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link to="/profile">Profile</Link>,
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
      },
    ],
    [],
  );

  const userMenu = useMemo(
    () => ({
      items: userMenuItems,
    }),
    [userMenuItems],
  );

  return (
    <>
      <header className="flex h-10 items-center justify-between px-6 transition-colors duration-300 shadow-sm border-b dark:bg-[#001529] bg-white dark:border-slate-800 border-gray-100">
        {/* Left: Logo */}
        <Link to="/smart-board" className="flex items-center">
          <img src={logoImg} alt="Logo" className="h-8 rounded" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <FaSun className="w-3.5 h-3.5" />
            ) : (
              <FaMoon className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Live Chat */}
          <Badge count={unread} size="small" className="flex items-center">
            <button
              onClick={() => {
                localStorage.setItem("lms_chat_unread", "0");
                setUnread(0);
                setChatOpen(true);
              }}
              className="text-xs font-medium px-3 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:border-blue-500 dark:text-blue-400"
            >
              Live Chat
            </button>
          </Badge>

          {/* Notifications */}
          <Badge count={1} size="small">
            <BellOutlined
              className="text-lg cursor-pointer text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
              onClick={() => navigate("/smart-board/notifications")}
            />
          </Badge>

          {/* User Profile Dropdown */}
          <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
            <div className="flex items-center cursor-pointer space-x-2 group">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] leading-tight font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                  Hi, {currentUser?.fullname?.split(" ")[0] || "User"}
                </p>
                <p className="text-[8px] leading-tight text-slate-500 dark:text-slate-400">
                  Become{" "}
                  <span className="text-blue-600 font-bold uppercase">
                    Be The First
                  </span>
                </p>
              </div>
              <Avatar
                size={28}
                className="border border-gray-200 dark:border-slate-700"
                icon={<UserOutlined />}
                src={currentUser?.avatar}
              />
            </div>
          </Dropdown>
        </div>
      </header>
      <LiveChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default LMSNavbar;
