import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

export default function ParentProfileModal({ isOpen, onClose, parentId, onUpdate }) {
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  // ✅ Controlled form state
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen && parentId) {
      fetchProfile();
    }
  }, [isOpen, parentId]);

  // ✅ لما parent يتغير، حدّث formValues
  useEffect(() => {
    if (parent) {
      setFormValues({
        first_name: parent.first_name || '',
        last_name: parent.last_name || '',
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = {
      parent_id: parentId,
      first_name: formValues.first_name.trim(),
      last_name: formValues.last_name.trim(),
      email: formValues.email.trim(),
      phone_number: formValues.phone_number.trim(),
      address: formValues.address.trim(),
    };

    console.log('Sending formData:', JSON.stringify(formData, null, 2));

    try {
      const res = await api.put('/updateparentProfile', formData);
      console.log('Response:', res.data);
      const updated = res.data?.user;
      setParent(updated);
      setIsEditing(false);
      onUpdate?.(updated);
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Failed to update profile';

      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).flat().join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      console.error('Error response:', errorData);
      console.error('Error status:', err.response?.status);
      setError(errorMessage);
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

  // ✅ دالة بتختار الصورة حسب الجنس
  const getChildImage = (child) => {
    // لو في صورة مخصصة غير الافتراضية
    if (child.image && !child.image.includes('girl.png') && !child.image.includes('boy.png')) {
      return child.image;
    }
    
    // اختار حسب الجنس
    return child.gender === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-card modal-content modal-xl" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3 className="card-title">
            {isEditing ? 'Edit Parent Profile' : 'Parent Profile'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="form-body text-center">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : error && !parent ? (
          <div className="form-body">
            <div className="alert alert-error">{error}</div>
            <button className="btn btn-primary" onClick={fetchProfile}>Try Again</button>
          </div>
        ) : parent ? (
          <>
            {isEditing ? (
              <form onSubmit={handleUpdate}>
                <div className="form-body">
                  {error && <div className="alert alert-error">{error}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input 
                        type="text" 
                        name="first_name" 
                        className="form-input" 
                        value={formValues.first_name} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input 
                        type="text" 
                        name="last_name" 
                        className="form-input" 
                        value={formValues.last_name} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone_number" 
                        className="form-input" 
                        value={formValues.phone_number} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        className="form-input" 
                        value={formValues.email} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      className="form-input" 
                      value={formValues.address} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 28px', margin: 0, background: 'rgba(79, 195, 247, 0.02)', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <div className="form-body">
                  {error && <div className="alert alert-error">{error}</div>}

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
                    <div className="profile-details">
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{parent.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value">{parent.phone_number}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Address</span>
                        <span className="detail-value">{parent.address || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="children-section">
                      <div className="children-header">
                        <h4>Children ({parent.children?.length || 0})</h4>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowAddChild(true)}>
                          + Add Child
                        </button>
                      </div>
                      {parent.children?.length > 0 ? (
                        <div className="children-grid">
                          {parent.children.map((child, idx) => (
                            <div key={idx} className="child-card">
                              <img
                                src={getChildImage(child)}
                                alt={child.first_name}
                                className="child-avatar"
                                onError={(e) => { e.target.src = 'https://kidcare.sy/images/girl.png'; }}
                              />
                              <span className="child-name">{child.first_name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No children registered yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✅ حذفت زر الحذف */}
                <div className="form-actions" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 28px', margin: 0, background: 'rgba(79, 195, 247, 0.02)', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}
      </div>

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = {
      parent_id: parentId.toString(),
      first_name: e.target.first_name.value.trim(),
      last_name: e.target.last_name.value.trim(),
      gender: e.target.gender.value,
      birth_date: e.target.birth_date.value,
      blood_type: e.target.blood_type.value,
      medical_history: e.target.medical_history.value.trim(),
      allergies: e.target.allergies.value.trim(),
    };

    try {
      const res = await api.post('/children', formData);
      onSuccess?.(res.data?.child);
      e.target.reset();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'An error occurred while adding the child';

      if (errorData?.errors) {
        errorMessage = Object.values(errorData.errors).flat().join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay child-modal-overlay" onClick={onClose}>
      <div className="form-card modal-content modal-md" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3 className="card-title">Add New Child</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="form-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span className="required">*</span></label>
              <input type="text" name="first_name" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span className="required">*</span></label>
              <input type="text" name="last_name" className="form-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-input">
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input type="date" name="birth_date" className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Blood Type</label>
            <select name="blood_type" className="form-input">
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Medical History</label>
            <textarea name="medical_history" className="form-input" rows="2" placeholder="Any previous medical conditions..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Allergies</label>
            <textarea name="allergies" className="form-input" rows="2" placeholder="Any known allergies..."></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Child'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}