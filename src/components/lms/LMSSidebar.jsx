import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileDoneOutlined,
  SettingOutlined,
  TeamOutlined,
  RocketOutlined,
  ExclamationOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

const LMSSidebar = ({ collapsed, theme: themeProp }) => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/smart-board/dashboard"),
    },
    {
      key: "my-learning",
      icon: <RocketOutlined />,
      label: "My Learning",
      onClick: () => navigate("/smart-board/my-learning"),
    },
    {
      key: "assignments",
      icon: <FileDoneOutlined />,
      label: "Assignments",
      onClick: () => navigate("/smart-board/assignments"),
    },
    {
      key: "career",
      icon: <TrophyOutlined />,
      label: "Career",
      onClick: () => navigate("/smart-board/career"),
    },
    {
      key: "refer-and-earn",
      icon: <ExclamationOutlined />,
      label: "Refer & Earn",
      onClick: () => navigate("/smart-board/refer-and-earn"),
    },
    {
      key: "eklabya-community",
      icon: <TeamOutlined />,
      label: "Community",
      onClick: () => navigate("/smart-board/eklabya-community"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/smart-board/settings"),
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={160}
      collapsedWidth={60}
      className={`h-full relative transition-colors duration-300
        ${
          themeProp === "dark"
            ? "bg-[#001529] border-none"
            : "bg-white border-r border-gray-100"
        }
      `}
    >
      <Menu
        mode="inline"
        theme={themeProp === "dark" ? "dark" : "light"}
        selectedKeys={[selectedKey]}
        onSelect={({ key }) => setSelectedKey(key)}
        inlineCollapsed={collapsed}
        className="bg-transparent border-none py-2 px-1"
        items={menuItems.map((item) => ({
          ...item,
          className: "my-1 rounded-md", // Tailwind for menu items
          title: collapsed ? item.label : "",
        }))}
      />
    </Sider>
  );
};

export default LMSSidebar;
