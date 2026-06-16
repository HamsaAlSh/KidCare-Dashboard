import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../../../assets/logo.jpg';


const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: 12 },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'insights', label: 'Smart Insights', icon: 'fa-lightbulb', badge: null }, 
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
];

const Sidebar = ({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen, darkMode }) => (
  <motion.aside className={`sidebar-kidcare ${!isSidebarOpen ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}
    initial={false} animate={{ width: isSidebarOpen ? 280 : 80 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
  >
    <div className="sidebar-brand">
      <motion.div className="brand-logo" whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
        <div className="brand-logo" style={{ 
  backgroundImage: `url(${logoImage})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}}>
  {!logoImage && <span>KC</span>}
</div>
      </motion.div>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div className="brand-text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <h2>KidCare Clinic</h2>
            <span>Pediatric Excellence</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <nav className="nav-menu">
      {sidebarItems.map((item, index) => (
        <motion.div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
          whileHover={{ x: 4, backgroundColor: 'rgba(79, 195, 247, 0.08)' }} whileTap={{ scale: 0.98 }}
        >
          <motion.i className={`fa-solid ${item.icon}`} whileHover={{ rotate: 15, scale: 1.2 }} transition={{ type: 'spring', stiffness: 300 }}></motion.i>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
      
          {activePage === item.id && <motion.div className="active-indicator" layoutId="activeIndicator" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
        </motion.div>
      ))}
    </nav>

    <motion.button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <i className={`fa-solid fa-chevron-${isSidebarOpen ? 'left' : 'right'}`}></i>
    </motion.button>
  </motion.aside>
);

export default Sidebar;