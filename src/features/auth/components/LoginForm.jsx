import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.email.endsWith('@gmail.com')) newErrors.email = "Must end with @gmail.com";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = (e, role) => {
    e.preventDefault();
    if (validate()) onLogin(role);
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
        {/* حاوية الـ 12 شكلاً المتبعثرة */}
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
          <div className="app-logo">
             <i className="fa-solid fa-house-medical"></i>
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your KidCare account</p>
        </div>

        <form className="form-section">
          <div className="input-box">
            <label>Email Address</label>
            <div className={`input-field ${errors.email ? 'error-border' : ''}`}>
              <input 
                type="email" 
                placeholder="example@gmail.com" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <i className="fa-regular fa-envelope"></i>
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="input-box">
            <label>Password</label>
            <div className={`input-field ${errors.password ? 'error-border' : ''}`}>
              <input 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="login-spacer"></div>

          <button className="btn-primary" onClick={(e) => handleAction(e, 'admin')}>
            Login as Admin
          </button>

          <button className="btn-outline" onClick={(e) => handleAction(e, 'reception')}>
            Login as Reception
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;