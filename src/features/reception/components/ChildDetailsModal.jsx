import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

export default function ChildDetailsModal({ isOpen, childId, onClose, onChildDeleted }) {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(false);
  const [recordingVaccine, setRecordingVaccine] = useState(false);

  const [vaccineForm, setVaccineForm] = useState({
    vaccine_id: '',
    given_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentType, setAppointmentType] = useState('upcoming');

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    blood_type: 'A+',
    medical_history: '',
    allergies: ''
  });

  const formatDateString = (dateStr) => {
    if (!dateStr) return 'N/A';
    return String(dateStr).split('T')[0].split(' ')[0];
  };

  useEffect(() => {
    if (isOpen && childId) {
      fetchChildData();
    }
  }, [isOpen, childId]);

  useEffect(() => {
    if (isOpen && childId && activeTab === 'vaccines') {
      fetchVaccines();
    }
  }, [isOpen, childId, activeTab]);

  useEffect(() => {
    if (isOpen && childId && activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [isOpen, childId, activeTab]);

  const fetchChildData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/children/${childId}`);
      const data = res.data?.data || res.data;
      setChild(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        gender: data.gender ? data.gender.toLowerCase() : 'male',
        blood_type: data.blood_type || 'A+',
        medical_history: data.medical_history || '',
        allergies: data.allergies || ''
      });
    } catch (err) {
      console.error('Failed to fetch child:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    setVaccinesLoading(true);
    try {
      const res = await api.get(`/vaccines/child-history/${childId}`);
      setVaccines(res.data?.records || []);
    } catch (err) {
      console.error('Failed to fetch vaccine history:', err);
    } finally {
      setVaccinesLoading(false);
    }
  };

  const handleRecordVaccine = async (e) => {
    e.preventDefault();
    if (!vaccineForm.vaccine_id) {
      alert('Please enter a Vaccine ID');
      return;
    }
    setRecordingVaccine(true);
    try {
      const formData = new FormData();
      formData.append('child_id', childId);
      formData.append('vaccine_id', vaccineForm.vaccine_id);
      formData.append('given_date', vaccineForm.given_date);
      formData.append('notes', vaccineForm.notes);

      await api.post('/reception/child-vaccinations', formData);
      alert('Vaccine record added successfully');
      setVaccineForm({
        vaccine_id: '',
        given_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchVaccines();
    } catch (err) {
      console.error('Failed to record vaccine:', err);
      alert('Failed to record vaccine given.');
    } finally {
      setRecordingVaccine(false);
    }
  };

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const upcomingRes = await api.get(`/appointments/upcoming/${childId}`);
      setUpcomingAppointments(upcomingRes.data?.appointments || []);

      const pastRes = await api.get(`/appointments/past/${childId}`);
      setPastAppointments(pastRes.data?.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this child profile?')) return;
    try {
      await api.delete(`/children/${childId}`);
      onChildDeleted?.(childId);
      onClose();
    } catch (err) {
      alert('Failed to delete child');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('first_name', editForm.first_name);
      formData.append('last_name', editForm.last_name);
      formData.append('gender', editForm.gender.toLowerCase());
      formData.append('blood_type', editForm.blood_type);
      formData.append('medical_history', editForm.medical_history);
      formData.append('allergies', editForm.allergies);
      formData.append('parent_id', child.parent_id);

      await api.post(`/children/${childId}`, formData);
      await fetchChildData();
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update child details');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={onClose}>
      <div className="form-card modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{child ? `${child.first_name}'s Profile` : 'Child Details'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading Child Info...</div>
        ) : child ? (
          <div className="form-body">
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <button 
                onClick={() => setActiveTab('details')}
                style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'details' ? '2px solid #3b82f6' : 'none', fontWeight: 600, cursor: 'pointer', color: activeTab === 'details' ? '#3b82f6' : '#64748b' }}>
                Info & Edit
              </button>
              <button 
                onClick={() => setActiveTab('vaccines')}
                style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'vaccines' ? '2px solid #3b82f6' : 'none', fontWeight: 600, cursor: 'pointer', color: activeTab === 'vaccines' ? '#3b82f6' : '#64748b' }}>
                Vaccines Record
              </button>
              <button 
                onClick={() => setActiveTab('appointments')}
                style={{ padding: '8px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'appointments' ? '2px solid #3b82f6' : 'none', fontWeight: 600, cursor: 'pointer', color: activeTab === 'appointments' ? '#3b82f6' : '#64748b' }}>
                Appointments
              </button>
            </div>

            {activeTab === 'details' && (
              !isEditing ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <img 
                      src={child.image || (child.gender === 'male' ? 'https://kidcare.sy/images/boy.png' : 'https://kidcare.sy/images/girl.png')} 
                      alt="avatar" 
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://kidcare.sy/images/girl.png'; }}
                    />
                    <div>
                      <h2>{child.first_name} {child.last_name}</h2>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '5px', fontSize: '12px' }}>
                        Blood Type: {child.blood_type || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div><strong>Gender:</strong> {child.gender}</div>
                    <div><strong>Birth Date:</strong> {formatDateString(child.birth_date)}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Medical History:</strong> {child.medical_history || 'None'}</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Allergies:</strong> {child.allergies || 'None'}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Details</button>
                    <button className="btn" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDelete}>Delete Child</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" className="form-input" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" className="form-input" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gender</label>
                      <select className="form-input" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Blood Type</label>
                      <select className="form-input" value={editForm.blood_type} onChange={e => setEditForm({...editForm, blood_type: e.target.value})}>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Medical History</label>
                    <input type="text" className="form-input" value={editForm.medical_history} onChange={e => setEditForm({...editForm, medical_history: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Allergies</label>
                    <input type="text" className="form-input" value={editForm.allergies} onChange={e => setEditForm({...editForm, allergies: e.target.value})} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                </form>
              )
            )}

            {activeTab === 'vaccines' && (
              <div>
               
                <form onSubmit={handleRecordVaccine} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Confirm Given Vaccine</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Vaccine ID</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="Enter Vaccine ID (e.g. 1)"
                        value={vaccineForm.vaccine_id} 
                        onChange={e => setVaccineForm({...vaccineForm, vaccine_id: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Given Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={vaccineForm.given_date} 
                        onChange={e => setVaccineForm({...vaccineForm, given_date: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Notes</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Child was healthy, no side effects observed." 
                      value={vaccineForm.notes} 
                      onChange={e => setVaccineForm({...vaccineForm, notes: e.target.value})} 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={recordingVaccine}>
                    {recordingVaccine ? 'Recording...' : 'Record Vaccine'}
                  </button>
                </form>

                {/* History Table */}
                <h4 style={{ margin: '10px 0', color: '#1e293b' }}>Vaccine History</h4>
                {vaccinesLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Loading Vaccine History...</div>
                ) : vaccines.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px' }}>Vaccine Name</th>
                        <th style={{ padding: '10px' }}>Given Date</th>
                        <th style={{ padding: '10px' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccines.map((v) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{v.vaccine_name || v.name || `Vaccine #${v.vaccine_id}`}</td>
                          <td style={{ padding: '10px' }}>{formatDateString(v.given_date)}</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{v.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>
                    No vaccine records found for this child.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button 
                    onClick={() => setAppointmentType('upcoming')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '15px',
                      border: '1px solid #cbd5e1',
                      background: appointmentType === 'upcoming' ? '#3b82f6' : '#fff',
                      color: appointmentType === 'upcoming' ? '#fff' : '#475569',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Upcoming ({upcomingAppointments.length})
                  </button>
                  <button 
                    onClick={() => setAppointmentType('past')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '15px',
                      border: '1px solid #cbd5e1',
                      background: appointmentType === 'past' ? '#3b82f6' : '#fff',
                      color: appointmentType === 'past' ? '#fff' : '#475569',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Past ({pastAppointments.length})
                  </button>
                </div>

                {appointmentsLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Loading Appointments...</div>
                ) : (
                  <div>
                    {appointmentType === 'upcoming' ? (
                      upcomingAppointments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {upcomingAppointments.map((app) => (
                            <div key={app.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>Doctor: {app.doctor?.full_name} ({app.doctor?.department})</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Date: {formatDateString(app.date)} | Time: {app.time}</div>
                                <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>Price: ${app.price}</div>
                              </div>
                              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>No upcoming appointments.</div>
                      )
                    ) : (
                      pastAppointments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {pastAppointments.map((app) => (
                            <div key={app.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>Doctor: {app.doctor?.full_name} ({app.doctor?.department})</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Date: {formatDateString(app.date)} | Time: {app.time}</div>
                                <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>Price: ${app.price}</div>
                              </div>
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>No past appointments found.</div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}