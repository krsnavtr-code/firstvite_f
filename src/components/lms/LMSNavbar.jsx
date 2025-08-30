import React, { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaUser } from "react-icons/fa";
import LiveChatWidget from "./LiveChatWidget";
import { FaSun, FaMoon } from "react-icons/fa";

const { Header } = Layout;

const LMSNavbar = ({ theme, onThemeChange }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(() =>
    Number(localStorage.getItem("lms_chat_unread") || 0)
  );

  const toggleTheme = () => {
    onThemeChange(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const onUnread = (e) =>
      setUnread(
        Number(e?.detail?.count ?? localStorage.getItem("lms_chat_unread") ?? 0)
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
    []
  );

  const userMenu = useMemo(
    () => ({
      items: userMenuItems,
      onClick: ({ key }) => {
        // Handle menu item clicks if needed
        if (key === "logout") {
          handleLogout();
        }
      },
    }),
    [userMenuItems]
  );

  return (
    <>
      <header className="flex items-center justify-between px-6 dark:bg-[#001529] bg-[#fff] shadow-sm border-b border-gray-100">
        {/* Left: Logo */}
        <Link to="/lms">
          <div className="w-10 h-10 p-1 overflow-hidden group-hover:scale-105 transition-transform">
            <img
              src="http://firstvite.com/api/upload/file/img-1753961989896-7541613.png"
              alt="Logo"
              className="object-cover w-full h-full"
            />
          </div>
        </Link>

        
        {/* Right: Notifications + User */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="text-black dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <FaSun className="w-4 h-4 p-0 m-0" />
            ) : (
              <FaMoon className="w-4 h-4 p-0 m-0" />
            )}
          </button>

          {/* Live Chat */}
          <Badge
            count={unread}
            size="small"
            offset={[0, 0]}
            style={{ fontSize: "12px" }}
          >
            <Link
              className="text-black dark:text-white text-sm hover:text-blue-600 cursor-pointer transition-colors border border-blue-600 px-2 rounded-lg dark:border-blue-600"
              onClick={() => {
                localStorage.setItem("lms_chat_unread", "0");
                setUnread(0);
                setChatOpen(true);
              }}
            >
              Live Chat
            </Link>
          </Badge>
          {/* Portfolio */}
          {/* <Link className="flex items-center text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors border border-gray-200 px-1 rounded-lg">
          <FaUser /> Portfolio
        </Link> */}

          {/* Notification */}
          <Badge
            count={1}
            size="small"
            offset={[0, 0]}
            style={{ fontSize: "12px" }}
            onClick={() => navigate("/lms/notifications")}
          >
            <BellOutlined className="text-md hover:text-blue-600 cursor-pointer transition-colors text-black dark:text-white" />
          </Badge>

          {/* User Menu */}
          <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
            <div className="flex items-center cursor-pointer space-x-2 px-3 transition">
              <Avatar
                size={26}
                icon={<UserOutlined />}
                src={currentUser?.avatar}
              />
              <span className="font-medium text-black dark:text-white">
                Hi, {currentUser?.fullname || "User"}
                <p className="text-black dark:text-gray-200" style={{ fontSize: "8px" }}>
                  Become <span className="text-blue-600">Be The First</span>{" "}
                  With Us
                </p>
              </span>
            </div>
          </Dropdown>
        </div>
      </header>
      <LiveChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default LMSNavbar;
