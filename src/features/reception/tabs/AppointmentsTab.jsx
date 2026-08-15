import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle, CalendarDays, Clock, Stethoscope } from 'lucide-react';
import api from '../../../api/axios';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },    
  { id: 'completed', label: 'Completed' },  
];

const statusMap = {
  'مكتمل': 'completed',
  'مؤكد': 'confirmed',
  'pending': 'pending',
  'cancelled': 'cancelled',
};

const getStatusClass = (status) => {
  const mapped = statusMap[status] || 'unknown';
  
  const classes = {
    confirmed: 'status-upcoming',
    completed: 'status-completed',
    pending: 'status-pending',
  };
  
  return classes[mapped] || 'status-pending';
};

const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  if (statusMap[status] === 'confirmed') return 'Upcoming';
  if (statusMap[status] === 'completed') return 'Completed';
  return status;
};

export default function AppointmentsTab() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [children, setChildren] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const appointmentsRes = await api.get('/reception/appointments');
      console.log('✅ Appointments API:', appointmentsRes.data);
      const appts = appointmentsRes.data?.appointments || [];
      setAppointments(appts);

      console.log('📋 Statuses in appointments:', appts.map(a => ({ id: a.id, status: a.status, statusType: typeof a.status })));

      const childrenRes = await api.get('/children');
      console.log('✅ Children API:', childrenRes.data);
      setChildren(childrenRes.data?.children || []);

      const allDoctors = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const res = await api.get(`/doctors?page=${page}`);
          const docs = res.data?.data || [];
          allDoctors.push(...docs);
          hasMore = docs.length === 10;
          page++;
        } catch (err) {
          console.error('Failed to fetch doctors page', page, err);
          break;
        }
      }

      console.log('✅ Total doctors fetched:', allDoctors.length);
      setDoctors(allDoctors);

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getChildName = (childId) => {
    const child = children.find(c => c.id === childId || c.id === Number(childId));
    return child ? `${child.first_name} ${child.last_name}` : `Child #${childId}`;
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId || d.id === Number(doctorId));
    
    if (doctor) {
      return doctor.full_name;
    }
    
    console.log(`🔍 Doctor not found: ID=${doctorId} (type: ${typeof doctorId}), Available IDs:`, doctors.map(d => d.id));
    return `Doctor #${doctorId}`;
  };

  const getChildImage = (childId) => {
    const child = children.find(c => c.id === childId || c.id === Number(childId));
    if (!child) return 'https://kidcare.sy/images/boy.png';
    
    if (child.image && !child.image.includes('girl.png') && !child.image.includes('boy.png')) {
      return child.image;
    }
    
    return child.gender === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  const filtered = appointments.filter(a => {
    const mappedStatus = statusMap[a.status];
    
    if (filter === 'upcoming') return mappedStatus === 'confirmed';
    if (filter === 'completed') return mappedStatus === 'completed';
    return true;
  }).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    const childName = getChildName(a.child_id).toLowerCase();
    const doctorName = getDoctorName(a.doctor_id).toLowerCase();
    return childName.includes(q) || doctorName.includes(q) || a.date?.includes(q);
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16, color: '#90A4AE' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        background: '#ffebee', 
        color: '#c62828', 
        padding: 16, 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={18} color="#6a6a8a" />
          <input 
            type="text" 
            placeholder="Search child or doctor..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="filter-tabs">
          {filters.map(f => (
            <button 
              key={f.id} 
              className={`filter-tab ${filter === f.id ? 'active' : ''}`} 
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="content-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Child</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={getChildImage(a.child_id)} 
                        alt={getChildName(a.child_id)}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://kidcare.sy/images/boy.png'; }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{getChildName(a.child_id)}</p>
                        <p style={{ fontSize: 12, color: '#90A4AE' }}>ID: #{a.child_id}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stethoscope size={16} color="#90A4AE" />
                      <span>{getDoctorName(a.doctor_id)}</span>
                    </div>
                  </td>
                  
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <CalendarDays size={14} color="#90A4AE" />
                        {formatDate(a.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#90A4AE' }}>
                        <Clock size={14} color="#90A4AE" />
                        {a.time}
                      </span>
                    </div>
                  </td>
                  
                  <td>
                    <span style={{ fontWeight: 600, color: '#4FC3F7' }}>
                      ${a.price}
                    </span>
                  </td>
                  
                  <td>
                    <span 
                      className={`status-badge ${getStatusClass(a.status)}`}
                      title={`Raw status: ${a.status}`}
                    >
                      {getStatusLabel(a.status)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">No appointments found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}