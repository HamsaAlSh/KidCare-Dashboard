import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardTab from '../tabs/DashboardTab';
import AppointmentsTab from '../tabs/AppointmentsTab';
import AddAccountTab from '../tabs/ParentsTab';
import RevenueTab from '../tabs/RevenueTab';
import SettingsTab from '../tabs/SettingsTab';
import { appointments } from '../data/appointments';
import './ReceptionDashboard.css';

const pageTitles = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  'add-account': 'Add Account',
  revenue: 'Daily Revenue',
  settings: 'Settings',
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="date-display" style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
      <Clock size={14} />
      {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

export default function ReceptionDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handlePaymentToggle = useCallback((id) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.paid = !apt.paid;
      showToast(apt.paid ? 'Payment confirmed' : 'Payment cancelled');
    }
  }, [showToast]);

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">{pageTitles[activePage]}</div>
          <div className="top-bar-actions">
            <LiveClock />
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        {activePage === 'dashboard' && <DashboardTab />}
        {activePage === 'appointments' && <AppointmentsTab onPaymentToggle={handlePaymentToggle} />}
        {activePage === 'add-account' && <AddAccountTab onToast={showToast} />}
        {activePage === 'revenue' && <RevenueTab />}
        {activePage === 'settings' && <SettingsTab />}
      </main>

      {toast && (
        <div className="toast show">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}