import React from 'react';
import { motion } from 'framer-motion';

// Inline animation variants (same as original)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// Inline admin profile data (same as original)
const adminProfile = {
  name: 'Admin User',
  role: 'System Administrator',
  email: 'admin@kidcare.com',
  phone: '+963 95 500 0000',
  joinDate: '2020-01-15',
  avatar: 'A',
  lastLogin: '2024-05-18 09:30 AM',
  permissions: [],
};

const MyAccountTab = () => (
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
      <div className="account-actions">
        <motion.button className="btn-primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <i className="fa-solid fa-pen"></i> Edit Profile
        </motion.button>
        <motion.button className="btn-secondary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <i className="fa-solid fa-key"></i> Change Password
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export default MyAccountTab;