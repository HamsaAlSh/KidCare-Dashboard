import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from "../../../api/axios";
import { normalizeDoctor } from "../tabs/DoctorsTab";

const DoctorProfileModal = ({ show, doctor, onClose, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!doctor) return null;

  const getImageUrl = () => {
    if (!doctor.profile_picture) return null;
    if (doctor.profile_picture.startsWith('http')) {
      return doctor.profile_picture;
    }
    return `https://kidcare.sy/storage/${doctor.profile_picture}`;
  };

  const getCvUrl = () => {
    if (!doctor.cv) return null;
    if (doctor.cv.startsWith('http')) {
      return doctor.cv;
    }
    return `https://kidcare.sy/storage/${doctor.cv}`;
  };

  const getAvatarLetters = () => {
    const first = doctor.first_name?.[0] || '';
    const last = doctor.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
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
    let phone = doctor.phone_number || '963';
    if (phone.startsWith('09')) {
      phone = '963' + phone.slice(1);
    } else if (phone.startsWith('00963')) {
      phone = phone.replace('00963', '963');
    } else if (phone.startsWith('+963')) {
      phone = phone.replace('+963', '963');
    } else if (!phone.startsWith('963') && phone !== '') {
      phone = '963' + phone;
    }

    setEditData({
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      phone_number: phone,
      email: doctor.email || '',
      address: doctor.address || '',
      experience_years: doctor.experience_years ?? '',
      education: doctor.education || '',
      fee: doctor.fee ?? '',
      commission_percentage: doctor.commission_percentage ?? '',
    });
    setIsEditing(true);
    setImgError(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    let phone = e.target.value.trim();

    if (phone.startsWith('09')) {
      phone = '963' + phone.slice(1);
    } else if (phone.startsWith('00963')) {
      phone = phone.replace('00963', '963');
    } else if (phone.startsWith('+963')) {
      phone = phone.replace('+963', '963');
    } else if (!phone.startsWith('963') && phone !== '') {
      phone = '963' + phone;
    }

    setEditData(prev => ({
      ...prev,
      phone_number: phone
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('first_name', editData.first_name || '');
      params.append('last_name', editData.last_name || '');
      params.append('phone_number', editData.phone_number || '');
      params.append('email', editData.email || '');
      params.append('address', editData.address || '');
      params.append('experience_years', editData.experience_years ?? '');
      params.append('education', editData.education || '');
      params.append('fee', editData.fee ?? '');
      params.append('commission_percentage', editData.commission_percentage ?? '');

      const response = await api.put(`/doctors/${doctor.id}/update`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status === 'success') {
        let updatedDoctor = response.data.data;

        if (!updatedDoctor.department && doctor.department) {
          updatedDoctor.department = doctor.department;
        }

        const normalizedUpdatedDoctor = normalizeDoctor(updatedDoctor);

        setIsEditing(false);
        if (onUpdate && normalizedUpdatedDoctor) {
          onUpdate(normalizedUpdatedDoctor);
        }
        onClose();
      } else {
        alert((response.data.message || 'Unknown response'));
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
      onDelete?.(doctor.id);
      onClose();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
      setIsDeleting(false);
    }
  };

  const imageUrl = getImageUrl();
  const showImage = imageUrl && !imgError;

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
                {showImage ? (
                  <img
                    src={imageUrl}
                    alt={doctor.full_name}
                    className="doctor-profile-img"
                    onError={() => setImgError(true)}
                  />
                ) : null}
                <div
                  className="doctor-avatar-fallback"
                  style={{ display: showImage ? 'none' : 'flex' }}
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
                        <label>Phone *</label>
                        <input 
                          type="tel" 
                          name="phone_number" 
                          value={editData.phone_number} 
                          onChange={handlePhoneChange} 
                          placeholder="963xxxxxxxx" 
                          required 
                        />
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
                        <label>Experience (Years)</label>
                        <input type="number" name="experience_years" value={editData.experience_years} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="info-item">
                        <label>Education</label>
                        <input type="text" name="education" value={editData.education} onChange={handleInputChange} />
                      </div>
                      <div className="info-item">
                        <label>Consultation Fee</label>
                        <input type="number" name="fee" value={editData.fee} onChange={handleInputChange} min="0" step="0.01" />
                      </div>
                      <div className="info-item">
                        <label>Commission (%)</label>
                        <input type="number" name="commission_percentage" value={editData.commission_percentage} onChange={handleInputChange} min="0" max="100" />
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