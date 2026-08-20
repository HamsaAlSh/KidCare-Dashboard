import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Calendar, Clock, User, Stethoscope, Save, Loader2 } from 'lucide-react';
import api from '../../../api/axios';

export default function AppointmentModal({ appointmentId, onClose, onUpdated, onDeleted }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    time: '',
    child_id: '',
    doctor_id: '',
    date: '',
    price: '',
    status: ''
  });

  const formatTimeHHMM = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeStr;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/appointments/${appointmentId}`);
        const appt = res.data?.appointment;
        setDetails(appt);
        if (appt) {
          setEditForm({
            time: formatTimeHHMM(appt.time),
            child_id: appt.child_id || '',
            doctor_id: appt.doctor_id || '',
            date: appt.date || '',
            price: appt.price || '',
            status: appt.status || ''
          });
        }
      } catch (err) {
        console.error('Error fetching appointment details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) fetchDetails();
  }, [appointmentId]);

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const formattedTime = formatTimeHHMM(editForm.time);

      const params = new URLSearchParams();
      if (formattedTime) params.append('time', formattedTime);
      if (editForm.child_id) params.append('child_id', editForm.child_id);
      if (editForm.doctor_id) params.append('doctor_id', editForm.doctor_id);
      if (editForm.date) params.append('date', editForm.date);
      if (editForm.price) params.append('price', editForm.price);
      if (editForm.status) params.append('status', editForm.status);

      const res = await api.put(
        `/reception/appointments/${appointmentId}`, 
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const updatedApt = res.data?.appointment || { id: appointmentId, ...editForm, ...details };

      setDetails(updatedApt);
      setIsEditing(false);

      if (onUpdated) {
        onUpdated(updatedApt);
      }

      onClose();
    } catch (err) {
      console.error('Error updating appointment:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      setSaving(true);
      
      await api.delete(`/reception/appointments/${appointmentId}`, {
        data: {}
      });

      if (onDeleted) {
        onDeleted(appointmentId);
      }

      onClose();
    } catch (err) {
      console.error('Error deleting appointment:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setSaving(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    const st = status.toLowerCase();
    if (st.includes('مؤكد') || st.includes('confirmed')) return 'status-confirmed';
    if (st.includes('مكتمل') || st.includes('completed')) return 'status-completed';
    if (st.includes('إلغاء') || st.includes('cancelled') || st.includes('canceled')) return 'status-cancelled';
    return 'status-pending';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="content-card" style={{ width: '100%', maxWidth: '480px', margin: '20px', padding: '24px', borderRadius: '16px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Appointment Details #{appointmentId}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} color="#90A4AE" />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : details ? (
          <div>
            {!isEditing ? (
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`status-badge ${getStatusClass(details.status)}`}>
                    {details.status}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '18px', color: '#4FC3F7' }}>
                    ${details.price}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} color="#90A4AE" />
                    <span><strong>Child ID:</strong> #{details.child_id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Stethoscope size={16} color="#90A4AE" />
                    <span><strong>Doctor ID:</strong> #{details.doctor_id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} color="#90A4AE" />
                    <span><strong>Date:</strong> {details.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} color="#90A4AE" />
                    <span><strong>Time:</strong> {details.time}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => setIsEditing(true)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={saving}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Child ID</label>
                  <input 
                    type="text" 
                    value={editForm.child_id} 
                    onChange={e => setEditForm({ ...editForm, child_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Doctor ID</label>
                  <input 
                    type="text" 
                    value={editForm.doctor_id} 
                    onChange={e => setEditForm({ ...editForm, doctor_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Time (HH:MM)</label>
                  <input 
                    type="time" 
                    value={editForm.time} 
                    onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Date</label>
                  <input 
                    type="date" 
                    value={editForm.date} 
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Save size={16} /> Save Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    style={{ flex: 1, padding: '10px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Appointment not found.</p>
        )}
      </div>
    </div>
  );
}