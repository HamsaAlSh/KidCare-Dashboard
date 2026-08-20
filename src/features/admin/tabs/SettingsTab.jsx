import React from 'react';
import { motion } from 'framer-motion';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const SettingsTab = ({ darkMode, setDarkMode }) => (
  <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div className="settings-card" variants={itemVariants}>
      <h3><i className="fa-solid fa-sliders"></i> General Settings</h3>
      <div className="setting-item">
        <div>
          <h4>Dark Mode</h4>
          <p>Toggle between light and dark theme</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={() => setDarkMode(!darkMode)} 
          />
          <span className="toggle-slider"></span>
        </label>
      </div>  
    </motion.div>
  </motion.div>
);

export default SettingsTab;