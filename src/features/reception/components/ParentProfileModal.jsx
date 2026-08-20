import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ChildDetailsModal from '../components/ChildDetailsModal';

export default function ParentProfileModal({ isOpen, onClose, parentId, onUpdate }) {
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  
  const [selectedChildId, setSelectedChildId] = useState(null);

  const [formValues, setFormValues] = useState({
    email: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen && parentId) {
      fetchProfile();
    }
  }, [isOpen, parentId]);

  useEffect(() => {
    if (parent) {
      setFormValues({
        email: parent.email || '',
        phone_number: parent.phone_number || '',
        address: parent.address || '',
      });
    }
  }, [parent]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/parentProfile?parent_id=${parentId}`);
      setParent(res.data?.user);
    } catch (err) {
      setError('Failed to load profile from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const formatPhoneNumber = (phone) => {
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('09')) {
      cleanPhone = '963' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('00963')) {
      cleanPhone = cleanPhone.replace('00963', '963');
    } else if (cleanPhone.startsWith('+963')) {
      cleanPhone = cleanPhone.replace('+963', '963');
    } else if (!cleanPhone.startsWith('963')) {
      cleanPhone = '963' + cleanPhone;
    }
    return cleanPhone;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formattedPhone = formatPhoneNumber(formValues.phone_number);

    const formData = {
      parent_id: parentId,
      email: formValues.email.trim(),
      phone_number: formattedPhone,
      address: formValues.address.trim(),
    };

    try {
      const res = await api.put('/updateparentProfile', formData);
      const updated = res.data?.user;
      setParent(updated);
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChildSuccess = (newChild) => {
    setParent(prev => ({
      ...prev,
      children: [...(prev.children || []), newChild]
    }));
    setShowAddChild(false);
  };

  const handleChildDeleted = (deletedChildId) => {
    setParent(prev => ({
      ...prev,
      children: (prev.children || []).filter(c => (c.id || c.child_id) !== deletedChildId)
    }));
    setSelectedChildId(null);
  };

  const getChildImage = (child) => {
    if (child?.image && !child.image.includes('girl.png') && !child.image.includes('boy.png')) {
      return child.image;
    }
    return child?.gender?.toLowerCase() === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div className="form-card modal-content modal-xl" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3 className="card-title">
            {isEditing ? 'Edit Parent Profile' : 'Parent Profile'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', padding: '10px 15px', background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="form-body text-center" style={{ padding: '40px' }}>
            <p>Loading profile...</p>
          </div>
        ) : parent ? (
          <div className="form-body">
            {!isEditing ? (
              <div className="profile-view">
                <div className="profile-header">
                  <div className="profile-avatar-lg">
                    {parent.first_name?.charAt(0)}{parent.last_name?.charAt(0)}
                  </div>
                  <div className="profile-header-info">
                    <h2>{parent.first_name} {parent.last_name}</h2>
                    <p className="profile-id">ID: #{parent.id}</p>
                  </div>
                </div>

                <div 
                  className="profile-details-grid" 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
                    gap: '14px', 
                    margin: '20px 0' 
                  }}
                >
                  <div className="detail-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Email</span>
                    <div className="detail-value" style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{parent.email || 'N/A'}</div>
                  </div>

                  <div className="detail-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Phone Number</span>
                    <div className="detail-value" style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{parent.phone_number || 'N/A'}</div>
                  </div>

                  <div className="detail-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                    <span className="detail-label" style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Address</span>
                    <div className="detail-value" style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', wordBreak: 'break-word' }}>{parent.address || 'Not specified'}</div>
                  </div>
                </div>

                <div className="children-section" style={{ marginTop: '25px' }}>
                  <div className="children-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4>Children ({parent.children?.length || 0})</h4>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowAddChild(true)}>
                      + Add Child
                    </button>
                  </div>

                  {parent.children?.length > 0 ? (
                    <div className="children-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                      {parent.children.map((child, idx) => {
                        const targetId = child.id || child.child_id;
                        return (
                          <div 
                            key={targetId || idx} 
                            className="child-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (targetId) {
                                setSelectedChildId(targetId);
                              }
                            }}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '12px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              background: '#f8fafc'
                            }}
                          >
                            <img
                              src={getChildImage(child)}
                              alt={child.first_name}
                              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }}
                              onError={(e) => { e.target.src = 'https://kidcare.sy/images/girl.png'; }}
                            />
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{child.first_name}</div>
                            <span style={{ fontSize: '11px', color: '#3b82f6' }}>Click to view details</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted">No children registered yet</p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone_number" 
                      className="form-input" 
                      placeholder="963xxxxxxxx"
                      value={formValues.phone_number} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" className="form-input" value={formValues.email} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" className="form-input" value={formValues.address} onChange={handleInputChange} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        ) : null}

        {!isEditing && (
          <div className="form-actions" style={{ borderTop: '1px solid #e2e8f0', padding: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>

      {selectedChildId && (
        <ChildDetailsModal
          isOpen={!!selectedChildId}
          childId={selectedChildId}
          onClose={() => setSelectedChildId(null)}
          onChildDeleted={handleChildDeleted}
        />
      )}

      {showAddChild && (
        <AddChildModal
          isOpen={showAddChild}
          onClose={() => setShowAddChild(false)}
          parentId={parentId}
          onSuccess={handleAddChildSuccess}
        />
      )}
    </div>
  );
}

function AddChildModal({ isOpen, onClose, parentId, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = e.target;
    const formData = new FormData();

    formData.append('parent_id', parentId);
    formData.append('first_name', form.first_name.value.trim());
    formData.append('last_name', form.last_name.value.trim());
    formData.append('gender', form.gender.value.toLowerCase());
    formData.append('birth_date', form.birth_date.value);
    formData.append('blood_type', form.blood_type.value);
    formData.append('medical_history', form.medical_history.value.trim());
    formData.append('allergies', form.allergies.value.trim());

    if (form.image.files[0]) {
      formData.append('image', form.image.files[0]);
    }

    try {
      const res = await api.post('/children', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess?.(res.data?.child || res.data?.data || res.data);
      onClose();
    } catch (err) {
      console.error('Add child error:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to add child.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="form-card modal-content modal-md" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3>Add New Child</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-body">
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>First Name *</label>
            <input type="text" name="first_name" placeholder="First Name" required className="form-input" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Last Name *</label>
            <input type="text" name="last_name" placeholder="Last Name" required className="form-input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Gender *</label>
              <select name="gender" className="form-input" defaultValue="female">
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Blood Type *</label>
              <select name="blood_type" className="form-input" defaultValue="A+">
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

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Birth Date *</label>
            <input type="date" name="birth_date" required className="form-input" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Medical History</label>
            <input type="text" name="medical_history" placeholder="Medical History" className="form-input" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Allergies</label>
            <input type="text" name="allergies" placeholder="Allergies" className="form-input" />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Child Photo (Optional)</label>
            <input type="file" name="image" accept="image/*" className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Child'}
          </button>
        </form>
      </div>
    </div>
  );
}