import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SuspendedAccount = () => {
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
        status="error"
        title="Account Suspended"
        subTitle="Your account has been deactivated. Please contact support for assistance."
        extra={[
          <Button 
            type="primary" 
            key="contact" 
            onClick={() => window.location.href = 'mailto:support@example.com'}
          >
            Contact Support
          </Button>,
          <Button key="logout" onClick={handleLogout}>
            Return to Login
          </Button>
        ]}
      />
    </div>
  );
};

export default SuspendedAccount;
