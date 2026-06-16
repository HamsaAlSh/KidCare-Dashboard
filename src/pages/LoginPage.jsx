import React from 'react';
import LoginForm from "../features/LoginForm";

const LoginPage = () => {
  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: 'var(--bg-light)' 
    }}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;