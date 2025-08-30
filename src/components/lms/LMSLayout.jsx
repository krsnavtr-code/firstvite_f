import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Button, theme } from 'antd';
import LMSNavbar from './LMSNavbar';
import LMSSidebar from './LMSSidebar';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Content } = Layout;

const LMSLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
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
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar at the very top */}
      <div style={{ position: 'fixed', width: '100%', zIndex: 1000 }}>
        <LMSNavbar theme={theme} onThemeChange={setTheme} />
      </div>
      
      {/* Main content area with sidebar and page content */}
      <div style={{ display: 'flex', marginTop: '40px', flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: collapsed ? '60px' : '160px',
          flexShrink: 0,
          position: 'fixed',
          left: 0,
          top: '40px',
          bottom: 0,
          zIndex: 900,
          transition: 'width 0.2s',
          overflow: 'hidden',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
        }}>
          <LMSSidebar 
            collapsed={collapsed} 
            theme={theme}
            onCollapse={setCollapsed} 
          />
        </div>

        {/* Page Content */}
        <div style={{
          marginLeft: collapsed ? '60px' : '160px',
          flex: 1,
          padding: '5px',
          transition: 'margin-left 0.2s',
          minHeight: 'calc(100vh - 40px)',
          backgroundColor: '#001529',
          position: 'relative'
        }}>
          <div style={{ 
            background: '#fff',
            borderRadius: '8px',
            padding: '5px',
            minHeight: '100%',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
          }}>
            {/* <div style={{ position: 'absolute', top: '0px', left: '0px' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '18px', 
                  width: 48,
                  height: 48,
                }}
                className="hover:text-blue-600"
              />
            </div> */}
            <div className="lms-container">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSLayout;
