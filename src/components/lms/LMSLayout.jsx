import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import LMSNavbar from './LMSNavbar';

const { Content } = Layout;

const LMSLayout = () => {
  return (
    <Layout className="lms-layout">
      <LMSNavbar />
      <Layout>
        <Content className="lms-content">
          <div className="lms-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LMSLayout;
