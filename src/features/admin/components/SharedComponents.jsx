import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ==================== ANIMATION VARIANTS (inline) ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// ==================== UTILITY COMPONENTS ====================
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1500, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={`toast-notification ${type}`}
  >
    <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><i className="fa-solid fa-xmark"></i></button>
  </motion.div>
);

const QuickStatCard = ({ icon, label, value, trend, color }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    green: { bg: '#E8F5E9', icon: '#66BB6A', gradient: 'linear-gradient(90deg, #66BB6A, #43A047)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
  };
  return (
    <motion.div className="quick-stat-card" whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(79, 195, 247, 0.15)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="stat-icon-wrapper" style={{ background: colorMap[color].bg }}>
        <i className={`fa-solid ${icon}`} style={{ color: colorMap[color].icon }}></i>
      </div>
      <div className="quick-stat-content">
        <h4>{label}</h4>
        <p className="quick-stat-value">{value}</p>
        <small className={`trend ${trend.startsWith('+') ? 'positive' : 'neutral'}`}>
          <i className={`fa-solid ${trend.startsWith('+') ? 'fa-arrow-trend-up' : 'fa-minus'}`}></i>{trend}
        </small>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, sub, icon, color, progress }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    pink: { bg: '#FCE4EC', icon: '#EC407A', gradient: 'linear-gradient(90deg, #EC407A, #D81B60)' },
  };
  return (
    <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="stat-card-v2">
      <motion.div className="stat-icon-v2" style={{ background: colorMap[color].bg, color: colorMap[color].icon }}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </motion.div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <small className="stat-sub">{sub}</small>
        {progress && (
          <div className="progress-bar-kidcare">
            <motion.div className="progress-fill" style={{ background: colorMap[color].gradient }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { AnimatedNumber, Toast, QuickStatCard, StatCard, containerVariants, itemVariants };