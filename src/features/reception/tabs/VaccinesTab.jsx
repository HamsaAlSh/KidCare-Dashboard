import React, { useState, useEffect } from 'react';
import { Syringe, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '../../../api/axios';

const VaccinesTab = ({ onToast }) => {
  const [activeTab, setActiveTab] = useState('vaccines');
  const [vaccines, setVaccines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [childHistory, setChildHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState('');

  const [newSchedule, setNewSchedule] = useState({ 
    vaccine_id: '', 
    date: '',
    start_time: '',
    end_time: ''
  });
  
  const [childVaccination, setChildVaccination] = useState({ 
    child_id: '', 
    vaccine_id: '', 
    given_date: '', 
    notes: '' 
  });

  useEffect(() => {
    fetchVaccines();
    fetchSchedules();
  }, []);

  const fetchVaccines = async () => {
    try {
      const res = await api.get('/vaccines');
      const data = Array.isArray(res.data?.vaccines || res.data?.data || res.data) 
        ? (res.data?.vaccines || res.data?.data || res.data)
        : [];
      setVaccines(data);
    } catch (err) {
      onToast?.('Failed to fetch vaccines', 'error');
      setVaccines([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/vaccines/available-schedules');
      const data = Array.isArray(res.data?.schedules || res.data?.data || res.data) 
        ? (res.data?.schedules || res.data?.data || res.data)
        : [];
      setSchedules(data);
    } catch (err) {
      onToast?.('Failed to fetch schedules', 'error');
      setSchedules([]);
    }
  };



  const fetchChildHistory = async (childId) => {
    if (!childId) return;
    try {
      const res = await api.get(`/vaccines/child-history/${childId}`);
      const data = Array.isArray(res.data?.records || res.data?.data || res.data)
        ? (res.data?.records || res.data?.data || res.data)
        : [];
      setChildHistory(data);
    } catch (err) {
      onToast?.('Failed to fetch vaccination history', 'error');
      setChildHistory([]);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    if (!newSchedule.vaccine_id || !newSchedule.date || !newSchedule.start_time || !newSchedule.end_time) {
      onToast?.('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        vaccine_id: parseInt(newSchedule.vaccine_id, 10),
        date: newSchedule.date,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time
      };

      await api.post('/reception/vaccine-schedules', scheduleData);
      
      onToast?.('Schedule created successfully! ✓', 'success');
      setNewSchedule({ vaccine_id: '', date: '', start_time: '', end_time: '' });
      fetchSchedules();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create schedule';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVaccination = async (e) => {
    e.preventDefault();
    
    if (!childVaccination.child_id || !childVaccination.vaccine_id || !childVaccination.given_date) {
      onToast?.('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const vaccinationData = {
        child_id: parseInt(childVaccination.child_id, 10),
        vaccine_id: parseInt(childVaccination.vaccine_id, 10),
        given_date: childVaccination.given_date,
        notes: childVaccination.notes.trim() || null
      };

      await api.post('/reception/child-vaccinations', vaccinationData);
      
      onToast?.('Vaccination recorded successfully! ✓', 'success');
      setChildVaccination({ child_id: '', vaccine_id: '', given_date: '', notes: '' });
      
      if (selectedChildId === childVaccination.child_id) {
        fetchChildHistory(childVaccination.child_id);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to record vaccination';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleViewChildHistory = (childId) => {
    setSelectedChildId(childId);
    fetchChildHistory(childId);
  };

  const handleUpdateScheduleStatus = async (scheduleId, newStatus) => {
    setLoading(true);
    try {
      await api.put(`/reception/vaccine-schedules/${scheduleId}/status`, {
        status: newStatus
      });
      
      onToast?.('Schedule status updated! ✓', 'success');
      fetchSchedules();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update status';
      onToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-container" style={{ padding: '0px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'vaccines', label: 'Available Vaccines', icon: Syringe },
          { id: 'schedule', label: 'Create Schedule', icon: Calendar },
          { id: 'available', label: 'Available Schedules', icon: Clock },
          { id: 'record', label: 'Record Vaccination', icon: CheckCircle },
          { id: 'history', label: 'Child History', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`btn ${activeTab === id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === id ? '#0284c7' : '#ffffff',
              color: activeTab === id ? '#ffffff' : '#64748b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>


      {activeTab === 'vaccines' && (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            Available Vaccines ({vaccines.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Min Age</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Max Age</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.length > 0 ? (
                  vaccines.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0284c7', fontSize: '14px' }}>#{v.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{v.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {v.min_age_months !== undefined && v.min_age_months !== null ? `${v.min_age_months}mo` : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {v.max_age_months !== undefined && v.max_age_months !== null ? `${v.max_age_months}mo` : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px' }}>{v.description || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: '14px' }}>
                      No vaccines available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div style={{ maxWidth: '540px', margin: '0 auto', backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#0284c7" /> Create Vaccination Schedule
          </h3>
          <form onSubmit={handleCreateSchedule}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Select Vaccine *</label>
              <select
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                value={newSchedule.vaccine_id}
                onChange={(e) => setNewSchedule({ ...newSchedule, vaccine_id: e.target.value })}>
                <option value="">Select Vaccine...</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (ID: {v.id})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Date *</label>
              <input
                type="date"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Start Time *</label>
                <input
                  type="time"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>End Time *</label>
                <input
                  type="time"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}>
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'available' && (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            Available Vaccination Schedules ({schedules.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Vaccine</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Start Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>End Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {s.vaccine?.name || s.vaccine_name || 'Vaccine'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {s.date || s.scheduled_date?.split('T')[0] || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {s.start_time || s.scheduled_date?.split('T')[1]?.slice(0, 5) || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {s.end_time || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                        <span style={{
                          backgroundColor: s.status === 'available' ? '#dcfce7' : s.status === 'finished' ? '#fee2e2' : '#fef3c7',
                          color: s.status === 'available' ? '#166534' : s.status === 'finished' ? '#991b1b' : '#92400e',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {s.status || 'available'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {s.status !== 'finished' && (
                            <button
                              onClick={() => handleUpdateScheduleStatus(s.id, 'finished')}
                              disabled={loading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                              }}>
                              Finish
                            </button>
                          )}
                          {s.status === 'finished' && (
                            <button
                              onClick={() => handleUpdateScheduleStatus(s.id, 'available')}
                              disabled={loading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                              }}>
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: '14px' }}>
                      No schedules available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'record' && (
        <div style={{ maxWidth: '540px', margin: '0 auto', backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#0284c7" /> Record Child Vaccination
          </h3>
          <form onSubmit={handleRecordVaccination}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Child ID *</label>
              <input
                type="text"
                required
                placeholder="Enter Child Unique ID"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                value={childVaccination.child_id}
                onChange={(e) => setChildVaccination({ ...childVaccination, child_id: e.target.value })}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Select Vaccine *</label>
              <select
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                value={childVaccination.vaccine_id}
                onChange={(e) => setChildVaccination({ ...childVaccination, vaccine_id: e.target.value })}>
                <option value="">Select Vaccine...</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Date Given *</label>
              <input
                type="date"
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
                value={childVaccination.given_date}
                onChange={(e) => setChildVaccination({ ...childVaccination, given_date: e.target.value })}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Notes / Doctor Remarks</label>
              <textarea
                rows="3"
                placeholder="Optional notes or observations..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', resize: 'vertical' }}
                value={childVaccination.notes}
                onChange={(e) => setChildVaccination({ ...childVaccination, notes: e.target.value })}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
              }}>
              {loading ? 'Recording...' : 'Record Vaccination'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
            Child Vaccination History
          </h3>
          
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter Child ID..."
              style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' }}
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
            />
            <button
              onClick={() => handleViewChildHistory(selectedChildId)}
              disabled={!selectedChildId || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: (!selectedChildId || loading) ? 'not-allowed' : 'pointer',
                opacity: (!selectedChildId || loading) ? 0.7 : 1
              }}>
              {loading ? 'Loading...' : 'View History'}
            </button>
          </div>

          {childHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Vaccine</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Date Given</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {childHistory.map((record, idx) => (
                    <tr key={record.id || idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {record.vaccine_name || record.vaccine?.name || 'Unknown'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px' }}>
                        {record.given_date || record.date || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px' }}>
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedChildId ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: '14px' }}>
              No vaccination history found for this child
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: '14px' }}>
              Enter a Child ID and click "View History" to see vaccination records
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VaccinesTab;
