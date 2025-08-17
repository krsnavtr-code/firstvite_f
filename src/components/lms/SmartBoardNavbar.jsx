import React, { useMemo } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import "./LMSNavbar.css";

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
    <Header className="lms-header">
      <div className="lms-logo">
        <Link to="/lms">LMS</Link>
      </div>

      <div className="lms-header-right">
        <Badge count={5} className="notification-badge">
          <BellOutlined className="notification-icon" />
        </Badge>

        <Dropdown menu={userMenu} trigger={["click"]}>
          <div className="user-avatar">
            <Avatar
              icon={<UserOutlined />}
              src={currentUser?.avatar}
              style={{ marginRight: 8 }}
            />
            <span className="user-name">{currentUser?.fullname || "User"}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default LMSNavbar;
