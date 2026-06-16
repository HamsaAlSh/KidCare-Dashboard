import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './LoginForm.css';
import logoImage from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({ phone_number: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const validate = () => {
    let newErrors = {};
    if (!formData.phone_number.startsWith('963')) newErrors.phone_number = "Must start with 963";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = async (e, role) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    const result = await login(formData.phone_number, formData.password);
    
    setIsLoading(false);
    
    if (result.success) {
      alert(`Login successful! Role: ${role}`);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-decoration">
          <div className="soft-circle blue-soft"></div>
          <div className="soft-circle light-soft"></div>
      </div>

      <motion.div 
        className="login-card-v2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        
        <div className="extra-shapes-layer">
          <span className="scattered-shape s1">★</span>
          <span className="scattered-shape c1"></span>
          <span className="scattered-shape s2">★</span>
          <span className="scattered-shape c2"></span>
          <span className="scattered-shape s3">★</span>
          <span className="scattered-shape c3"></span>
          <span className="scattered-shape s4">★</span>
          <span className="scattered-shape c4"></span>
          <span className="scattered-shape s5">★</span>
          <span className="scattered-shape c5"></span>
          <span className="scattered-shape s6">★</span>
          <span className="scattered-shape c6"></span>
        </div>
        <div className="header-section">
          <div className="app-logo-container">
              <img src={logoImage} alt="Logo" className="app-custom-logo" />
          </div>
          <h1>Welcome</h1>
          <p>Login to your KidCare account</p>
        </div>

        <form className="form-section">
          {apiError && <div className="error-msg" style={{textAlign: 'center', marginBottom: '10px'}}>{apiError}</div>}
          
          <div className="input-box">
            <label>Phone Number</label>
            <div className={`input-field ${errors.phone_number ? 'error-border' : ''}`}>
              <input 
                type="tel" 
                placeholder="example 963*********" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
              <i className="fa-regular fa-envelope"></i>
            </div>
            {errors.phone_number && <span className="error-msg">{errors.phone_number}</span>}
          </div>

          <div className="input-box">
            <label>Password</label>
            <div className={`input-field ${errors.password ? 'error-border' : ''}`}>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="login-spacer"></div>

          <button className="btn-primary" onClick={(e) => handleAction(e, 'admin')} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login as Admin'}
          </button>

          <button className="btn-outline" onClick={(e) => handleAction(e, 'reception')} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login as Reception'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;