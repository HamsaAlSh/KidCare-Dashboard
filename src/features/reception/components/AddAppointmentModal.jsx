import React, { useState, useEffect } from 'react';
import { X, User, Building2, Stethoscope, Calendar, Clock, CheckCircle2, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import api from '../../../api/axios';

export default function AddAppointmentModal({ onClose, onRefresh }) {
  const [step, setStep] = useState(1);

  const [children, setChildren] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/children');
        setChildren(res.data?.children || []);
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data?.departments || []);
      setStep(2);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDept = async (dept) => {
    setSelectedDept(dept);
    try {
      setLoading(true);
      const res = await api.get(`/departments/${dept.id}/doctors`);
      setDoctors(res.data?.doctors || []);
      setStep(3);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doc) => {
    setSelectedDoctor(doc);
    try {
      setLoading(true);
      const res = await api.get(`/doctors/${doc.id}/availabilities`);
      setAvailabilities(res.data?.availabilities || []);
      setStep(4);
    } catch (err) {
      console.error('Error fetching doctor availabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDate = async () => {
    if (!selectedDate || selectedDate.length < 10) {
      return alert('Please select a valid date.');
    }

    try {
      setLoading(true);
      setAvailableTimes([]);

      const params = new URLSearchParams();
      params.append('date', selectedDate);

      const res = await api.post(`/doctors/${selectedDoctor.id}/available-times`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      setAvailableTimes(res.data?.times || []);
      setStep(5);
    } catch (err) {
      console.error('Error fetching available times:', err);
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTime) return alert('Please select a time slot.');
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('doctor_id', selectedDoctor.id);
      formData.append('child_id', selectedChild.id);
      formData.append('date', selectedDate);
      formData.append('time', selectedTime);

      const res = await api.post('/reception/appointments', formData);

      if (res.data?.status === 'success') {
        alert('Appointment booked successfully!');
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      console.error('Error booking appointment:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: '520px', margin: '20px',
        borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
       
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <ArrowLeft size={18} color="#64748b" />
              </button>
            )}
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Book New Appointment</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={20} color="#94a3b8" />
          </button>
        </div>

        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '12px' }}>
          {selectedChild && <span style={chipStyle}><User size={12} /> {selectedChild.first_name} {selectedChild.last_name}</span>}
          {selectedDept && <span style={chipStyle}><Building2 size={12} /> {selectedDept.name}</span>}
          {selectedDoctor && <span style={chipStyle}><Stethoscope size={12} /> Dr. {selectedDoctor.first_name}</span>}
          {selectedDate && <span style={chipStyle}><Calendar size={12} /> {selectedDate}</span>}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          </div>
        ) : (
          <div>
            
            {step === 1 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>1. Select Patient (Child):</p>
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {children.map((child) => (
                    <div 
                      key={child.id} 
                      onClick={() => handleSelectChild(child)}
                      style={cardSelectStyle}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={18} color="#3b82f6" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{child.first_name} {child.last_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Parent: {child.parent_name || 'N/A'}</div>
                        </div>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {step === 2 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>2. Select Department:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {departments.map((dept) => (
                    <div key={dept.id} onClick={() => handleSelectDept(dept)} style={cardSelectStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building2 size={18} color="#10b981" />
                        <span style={{ fontWeight: 600 }}>{dept.name}</span>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {step === 3 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>3. Select Doctor:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {doctors.map((doc) => (
                    <div key={doc.id} onClick={() => handleSelectDoctor(doc)} style={cardSelectStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Stethoscope size={18} color="#8b5cf6" />
                        <span style={{ fontWeight: 600 }}>Dr. {doc.first_name} {doc.last_name}</span>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {step === 4 && (
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>4. Select Date:</p>
                <input 
                  type="date" 
                  value={selectedDate}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', outline: 'none' }}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                
                {availabilities.length > 0 && (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                    <strong>Doctor Working Days:</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {availabilities.map((av) => (
                        <li key={av.id}>{av.day_of_week} ({av.start_time} - {av.end_time})</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleConfirmDate}
                  disabled={!selectedDate}
                  style={{
                    width: '100%', padding: '10px', background: selectedDate ? '#3b82f6' : '#cbd5e1', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: selectedDate ? 'pointer' : 'not-allowed', fontWeight: 'bold'
                  }}
                >
                  Continue to Select Time
                </button>
              </div>
            )}

            
            {step === 5 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>5. Select Time Slot:</p>
                  <button 
                    onClick={() => setStep(4)} 
                    style={{ border: 'none', background: 'transparent', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Change Date
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                          background: selectedTime === time ? '#3b82f6' : '#fff',
                          color: selectedTime === time ? '#fff' : '#000',
                          cursor: 'pointer', fontWeight: 600, fontSize: '13px'
                        }}
                      >
                        {time}
                      </button>
                    ))
                  ) : (
                    <p style={{ gridColumn: 'span 3', color: '#ef4444', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
                      No available times found on this date.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleBookAppointment}
                  disabled={submitting || !selectedTime}
                  style={{
                    width: '100%', padding: '12px', background: selectedTime ? '#10b981' : '#cbd5e1', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: selectedTime ? 'pointer' : 'not-allowed', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />} Book Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


const chipStyle = {
  background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px',
  display: 'flex', alignItems: 'center', gap: '4px', color: '#475569'
};

const cardSelectStyle = {
  padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  cursor: 'pointer', transition: 'background 0.2s'
};