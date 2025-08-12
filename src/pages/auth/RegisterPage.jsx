import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login', { state: { message: 'Registration successful! Please wait for admin approval.' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-500 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid md:grid-cols-2">
        {/* Left Side - Welcome */}
        <div className="bg-gradient-to-br from-orange-500 to-blue-500 text-white flex flex-col justify-center relative p-8">
          {/* Home icon button */}
          <Link to="/" className="text-white absolute top-4 left-8">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 1.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 9.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1V9.414l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold mb-4">Welcome to FirstVITE</h1>
          <p className="text-sm opacity-90">
            To make high-quality education accessible online, helping learners
            gain practical, job-ready skills in trending domains.
          </p>
        </div>
        {/* Right Side - Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <RegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
