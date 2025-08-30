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
      onClick: () => navigate("/lms/dashboard"),
    },
    {
      key: "my-learning",
      icon: <RocketOutlined />,
      label: "My Learning",
      onClick: () => navigate("/lms/my-learning"),
    },
    {
      key: "assignments",
      icon: <FileDoneOutlined />,
      label: "Assignments",
      onClick: () => navigate("/lms/assignments"),
    },
    {
      key: "career",
      icon: <TrophyOutlined />,
      label: "Career",
      onClick: () => navigate("/lms/career"),
    },
    {
      key: "refer-and-earn",
      icon: <ExclamationOutlined />,
      label: "Refer & Earn",
      onClick: () => navigate("/lms/refer-and-earn"),
    },
    {
      key: "firstvite-community",
      icon: <TeamOutlined />,
      label: "FV Community",
      onClick: () => navigate("/lms/firstvite-community"),
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
      width={180}
      collapsedWidth={60}
      style={{
        height: "100%",
        overflow: "hidden",
        position: "relative",
        color: themeProp === "dark" ? "black" : "white",
        background: themeProp === "dark" ? "#001529" : "#fff",
        borderRight: themeProp === "light" ? "1px solid #f0f0f0" : "none",
      }}
    >
      <Menu
        mode="inline"
        theme={themeProp === 'dark' ? 'dark' : 'light'}
        selectedKeys={[selectedKey]}
        style={{
          background: 'transparent',
          borderRight: 'none',
          padding: '8px 4px',
          color: themeProp === 'dark' ? 'black' : 'white'
        }}
        items={menuItems.map((item) => ({
          ...item,
          style: {
            margin: "4px 0",
            borderRadius: "6px",
          },
          title: collapsed ? item.label : "",
        }))}
        onSelect={({ key }) => setSelectedKey(key)}
        inlineCollapsed={collapsed}
      />
    </Sider>
  );
};

export default LMSSidebar;
