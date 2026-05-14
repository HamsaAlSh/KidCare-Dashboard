import React, { useState } from 'react';
import { motion } from 'framer-motion';
import logoImage from '../../../assets/logo.jpg';
import './AdminDashboard.css';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house' },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor' },
  { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-days' },
  { id: 'patients', label: 'Patients', icon: 'fa-hospital-user' },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscopes' },
  { id: 'requests', label: 'Approvals', icon: 'fa-file-signature' },
  { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie' },
  { id: 'settings', label: 'Settings', icon: 'fa-gear' },
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data for the UI
  const [stats] = useState({ 
    monthlyBudget: 250000, dailyBudget: 32000, 
    topDoctor: 'Dr. Sarah Ahmed', activeDept: 'General Pediatrics',
    rem: { daily: 12000, monthly: 30000 }
  });

  const [pendingRequests] = useState([
    { id: 1, type: 'Add Doctor', doctor: 'Dr. Sarah Ahmed', date: 'May 11, 2024' },
    { id: 2, type: 'Shift Update', doctor: 'Dr. Sarah Ahmed', date: 'May 11, 2024' }
  ]);

  const renderContent = () => {
    if (activePage === 'dashboard') {
      return (
        <div className="dashboard-grid-content">
          {/* Pending Approvals Section */}
          <section className="dashboard-section">
            <h3 className="section-title">Pending Approvals</h3>
            <div className="requests-container">
              {pendingRequests.map(req => (
                <div key={req.id} className="request-card-item">
                  <div className="req-header">
                    <span className="req-label">{req.type}</span>
                    <small className="req-time">{req.date}</small>
                  </div>
                  <div className="req-details">
                    <div className="user-profile-mini">
                      <div className="avatar-placeholder">👤</div>
                      <div className="user-text">
                        <p>{req.doctor}</p>
                        <small>Pediatric Specialist</small>
                      </div>
                    </div>
                    <div className="btn-group">
                      <button className="btn-accept">Approve</button>
                      <button className="btn-decline">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Budget & Performance Section */}
          <section className="dashboard-stats-wrapper">
              <div className="stats-column">
                  <h3 className="section-title">Financial Overview</h3>
                  <StatCard title="Monthly Budget" value={`$${stats.monthlyBudget.toLocaleString()}`} sub={`Rem: $${stats.rem.monthly}`} icon="fa-wallet" color="blue" />
                  <StatCard title="Daily Budget" value={`$${stats.dailyBudget.toLocaleString()}`} sub={`Rem: $${stats.rem.daily}`} icon="fa-money-bill-transfer" color="orange" />
              </div>
              <div className="stats-column">
                  <h3 className="section-title">Performance Stats</h3>
                  <StatCard title="Top Performing Doctor" value={stats.topDoctor} sub="Pediatrics Dept" icon="fa-award" color="purple" />
                  <StatCard title="Most Active Dept" value={stats.activeDept} sub="150+ Visits/Week" icon="fa-stethoscope" color="pink" />
              </div>
          </section>
        </div>
      );
    }
    return <div className="placeholder-text">{activePage.charAt(0).toUpperCase() + activePage.slice(1)} page is coming soon...</div>;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
            <img src={logoImage} alt="KidCare" className="logo-img" />
            <h2>KidCare Clinic</h2>
        </div>
        <nav className="nav-menu">
          {sidebarItems.map(item => (
            <div 
              key={item.id} 
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <header className="main-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Admin</p>
          </div>
          <div className="header-right">
            <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search doctors, staff..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="action-icons">
              <button className="notif-btn"><i className="fa-regular fa-bell"></i></button>
              <button className="primary-action-btn">Quick Actions <i className="fa-solid fa-chevron-down"></i></button>
              <div className="admin-avatar">A</div>
            </div>
          </div>
        </header>

        <div className="content-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }) => (
    <motion.div whileHover={{ scale: 1.02 }} className={`stat-card-v2 ${color}`}>
      <div className="stat-icon-v2"><i className={`fa-solid ${icon}`}></i></div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <small className="stat-sub">{sub}</small>
      </div>
    </motion.div>
);

export default AdminDashboard;