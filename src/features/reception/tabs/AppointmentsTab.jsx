import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, User, Stethoscope, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import AppointmentModal from '../components/AppointmentModal';
import AddAppointmentModal from '../components/AddAppointmentModal';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals status
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // 1. Fetch All Appointments & Sort by Date/Time
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reception/appointments');
      const rawList = res.data?.appointments || res.data || [];

      // فرز المواعيد حسب التاريخ والوقت تصاعدياً
      const sortedList = Array.isArray(rawList)
        ? [...rawList].sort((a, b) => {
            const dateTimeA = new Date(`${a.date || ''} ${a.time || ''}`);
            const dateTimeB = new Date(`${b.date || ''} ${b.time || ''}`);
            return dateTimeA - dateTimeB;
          })
        : [];

      setAppointments(sortedList);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // دالة مساعدة لجلب اسم الطفل مع التعامل مع مختلف تنسيقات الـ API
  const getChildName = (apt) => {
    if (apt.child_first_name) return `${apt.child_first_name} ${apt.child_last_name || ''}`;
    if (apt.child?.first_name) return `${apt.child.first_name} ${apt.child.last_name || ''}`;
    if (apt.child_name) return apt.child_name;
    if (apt.patient_name) return apt.patient_name;
    return 'غير محدد';
  };

  // دالة مساعدة لجلب اسم الطبيب مع التعامل مع مختلف تنسيقات الـ API
  const getDoctorName = (apt) => {
    if (apt.doctor_first_name) return `Dr. ${apt.doctor_first_name} ${apt.doctor_last_name || ''}`;
    if (apt.doctor?.first_name) return `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name || ''}`;
    if (apt.doctor_name) return `Dr. ${apt.doctor_name}`;
    return 'غير محدد';
  };

  // Filter Search
  const filteredAppointments = appointments.filter((apt) => {
    const childName = getChildName(apt).toLowerCase();
    const doctorName = getDoctorName(apt).toLowerCase();
    const term = searchTerm.toLowerCase();
    return childName.includes(term) || doctorName.includes(term) || String(apt.id).includes(term);
  });

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge status-pending">Pending</span>;
    const st = status.toLowerCase();
    if (st.includes('مؤكد') || st.includes('confirmed')) return <span className="status-badge status-confirmed">{status}</span>;
    if (st.includes('مكتمل') || st.includes('completed')) return <span className="status-badge status-completed">{status}</span>;
    if (st.includes('إلغاء') || st.includes('cancelled') || st.includes('canceled')) return <span className="status-badge status-cancelled">{status}</span>;
    return <span className="status-badge status-pending">{status}</span>;
  };

  return (
    <div className="tab-container" style={{ padding: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by child, doctor or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Appointment
        </button>
      </div>

      {/* Appointments List / Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px' }}>ID</th>
                <th style={{ padding: '12px 16px' }}>Child</th>
                <th style={{ padding: '12px 16px' }}>Doctor</th>
                <th style={{ padding: '12px 16px' }}>Date & Time</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Price</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr 
                  key={apt.id} 
                  onClick={() => setSelectedAppointmentId(apt.id)}
                  style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>#{apt.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={15} color="#64748b" />
                      <span style={{ fontWeight: 600 }}>{getChildName(apt)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Stethoscope size={15} color="#64748b" />
                      <span>{getDoctorName(apt)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} color="#94a3b8" /> {apt.date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Clock size={13} color="#94a3b8" /> {apt.time}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {getStatusBadge(apt.status)}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>${apt.price || '0'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointmentId(apt.id);
                      }}
                      style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No appointments found.
        </div>
      )}

      {/* 1. Modal: Details & Edit */}
      {selectedAppointmentId && (
        <AppointmentModal 
          appointmentId={selectedAppointmentId} 
          onClose={() => setSelectedAppointmentId(null)} 
          onRefresh={fetchAppointments} 
        />
      )}

      {/* 2. Modal: Add New Appointment */}
      {showAddModal && (
        <AddAppointmentModal 
          onClose={() => setShowAddModal(false)} 
          onRefresh={fetchAppointments} 
        />
      )}

    </div>
  );
}