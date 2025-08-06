import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';


const RegisterPage = () => {
  const navigate = useNavigate();

  const bgImage = "http://firstvite.com/api/upload/file/img-1754467006583-638585158.jpg";

  const handleSuccess = () => {
    navigate('/login', { state: { message: 'Registration successful! Please wait for admin approval.' } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center sm:px-6 lg:px-8"
    style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md opacity-90">
        <div className="bg-white dark:bg-gray-800 py-6 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
