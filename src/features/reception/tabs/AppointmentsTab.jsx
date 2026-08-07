import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { appointments } from '../data/appointments';
import AppointmentRow from '../components/AppointmentRow';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'current', label: 'Current' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'unpaid', label: 'Unpaid' },
];

export default function AppointmentsTab({ onPaymentToggle }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = appointments.filter(a => {
    if (filter === 'current') return a.status === 'current';
    if (filter === 'upcoming') return a.status === 'upcoming';
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'unpaid') return !a.paid;
    return true;
  }).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={18} color="#6a6a8a" />
          <input type="text" placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {filters.map(f => (
            <button key={f.id} className={`filter-tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="content-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map(a => <AppointmentRow key={a.id} apt={a} showActions onPaymentToggle={onPaymentToggle} />) : <tr><td colSpan="6"><div className="empty-state">No results found</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}