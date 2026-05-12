import React, { useContext } from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useContext(AuthContext);

  const handleLogin = (role) => {
    // محاكاة تسجيل دخول بناءً على الزر المضغوط
    login({ name: 'User', role: role });
  };

  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: 'var(--bg-light)' 
    }}>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;