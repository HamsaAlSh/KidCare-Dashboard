import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const adminProfile = {
  name: 'Admin User',
  role: 'System Administrator',
  email: 'admin@kidcare.com',
  phone: '+963 96 853 9430',
  joinDate: '2020-01-15',
  avatar: 'A',
  lastLogin: '2024-05-18 09:30 AM',
  permissions: [],
};

const MyAccountTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 🔴 دالة تسجيل الخروج
  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    window.location.href = '/login';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = sessionStorage.getItem('admin_token');
      const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
      const phoneNumber = user.phone_number || adminProfile.phone;

      const formDataToSend = new FormData();
      formDataToSend.append('phone_number', phoneNumber);
      formDataToSend.append('password', formData.new_password);
      formDataToSend.append('password_confirmation', formData.confirm_password);

      const response = await axios.post('/api/SetAdminPassword', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => {
        setShowModal(false);
        setFormData({ old_password: '', new_password: '', confirm_password: '' });
        setMessage(null);
      }, 1500);

    } catch (error) {
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);

      if (error.response?.status === 401) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        window.location.href = '/login';
        return;
      }

      const errorData = error.response?.data;
      let errorMsg = 'An error occurred';

      if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join(' | ');
      }

      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="account-card" variants={itemVariants}>
        <div className="account-header">
          <motion.div className="account-avatar" whileHover={{ scale: 1.05 }}>
            {adminProfile.avatar}
          </motion.div>
          <div className="account-info">
            <h2>{adminProfile.name}</h2>
            <p className="account-role">{adminProfile.role}</p>
            <p className="account-meta"><i className="fa-solid fa-calendar"></i> Member since {adminProfile.joinDate}</p>
            <p className="account-meta"><i className="fa-solid fa-clock"></i> Last login: {adminProfile.lastLogin}</p>
          </div>
        </div>
        <div className="account-details">
          <div className="detail-group">
            <h4><i className="fa-solid fa-envelope"></i> Email</h4>
            <p>{adminProfile.email}</p>
          </div>
          <div className="detail-group">
            <h4><i className="fa-solid fa-phone"></i> Phone</h4>
            <p>{adminProfile.phone}</p>
          </div>
          <div className="detail-group full">
            <h4><i className="fa-solid fa-shield-halved"></i> Permissions</h4>
            <div className="permissions-list">
              {adminProfile.permissions.map((perm, index) => (
                <motion.span key={index} className="permission-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                  <i className="fa-solid fa-check"></i> {perm}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* 🔴 أزرار العمليات (تم إضافة زر تسجيل الخروج هنا) */}
        <div className="account-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <motion.button 
            className="btn-secondary" 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
          >
            <i className="fa-solid fa-key"></i> Change Password
          </motion.button>

          <motion.button 
            className="btn-danger" 
            style={{ 
              backgroundColor: '#ef5350', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Log Out
          </motion.button>
        </div>
      </motion.div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3><i className="fa-solid fa-key"></i> Change Password</h3>
            
            {message && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MyAccountTab;