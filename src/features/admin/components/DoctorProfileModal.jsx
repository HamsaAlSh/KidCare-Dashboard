import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const DoctorProfileModal = ({ show, doctor, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [editFiles, setEditFiles] = useState({ profile_picture: null, cv: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!doctor) return null;

  const baseUrl = 'http://127.0.0.1:8000';

  const getImageUrl = () => {
    if (doctor.profile_picture) {
      return `${baseUrl}/storage/${doctor.profile_picture}`;
    }
    return null;
  };

  const getCvUrl = () => {
    if (doctor.cv) {
      return `${baseUrl}/storage/${doctor.cv}`;
    }
    return null;
  };

  const getAvatarLetters = () => {
    const first = doctor.first_name?.[0] || '';
    const last = doctor.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#22c55e';
      case 'Busy': return '#ef4444';
      case 'Out of Schedule': return '#6a6a8a';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Available': return 'Available';
      case 'Busy': return 'Busy';
      case 'Out of Schedule': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDay = (day) => day;

  const startEditing = () => {
    setEditData({
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      phone_number: doctor.phone_number || '',
      email: doctor.email || '',
      address: doctor.address || '',
      gender: doctor.gender || 'male',
      education: doctor.education || '',
      experience_years: doctor.experience_years ?? '',
      fee: doctor.fee ?? '',
      commission_percentage: doctor.commission_percentage ?? '',
      department_id: doctor.department?.id ?? '',
    });
    setEditFiles({ profile_picture: null, cv: null });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setEditFiles({ profile_picture: null, cv: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'gender' ? value.toLowerCase() : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setEditFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      const fields = [
        'first_name', 'last_name', 'phone_number', 'email',
        'address', 'gender', 'education', 'experience_years',
        'fee', 'commission_percentage', 'department_id'
      ];

      fields.forEach(key => {
        const value = editData[key];
        if (value === '' || value === null || value === undefined) {
          formData.append(key, '');
        } else {
          formData.append(key, value);
        }
      });

      if (editFiles.profile_picture) {
        formData.append('profile_picture', editFiles.profile_picture);
      }
      if (editFiles.cv) {
        formData.append('cv', editFiles.cv);
      }

      formData.append('_method', 'PUT');

      const response = await api.post(`/doctors/${doctor.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        const updatedDoctor = response.data.data;
        setIsEditing(false);
        if (onUpdate && updatedDoctor) {
          onUpdate(updatedDoctor);
        }
        alert('Doctor updated successfully!');
      } else {
        alert('⚠️ ' + (response.data.message || 'Unknown response'));
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 422) {
          const errors = data.errors;
          const errorMessages = errors ? Object.values(errors).flat().join('\n') : data.message;
          alert('Validation Error:\n' + errorMessages);
        } else if (status === 401) {
          alert('Session expired!');
        } else {
          alert(`Error ${status}: ${data.message || 'Unknown'}`);
        }
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete Dr. ' + doctor.full_name + '?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete(`/doctors/${doctor.id}`);
      alert('Doctor deleted successfully!');
      onDelete?.(doctor.id);
      onClose();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal-overlay doctor-profile-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content doctor-profile-modal"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doctor-profile-header">
              <div className="doctor-avatar-section">
                {editFiles.profile_picture ? (
                  <img
                    src={URL.createObjectURL(editFiles.profile_picture)}
                    alt="Preview"
                    className="doctor-profile-img"
                  />
                ) : getImageUrl() ? (
                  <img
                    src={getImageUrl()}
                    alt={doctor.full_name}
                    className="doctor-profile-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement?.querySelector('.doctor-avatar-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="doctor-avatar-fallback"
                  style={{ display: (editFiles.profile_picture || getImageUrl()) ? 'none' : 'flex' }}
                >
                  {getAvatarLetters()}
                </div>
              </div>

              <div className="doctor-header-info">
                <h2>Dr. {doctor.full_name}</h2>
                <span className="doctor-department-badge">
                  <i className="fa-solid fa-stethoscope"></i>
                  {doctor.department?.name || 'General'}
                </span>
                <div
                  className="doctor-status-badge"
                  style={{ backgroundColor: getStatusColor(doctor.current_status) + '20', color: getStatusColor(doctor.current_status) }}
                >
                  <span className="status-dot" style={{ backgroundColor: getStatusColor(doctor.current_status) }}></span>
                  {getStatusLabel(doctor.current_status)}
                </div>
              </div>

              <button className="modal-close" onClick={onClose}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="doctor-profile-body">
              {isEditing ? (
                <div className="edit-form">
                  <div className="profile-section">
                    <h3><i className="fa-solid fa-user-pen"></i> Edit Personal Information</h3>
                    <div className="info-grid edit-grid">
                      <div className="info-item">
                        <label>First Name *</label>
                        <input type="text" name="first_name" value={editData.first_name} onChange={handleInputChange} required />
                      </div>
                      <div className="info-item">
                        <label>Last Name *</label>
                        <input type="text" name="last_name" value={editData.last_name} onChange={handleInputChange} required />
                      </div>
                      <div className="info-item">
                        <label>Gender</label>
                        <select name="gender" value={editData.gender} onChange={handleInputChange}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="info-item">
                        <label>Phone *</label>
                        <input type="text" name="phone_number" value={editData.phone_number} onChange={handleInputChange} required />
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <input type="email" name="email" value={editData.email} onChange={handleInputChange} />
                      </div>
                      <div className="info-item full-width">
                        <label>Address</label>
                        <input type="text" name="address" value={editData.address} onChange={handleInputChange} />
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3><i className="fa-solid fa-briefcase-medical"></i> Edit Professional Information</h3>
                    <div className="info-grid edit-grid">
                      <div className="info-item">
                        <label>Education</label>
                        <input type="text" name="education" value={editData.education} onChange={handleInputChange} />
                      </div>
                      <div className="info-item">
                        <label>Experience (Years)</label>
                        <input type="number" name="experience_years" value={editData.experience_years} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="info-item">
                        <label>Consultation Fee</label>
                        <input type="number" name="fee" value={editData.fee} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="info-item">
                        <label>Commission (%)</label>
                        <input type="number" name="commission_percentage" value={editData.commission_percentage} onChange={handleInputChange} min="0" max="100" />
                      </div>
                      <div className="info-item">
                        <label>Department ID</label>
                        <input type="number" name="department_id" value={editData.department_id} onChange={handleInputChange} min="1" />
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3><i className="fa-solid fa-folder-open"></i> Update Documents</h3>
                    <div className="documents-grid">
                      <div className="doc-card upload-card">
                        <div className="doc-icon"><i className="fa-solid fa-image"></i></div>
                        <div className="doc-info">
                          <span className="doc-name">Profile Picture</span>
                          <input type="file" name="profile_picture" accept="image/*" onChange={handleFileChange} className="file-input" />
                          {editFiles.profile_picture && <span className="file-selected">{editFiles.profile_picture.name}</span>}
                        </div>
                      </div>
                      <div className="doc-card upload-card">
                        <div className="doc-icon"><i className="fa-solid fa-file-pdf"></i></div>
                        <div className="doc-info">
                          <span className="doc-name">CV / Resume</span>
                          <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="file-input" />
                          {editFiles.cv && <span className="file-selected">{editFiles.cv.name}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-section">
                    <h3><i className="fa-solid fa-user"></i> Personal Information</h3>
                    <div className="info-grid">
                      <div className="info-item"><label>First Name</label><span>{doctor.first_name}</span></div>
                      <div className="info-item"><label>Last Name</label><span>{doctor.last_name}</span></div>
                      <div className="info-item"><label>Gender</label><span><i className={`fa-solid ${doctor.gender === 'female' ? 'fa-venus' : 'fa-mars'}`}></i>{doctor.gender?.charAt(0).toUpperCase() + doctor.gender?.slice(1)}</span></div>
                      <div className="info-item"><label>Email</label><span><i className="fa-solid fa-envelope"></i>{doctor.email}</span></div>
                      <div className="info-item"><label>Phone</label><span><i className="fa-solid fa-phone"></i>{doctor.phone_number}</span></div>
                      <div className="info-item full-width"><label>Address</label><span><i className="fa-solid fa-location-dot"></i>{doctor.address}</span></div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <h3><i className="fa-solid fa-briefcase-medical"></i> Professional Information</h3>
                    <div className="info-grid">
                      <div className="info-item"><label>Experience</label><span><i className="fa-solid fa-clock"></i>{doctor.experience_years} Years</span></div>
                      <div className="info-item"><label>Education</label><span><i className="fa-solid fa-graduation-cap"></i>{doctor.education}</span></div>
                      <div className="info-item"><label>Consultation Fee</label><span><i className="fa-solid fa-dollar-sign"></i>{doctor.fee}</span></div>
                      <div className="info-item"><label>Commission</label><span><i className="fa-solid fa-percent"></i>{doctor.commission_percentage}%</span></div>
                    </div>
                  </div>

                  {doctor.availabilities && doctor.availabilities.length > 0 && (
                    <div className="profile-section">
                      <h3><i className="fa-solid fa-calendar-days"></i> Availability Schedule</h3>
                      <div className="availability-list">
                        {doctor.availabilities.map((avail) => (
                          <div key={avail.id || `${avail.day_of_week}-${avail.start_time}`} className="availability-item">
                            <div className="availability-day"><i className="fa-solid fa-sun"></i>{formatDay(avail.day_of_week)}</div>
                            <div className="availability-time"><i className="fa-regular fa-clock"></i>{formatTime(avail.start_time)} - {formatTime(avail.end_time)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="profile-section">
                    <h3><i className="fa-solid fa-folder-open"></i> Documents</h3>
                    <div className="documents-grid">
                      {doctor.profile_picture ? (
                        <a href={getImageUrl()} target="_blank" rel="noopener noreferrer" className="doc-card">
                          <div className="doc-icon"><i className="fa-solid fa-image"></i></div>
                          <div className="doc-info"><span className="doc-name">Profile Picture</span><span className="doc-type">Image</span></div>
                          <i className="fa-solid fa-arrow-up-right-from-square doc-open"></i>
                        </a>
                      ) : (
                        <div className="doc-card disabled"><div className="doc-icon"><i className="fa-solid fa-image"></i></div><div className="doc-info"><span className="doc-name">Profile Picture</span><span className="doc-type">Not uploaded</span></div></div>
                      )}
                      {getCvUrl() ? (
                        <a href={getCvUrl()} target="_blank" rel="noopener noreferrer" className="doc-card">
                          <div className="doc-icon"><i className="fa-solid fa-file-pdf"></i></div>
                          <div className="doc-info"><span className="doc-name">CV / Resume</span><span className="doc-type">PDF</span></div>
                          <i className="fa-solid fa-arrow-up-right-from-square doc-open"></i>
                        </a>
                      ) : (
                        <div className="doc-card disabled"><div className="doc-icon"><i className="fa-solid fa-file-pdf"></i></div><div className="doc-info"><span className="doc-name">CV / Resume</span><span className="doc-type">Not uploaded</span></div></div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer doctor-profile-footer">
              {isEditing ? (
                <>
                  <button type="button" className="btn-save" onClick={handleSave} disabled={isSaving}>
                    <i className="fa-solid fa-check"></i> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={cancelEditing} disabled={isSaving}>
                    <i className="fa-solid fa-xmark"></i> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-edit" onClick={startEditing}>
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button type="button" className="btn-delete" onClick={handleDelete} disabled={isDeleting}>
                    <i className="fa-solid fa-trash"></i> {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i> Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoctorProfileModal;