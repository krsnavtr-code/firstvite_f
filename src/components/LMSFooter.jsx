import React from 'react';
import { Layout } from 'antd';
import './LMSFooter.css';

const { Footer } = Layout;

const LMSFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Footer className="lms-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>LMS Platform</h3>
          <p>Empowering education through technology</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/lms/courses">Courses</a></li>
            <li><a href="/lms/assignments">Assignments</a></li>
            <li><a href="/lms/grades">Grades</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {currentYear} LMS Platform. All rights reserved.</p>
      </div>
    </Footer>
  );
};

export default LMSFooter;
