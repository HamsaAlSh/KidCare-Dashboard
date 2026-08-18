import React from 'react';
import { LayoutDashboard, CalendarDays, UserPlus, DollarSign, Syringe } from 'lucide-react';

import logoImage from "../../../assets/logo.jpg";

const menuItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'add-account', label: 'Add Account', icon: UserPlus },
];

export default function Sidebar({ activePage, onPageChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img 
            src={logoImage} 
            alt="KidCare Clinic"
            style={{ 
              width: 32, 
              height: 32, 
              objectFit: 'contain',
              borderRadius: 8,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          
          <div 
            style={{
              width: 32,
              height: 32,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4FC3F7',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span>KidCare Clinic</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">R</div>
          <div className="user-details">
            <span className="user-name">Reception User</span>
            <span className="user-role">Receptionist</span>
          </div>
        </div>
      </div>
    </aside>
  );
}