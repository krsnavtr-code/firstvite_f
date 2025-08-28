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
  RocketOutlined,
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
    // {
    //   key: "calendar",
    //   icon: <CalendarOutlined />,
    //   label: "Calendar",
    //   onClick: () => navigate("/lms/calendar"),
    // },
    // {
    //   key: "messages",
    //   icon: <MessageOutlined />,
    //   label: "Messages",
    //   onClick: () => navigate("/lms/messages"),
    // },
    {
      key: "firstvite-community",
      icon: <TeamOutlined />,
      label: "Community",
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
