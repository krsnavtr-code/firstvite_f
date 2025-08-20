import React, { useMemo } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaUser } from "react-icons/fa";

const { Header } = Layout;

const LMSNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
    <header className="flex items-center justify-between px-6 bg-white shadow-sm border-b border-gray-100">
      {/* Left: Logo */}
      <Link to="/lms" className="flex items-center group">
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
        {/* Live Chat */}
        <Link className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors border border-gray-200 px-2 rounded-lg">
          Live Chat
        </Link>
        {/* Request a CallBack */}
        <Link className="text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors border border-gray-200 px-2 rounded-lg">
          Request a CallBack
        </Link>
        {/* Portfolio */}
        <Link className="flex items-center text-gray-600 text-sm hover:text-blue-600 cursor-pointer transition-colors border border-gray-200 px-1 rounded-lg">
          <FaUser /> Portfolio
        </Link>

        {/* Notification */}
        <Badge count={1} size="small" offset={[0, 0]} style={{ fontSize: "12px" }}>
          <BellOutlined className="text-md text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" />
        </Badge>

        {/* User Menu */}
        <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center cursor-pointer space-x-2 hover:bg-gray-50 px-3 transition">
            <Avatar
              size={26}
              icon={<UserOutlined />}
              src={currentUser?.avatar}
            />
            <span className="font-medium text-gray-700">
              Hi, {currentUser?.fullname || "User"}
              <p className="text-gray-500" style={{ fontSize: "8px" }}>Become <span className="text-blue-600">Be The First</span> With Us</p>
            </span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default LMSNavbar;
