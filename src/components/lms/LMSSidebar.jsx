import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  FileDoneOutlined,
  MessageOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

const LMSSidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/lms/dashboard"),
    },
    {
      key: "courses",
      icon: <BookOutlined />,
      label: "My Courses",
      onClick: () => navigate("/lms/courses"),
    },
    {
      key: "assignments",
      icon: <FileDoneOutlined />,
      label: "Assignments",
      onClick: () => navigate("/lms/assignments"),
    },
    {
      key: "calendar",
      icon: <CalendarOutlined />,
      label: "Calendar",
      onClick: () => navigate("/lms/calendar"),
    },
    {
      key: "messages",
      icon: <MessageOutlined />,
      label: "Messages",
      onClick: () => navigate("/lms/messages"),
    },
    {
      key: "discussions",
      icon: <TeamOutlined />,
      label: "Discussions",
      onClick: () => navigate("/lms/discussions"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/lms/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/lms/settings"),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={170}
      collapsedWidth={50}
      style={{
        background: colorBgContainer,
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          borderRight: 0,
          // padding: "8px 0",
        }}
        items={menuItems.map((item) => ({
          ...item,
          style: {
            margin: "4px 0",
            padding: "0 8px",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          title: collapsed ? item.label : "",
        }))}
        onSelect={({ key }) => setSelectedKey(key)}
        inlineCollapsed={collapsed}
        inlineIndent={8}
      />
    </Sider>
  );
};

export default LMSSidebar;
