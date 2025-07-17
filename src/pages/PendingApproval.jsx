import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Result
        status="warning"
        title="Account Pending Approval"
        subTitle="Your account is pending approval from an administrator. Please check back later or contact support if this takes too long."
        extra={[
          <Button key="logout" type="primary" onClick={handleLogout}>
            Logout
          </Button>,
          <Button 
            key="contact" 
            onClick={() => window.location.href = 'mailto:support@example.com'}
          >
            Contact Support
          </Button>
        ]}
      />
    </div>
  );
};

export default PendingApproval;
