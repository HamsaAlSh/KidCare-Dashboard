## D:\my-first-app\src\api\axios.js

`javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kidcare.sy/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('reception_token');
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
      sessionStorage.removeItem('reception_token');
      sessionStorage.removeItem('reception_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
`

## D:\my-first-app\src\context\AuthContext.jsx

`javascript
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('admin_user') || sessionStorage.getItem('reception_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (phoneNumber, password, role) => {
    const endpoint = role === 'admin' 
      ? 'https://kidcare.sy/api/loginAdmin' 
      : 'https://kidcare.sy/api/loginReceptionist';

    try {
      const params = new URLSearchParams();
      params.append('phone_number', phoneNumber);
      params.append('password', password);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString()
      });

      const data = await response.json();

      if (data.status === 'success') {
        const userWithRole = {
          ...data.user,
          role: role
        };

        if (role === 'admin') {
          sessionStorage.setItem('admin_token', data.Token);
          sessionStorage.setItem('admin_user', JSON.stringify(userWithRole));
        } else {
          sessionStorage.setItem('reception_token', data.Token);
          sessionStorage.setItem('reception_user', JSON.stringify(userWithRole));
        }

        setUser(userWithRole);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Network error or server down' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('reception_token');
    sessionStorage.removeItem('reception_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`

## D:\my-first-app\src\features\admin\components\AddDoctorModal.jsx

`javascript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const departmentsData = [
  { id: 1, name: 'Pediatrics' },
  { id: 2, name: 'Dentistry' },
  { id: 3, name: 'Psychiatry' },
];

const AddDoctorModal = ({
  showAddDoctorModal,
  newDoctor,
  errors,
  isSubmitting,
  handleInputChange,
  handleFileChange,
  handleSubmitDoctor,
  closeModal
}) => {
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

    handleInputChange({
      target: {
        name: 'phone_number',
        value: phone
      }
    });
  };

  return (
    <AnimatePresence>
      {showAddDoctorModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-icon">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <div>
                <h2>Add New Doctor</h2>
                <p>Fill in the doctor's information below</p>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitDoctor}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Department <span className="required">*</span>
                  </label>
                  <select
                    name="department_id"
                    value={newDoctor.department_id}
                    onChange={handleInputChange}
                    className={errors.department_id ? 'error' : ''}
                  >
                    <option value="">Select Department</option>
                    {departmentsData.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department_id && <span className="error-text">{errors.department_id}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="first_name"
                      value={newDoctor.first_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah"
                      className={errors.first_name ? 'error' : ''}
                    />
                    {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="last_name"
                      value={newDoctor.last_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ahmed"
                      className={errors.last_name ? 'error' : ''}
                    />
                    {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Gender <span className="required">*</span></label>
                  <select
                    name="gender"
                    value={newDoctor.gender}
                    onChange={handleInputChange}
                    className={errors.gender ? 'error' : ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <span className="error-text">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label>Address <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={newDoctor.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={newDoctor.email}
                      onChange={handleInputChange}
                      placeholder="doctor@kidcare.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={newDoctor.phone_number || '963'}
                      onChange={handlePhoneChange}
                      placeholder="963xxxxxxxx"
                      className={errors.phone_number ? 'error' : ''}
                    />
                    {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience (Years) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="experience_years"
                      value={newDoctor.experience_years}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="0"
                      className={errors.experience_years ? 'error' : ''}
                    />
                    {errors.experience_years && <span className="error-text">{errors.experience_years}</span>}
                  </div>
                  <div className="form-group">
                    <label>Education <span className="required">*</span></label>
                    <input
                      type="text"
                      name="education"
                      value={newDoctor.education}
                      onChange={handleInputChange}
                      placeholder="e.g. MD, Harvard Medical School"
                      className={errors.education ? 'error' : ''}
                    />
                    {errors.education && <span className="error-text">{errors.education}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Consultation Fee ($) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="fee"
                      value={newDoctor.fee}
                      onChange={handleInputChange}
                      placeholder="450"
                      min="0"
                      step="0.01"
                      className={errors.fee ? 'error' : ''}
                    />
                    {errors.fee && <span className="error-text">{errors.fee}</span>}
                  </div>
                  <div className="form-group">
                    <label>Commission (%) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="commission_percentage"
                      value={newDoctor.commission_percentage}
                      onChange={handleInputChange}
                      placeholder="15"
                      min="0"
                      max="100"
                      className={errors.commission_percentage ? 'error' : ''}
                    />
                    {errors.commission_percentage && <span className="error-text">{errors.commission_percentage}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group file-group">
                    <label>
                      <i className="fa-solid fa-camera"></i> Profile Picture
                      <span className="optional">(Optional)</span>
                    </label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => handleFileChange(e, 'profile_picture')}
                        id="profile-picture"
                        hidden
                      />
                      <label htmlFor="profile-picture" className="file-label">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>{newDoctor.profile_picture ? newDoctor.profile_picture.name : 'Upload Photo'}</span>
                      </label>
                      {newDoctor.profile_picture && (
                        <button
                          type="button"
                          className="file-clear"
                          onClick={() => handleInputChange({ target: { name: 'profile_picture', value: null, type: 'file' } })}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                    {errors.profile_picture && <span className="error-text">{errors.profile_picture}</span>}
                    <small className="file-hint">JPG, PNG â€¢ Max 5MB</small>
                  </div>

                  <div className="form-group file-group">
                    <label>
                      <i className="fa-solid fa-file-pdf"></i> CV / Resume
                      <span className="optional">(Optional)</span>
                    </label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        id="cv-file"
                        hidden
                      />
                      <label htmlFor="cv-file" className="file-label">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>{newDoctor.cv ? newDoctor.cv.name : 'Upload CV'}</span>
                      </label>
                      {newDoctor.cv && (
                        <button
                          type="button"
                          className="file-clear"
                          onClick={() => handleInputChange({ target: { name: 'cv', value: null, type: 'file' } })}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )}
                    </div>
                    {errors.cv && <span className="error-text">{errors.cv}</span>}
                    <small className="file-hint">PDF, DOC â€¢ Max 5MB</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      Adding Doctor...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      Add Doctor
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GeneratedPasswordModal = ({ show, password, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content password-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="modal-header">
              <h2>Doctor Account Created</h2>
              <p>Temporary password â€” save it now, it will not be shown again</p>
            </div>

            <div className="modal-body">
              <div className="password-display">
                <code>{password}</code>
                <button type="button" onClick={copyToClipboard}>
                  <i className="fa-solid fa-copy"></i> Copy
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-submit" onClick={onClose}>
                Got it, Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const buildDoctorFormData = (newDoctor) => {
  const formData = new FormData();
  formData.append('first_name', newDoctor.first_name);
  formData.append('last_name', newDoctor.last_name);
  formData.append('email', newDoctor.email);
  formData.append('phone_number', newDoctor.phone_number);
  formData.append('address', newDoctor.address);
  formData.append('experience_years', newDoctor.experience_years);
  formData.append('education', newDoctor.education);
  formData.append('department_id', newDoctor.department_id);
  formData.append('fee', newDoctor.fee);
  formData.append('commission_percentage', newDoctor.commission_percentage);
  formData.append('gender', newDoctor.gender);
  if (newDoctor.profile_picture) formData.append('profile_picture', newDoctor.profile_picture);
  if (newDoctor.cv) formData.append('cv', newDoctor.cv);
  return formData;
};

export default AddDoctorModal;
export { GeneratedPasswordModal, buildDoctorFormData };
`

## D:\my-first-app\src\features\admin\components\DoctorProfileModal.jsx

`javascript
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
    return `https://kidcare.sy/${doctor.profile_picture}`;
  };

  const getCvUrl = () => {
    if (!doctor.cv) return null;
    if (doctor.cv.startsWith('http')) {
      return doctor.cv;
    }
    return `https://kidcare.sy/${doctor.cv}`;
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
    await onDelete?.(doctor.id);
    onClose();
  } catch (error) {
    alert('Error: ' + (error.response?.data?.message || error.message));
  } finally {
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
`

## D:\my-first-app\src\features\admin\components\SharedComponents.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const AnimatedNumber = ({ value = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1500, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={`toast-notification ${type}`}
  >
    <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><i className="fa-solid fa-xmark"></i></button>
  </motion.div>
);

const QuickStatCard = ({ icon, label, value, trend = '', color = 'blue' }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    green: { bg: '#E8F5E9', icon: '#66BB6A', gradient: 'linear-gradient(90deg, #66BB6A, #43A047)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
  };

  const safeTrend = typeof trend === 'string' ? trend : '';
  const isPositive = safeTrend.startsWith('+');
  const currentColor = colorMap[color] || colorMap.blue;

  return (
    <motion.div className="quick-stat-card" whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(79, 195, 247, 0.15)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="stat-icon-wrapper" style={{ background: currentColor.bg }}>
        <i className={`fa-solid ${icon}`} style={{ color: currentColor.icon }}></i>
      </div>
      <div className="quick-stat-content">
        <h4>{label}</h4>
        <p className="quick-stat-value">{value}</p>
        {safeTrend && (
          <small className={`trend ${isPositive ? 'positive' : 'neutral'}`}>
            <i className={`fa-solid ${isPositive ? 'fa-arrow-trend-up' : 'fa-minus'}`}></i>{safeTrend}
          </small>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, sub, icon, color = 'blue', progress }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    pink: { bg: '#FCE4EC', icon: '#EC407A', gradient: 'linear-gradient(90deg, #EC407A, #D81B60)' },
  };

  const currentColor = colorMap[color] || colorMap.blue;

  return (
    <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="stat-card-v2">
      <motion.div className="stat-icon-v2" style={{ background: currentColor.bg, color: currentColor.icon }}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </motion.div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <small className="stat-sub">{sub}</small>
        {progress !== undefined && (
          <div className="progress-bar-kidcare">
            <motion.div className="progress-fill" style={{ background: currentColor.gradient }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { AnimatedNumber, Toast, QuickStatCard, StatCard, containerVariants, itemVariants };
`

## D:\my-first-app\src\features\admin\components\Sidebar.jsx

`javascript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../../../assets/logo.jpg';


const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: 12 },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'insights', label: 'Smart Insights', icon: 'fa-lightbulb', badge: null }, 
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
];

const Sidebar = ({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen, darkMode }) => (
  <motion.aside className={`sidebar-kidcare ${!isSidebarOpen ? 'collapsed' : ''} ${darkMode ? 'dark' : ''}`}
    initial={false} animate={{ width: isSidebarOpen ? 280 : 80 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
  >
    <div className="sidebar-brand">
      <motion.div className="brand-logo" whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
        <div className="brand-logo" style={{ 
  backgroundImage: `url(${logoImage})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}}>
  {!logoImage && <span>KC</span>}
</div>
      </motion.div>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div className="brand-text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <h2>KidCare Clinic</h2>
            <span>Pediatric Excellence</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <nav className="nav-menu">
      {sidebarItems.map((item, index) => (
        <motion.div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
          whileHover={{ x: 4, backgroundColor: 'rgba(79, 195, 247, 0.08)' }} whileTap={{ scale: 0.98 }}
        >
          <motion.i className={`fa-solid ${item.icon}`} whileHover={{ rotate: 15, scale: 1.2 }} transition={{ type: 'spring', stiffness: 300 }}></motion.i>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
      
          {activePage === item.id && <motion.div className="active-indicator" layoutId="activeIndicator" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
        </motion.div>
      ))}
    </nav>

    <motion.button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <i className={`fa-solid fa-chevron-${isSidebarOpen ? 'left' : 'right'}`}></i>
    </motion.button>
  </motion.aside>
);

export default Sidebar;
`

## D:\my-first-app\src\features\admin\components\SmartInsights.jsx

`javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateInsights = (doctorsData = [], departmentsData = [], ageDistribution = [], revenueData = [], weeklyAppointments = []) => {
  const insights = [];
  
  if (departmentsData && departmentsData.length > 0) {
    departmentsData.forEach(dept => {
      const occupancyPercent = (dept.patients / dept.capacity) * 100;
      
      if (occupancyPercent >= 90) {
        insights.push({
          id: `dept-critical-${dept.id}`,
          type: 'critical',
          icon: 'fa-triangle-exclamation',
          color: '#EF5350',
          title: `${dept.name} at Critical Capacity`,
          message: `${Math.round(occupancyPercent)}% occupied. Immediate action needed.`,
          recommendation: `Hire ${Math.ceil((dept.patients - dept.capacity * 0.8) / 50)} more doctors or expand rooms.`,
          department: dept.name,
          priority: 'high'
        });
      } else if (occupancyPercent >= 75) {
        insights.push({
          id: `dept-warning-${dept.id}`,
          type: 'warning',
          icon: 'fa-circle-exclamation',
          color: '#FF9800',
          title: `${dept.name} Near Full Capacity`,
          message: `${Math.round(occupancyPercent)}% occupied. Plan ahead.`,
          recommendation: `Consider opening an extra room or hiring soon.`,
          department: dept.name,
          priority: 'medium'
        });
      }
    });
  }

  if (doctorsData && doctorsData.length > 0) {
    const bestDoctor = doctorsData.reduce((best, doc) => 
      (doc.patients > best.patients ? doc : best), doctorsData[0]);
    
    if (bestDoctor && bestDoctor.name) {
      insights.push({
        id: `doctor-top-${bestDoctor.id}`,
        type: 'success',
        icon: 'fa-trophy',
        color: '#66BB6A',
        title: `Top Performer: ${bestDoctor.name}`,
        message: `${bestDoctor.patients || 0} patients served.`,
        recommendation: 'Consider promotion or mentorship role for new doctors.',
        doctor: bestDoctor.name,
        priority: 'low'
      });
    }
  }

  if (revenueData && revenueData.length > 0) {
    const latest = revenueData[revenueData.length - 1];
    const profit = latest.revenue - latest.expenses;
    const profitMargin = latest.revenue > 0 ? (profit / latest.revenue) * 100 : 0;
    
    if (profitMargin < 15) {
      insights.push({
        id: 'profit-margin-low',
        type: 'critical',
        icon: 'fa-chart-line',
        color: '#EF5350',
        title: 'Profit Margin Declining',
        message: `Current profit margin is ${profitMargin.toFixed(1)}%.`,
        recommendation: 'Review expenses and consider increasing service fees or reducing operational costs.',
        priority: 'high'
      });
    } else if (profitMargin > 40) {
      insights.push({
        id: 'profit-margin-high',
        type: 'success',
        icon: 'fa-sack-dollar',
        color: '#66BB6A',
        title: 'Excellent Profit Margin',
        message: `Current profit margin is ${profitMargin.toFixed(1)}%.`,
        recommendation: 'Consider investing in new equipment or expanding services.',
        priority: 'low'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    doctorsData.forEach(doc => {
      const avgScore = ((doc.appointments || 0) + (doc.patients || 0) + (doc.experience || 0)) / 3;
      if (avgScore < 3 && (doc.patients || 0) > 0) {
        insights.push({
          id: `doctor-low-${doc.id}`,
          type: 'warning',
          icon: 'fa-user-doctor',
          color: '#FF9800',
          title: `${doc.name} Performance Below Average`,
          message: `Overall performance score: ${avgScore.toFixed(1)}/5 across appointments and patients.`,
          recommendation: 'Schedule a performance review and provide additional training or support.',
          priority: 'medium'
        });
      }
    });
  }

  if (departmentsData && departmentsData.length > 1) {
    const largest = departmentsData.reduce((max, d) => (d.patients || 0) > (max.patients || 0) ? d : max);
    const smallest = departmentsData.reduce((min, d) => (d.patients || 0) < (min.patients || 0) ? d : min);
    const imbalance = (smallest.patients || 1) > 0 ? (largest.patients || 0) / (smallest.patients || 1) : 0;
    
    if (imbalance > 3 && (smallest.patients || 0) > 0) {
      insights.push({
        id: 'dept-imbalance',
        type: 'warning',
        icon: 'fa-scale-unbalanced',
        color: '#AB47BC',
        title: 'Severe Department Load Imbalance',
        message: `${largest.name} has ${Math.round(imbalance)}x more patients than ${smallest.name}.`,
        recommendation: 'Redistribute patients or reallocate doctors to balance workload.',
        priority: 'high'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    const totalHours = doctorsData.reduce((sum, d) => sum + (d.workingHours || 0), 0);
    const activeDoctors = doctorsData.filter(d => d.status === 'active').length;
    const avgHours = activeDoctors > 0 ? totalHours / activeDoctors : 0;
    
    if (avgHours > 50) {
      insights.push({
        id: 'overtime-warning',
        type: 'critical',
        icon: 'fa-clock',
        color: '#EF5350',
        title: 'Doctors Working Excessive Hours',
        message: `Average ${avgHours.toFixed(1)} hours per doctor this week.`,
        recommendation: 'Hire additional staff immediately to prevent burnout and maintain care quality.',
        priority: 'high'
      });
    } else if (avgHours > 0 && avgHours < 20) {
      insights.push({
        id: 'underutilized',
        type: 'info',
        icon: 'fa-chair',
        color: '#4FC3F7',
        title: 'Doctors Underutilized',
        message: `Average ${avgHours.toFixed(1)} hours per doctor only.`,
        recommendation: 'Consider increasing appointments or reducing staff to cut costs.',
        priority: 'low'
      });
    }
  }

  if (ageDistribution && ageDistribution.length > 0) {
    const totalAll = ageDistribution.reduce((sum, g) => sum + (g.count || 0), 0);
    
    if (totalAll > 0) {
      const youngGroups = ageDistribution.filter(g => {
        const maxAge = parseInt(g.range?.split('-')[1] || g.range?.split('+')[0] || 0);
        return maxAge <= 3;
      });
      const totalYoung = youngGroups.reduce((sum, g) => sum + (g.count || 0), 0);
      const youngPercent = (totalYoung / totalAll) * 100;
      
      if (youngPercent > 60) {
        insights.push({
          id: 'age-young-majority',
          type: 'info',
          icon: 'fa-baby',
          color: '#4FC3F7',
          title: 'Young Patients Majority',
          message: `${Math.round(youngPercent)}% of patients are under 3 years old.`,
          recommendation: 'Invest in infant-friendly equipment, toys, and waiting area.',
          priority: 'medium'
        });
      }
      
      const maxGroup = ageDistribution.reduce((max, g) => (g.count || 0) > (max.count || 0) ? g : max);
      if ((maxGroup.count || 0) > totalAll * 0.4) {
        insights.push({
          id: `age-spike-${maxGroup.range}`,
          type: 'info',
          icon: 'fa-child',
          color: '#4FC3F7',
          title: `High Demand: Ages ${maxGroup.range}`,
          message: `${Math.round((maxGroup.count / totalAll) * 100)}% of patients are in this age group.`,
          recommendation: `Ensure adequate specialized resources for ${maxGroup.range} year olds.`,
          priority: 'low'
        });
      }
    }
  }

  if (weeklyAppointments && weeklyAppointments.length === 7) {
    const totalWeekly = weeklyAppointments.reduce((a, b) => (a || 0) + (b || 0), 0);
    const avgDaily = totalWeekly / 7;
    
    const weekendTotal = (weeklyAppointments[0] || 0) + (weeklyAppointments[6] || 0);
    if (weekendTotal === 0 && totalWeekly > 0) {
      insights.push({
        id: 'weekend-gap',
        type: 'info',
        icon: 'fa-calendar-xmark',
        color: '#4FC3F7',
        title: 'No Weekend Appointments',
        message: 'Zero appointments scheduled on Friday and Saturday.',
        recommendation: 'Consider opening weekend slots to increase revenue and patient accessibility.',
        priority: 'low'
      });
    }
    
    const maxDay = Math.max(...weeklyAppointments.map(v => v || 0));
    const maxDayIndex = weeklyAppointments.indexOf(maxDay);
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    if (maxDay > avgDaily * 2 && avgDaily > 0) {
      insights.push({
        id: 'busy-day',
        type: 'warning',
        icon: 'fa-calendar-day',
        color: '#FF9800',
        title: `${dayNames[maxDayIndex]} is Overloaded`,
        message: `${maxDay} appointments on ${dayNames[maxDayIndex]} (${Math.round(maxDay / avgDaily)}x average).`,
        recommendation: 'Add extra staff this day or spread appointments to other days.',
        priority: 'medium'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    const totalPatients = doctorsData.reduce((sum, d) => sum + (d.patients || 0), 0);
    const activeDoctors = doctorsData.filter(d => d.status === 'active').length;
    const avgPatientsPerDoctor = activeDoctors > 0 ? totalPatients / activeDoctors : 0;
    
    if (avgPatientsPerDoctor > 150) {
      insights.push({
        id: 'doctor-shortage',
        type: 'warning',
        icon: 'fa-user-doctor',
        color: '#AB47BC',
        title: 'Doctor Workload High',
        message: `Average ${Math.round(avgPatientsPerDoctor)} patients per doctor.`,
        recommendation: 'Hire more doctors to balance workload and improve care quality.',
        priority: 'high'
      });
    }
  }

  if (doctorsData && doctorsData.length > 2) {
    const avgExperience = doctorsData.reduce((sum, d) => sum + (d.experience || 0), 0) / doctorsData.length;
    if (avgExperience < 3) {
      insights.push({
        id: 'inexperienced-team',
        type: 'warning',
        icon: 'fa-graduation-cap',
        color: '#FF9800',
        title: 'Team Lacks Experience',
        message: `Average doctor experience is ${avgExperience.toFixed(1)} years only.`,
        recommendation: 'Hire senior doctors or arrange mentorship programs.',
        priority: 'medium'
      });
    }
  }

  return insights;
};

const SmartInsights = ({ 
  isOpen, 
  onClose, 
  doctorsData = [], 
  departmentsData = [], 
  ageDistribution = [],
  revenueData = [],
  weeklyAppointments = [],
  onInsightRead, 
  inlineMode = false 
}) => {
  const [insights, setInsights] = useState([]);
  const isProcessing = useRef(false);
  const prevDataRef = useRef({});

  const updateInsights = useCallback((newInsights) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    setInsights(prev => {
      const merged = newInsights.map(newInsight => {
        const existing = prev.find(p => p.id === newInsight.id);
        return existing ? { ...newInsight, read: existing.read, dismissed: existing.dismissed } : newInsight;
      }).filter(i => !i.dismissed);
      
      const prevString = JSON.stringify(prev);
      const mergedString = JSON.stringify(merged);
      if (prevString !== mergedString) {
        try {
          localStorage.setItem('kidcare_insights', JSON.stringify(merged));
        } catch (e) {
          console.error('localStorage error:', e);
        }
      }
      
      return merged;
    });

    setTimeout(() => {
      isProcessing.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (!doctorsData && !departmentsData) return;
    
    const newInsights = generateInsights(
      doctorsData, 
      departmentsData, 
      ageDistribution,
      revenueData,
      weeklyAppointments
    );

    const dataKey = JSON.stringify({ 
      d: doctorsData?.length, 
      de: departmentsData?.length,
      a: ageDistribution?.length,
      r: revenueData?.length,
      w: weeklyAppointments?.length 
    });
    
    if (prevDataRef.current.key === dataKey) return;
    prevDataRef.current.key = dataKey;

    updateInsights(newInsights);
  }, [doctorsData, departmentsData, ageDistribution, revenueData, weeklyAppointments, updateInsights]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kidcare_insights' && e.newValue) {
        try {
          const saved = JSON.parse(e.newValue);
          setInsights(saved.filter(i => !i.dismissed));
        } catch (err) {
          console.error('Parse error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsRead = useCallback((id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, read: true } : i);
      try {
        localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      } catch (e) {
        console.error('localStorage error:', e);
      }
      return updated;
    });
    onInsightRead?.();
  }, [onInsightRead]);

  const dismissInsight = useCallback((id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, dismissed: true } : i).filter(i => !i.dismissed);
      try {
        localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      } catch (e) {
        console.error('localStorage error:', e);
      }
      return updated;
    });
    onInsightRead?.();
  }, [onInsightRead]);

  const unreadCount = insights.filter(i => !i.read).length;

  const getPriorityBadge = (priority) => {
    const colors = {
      high: '#EF5350',
      medium: '#FF9800',
      low: '#66BB6A'
    };
    return colors[priority] || '#90A4AE';
  };

  if (!isOpen && !inlineMode) return null;

  const insightsContent = (
    <>
      <div className="insights-header">
        <div className="insights-title">
          <i className="fa-solid fa-lightbulb"></i>
          <h3>Smart Insights</h3>
          {unreadCount > 0 && (
            <span className="insights-badge">{unreadCount}</span>
          )}
        </div>
        {!inlineMode && (
          <button className="insights-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      <div className="insights-list">
        <AnimatePresence mode="popLayout">
          {insights.length === 0 ? (
            <motion.div 
              className="insights-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <i className="fa-solid fa-check-circle"></i>
              <p>No insights at the moment. Everything looks good!</p>
            </motion.div>
          ) : (
            insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                layout
                className={`insight-card ${insight.read ? 'read' : 'unread'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="insight-priority" style={{ background: getPriorityBadge(insight.priority) }}></div>
                
                <div className="insight-icon" style={{ background: `${insight.color}15`, color: insight.color }}>
                  <i className={`fa-solid ${insight.icon}`}></i>
                </div>
                
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p className="insight-message">{insight.message}</p>
                  <div className="insight-recommendation">
                    <i className="fa-solid fa-arrow-right"></i>
                    <span>{insight.recommendation}</span>
                  </div>
                </div>
                
                <div className="insight-actions">
                  {!insight.read && (
                    <motion.button
                      className="insight-btn read"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markAsRead(insight.id)}
                    >
                      <i className="fa-solid fa-check"></i>
                      Mark Read
                    </motion.button>
                  )}
                  <motion.button
                    className="insight-btn dismiss"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dismissInsight(insight.id)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </>
  );

  if (inlineMode) {
    return (
      <div className="insights-inline">
        {insightsContent}
      </div>
    );
  }

  return (
    <motion.div
      className="insights-panel"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {insightsContent}
    </motion.div>
  );
};

export default SmartInsights;
`

## D:\my-first-app\src\features\admin\pages\AdminDashboard.jsx

`javascript
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';
import logoImage from "../../../assets/logo.jpg";
import "./AdminDashboard.css";
import api from "../../../api/axios";

import Sidebar from "../components/Sidebar";
import AddDoctorModal from "../components/AddDoctorModal";
import SmartInsights from "../components/SmartInsights";
import DoctorProfileModal from "../components/DoctorProfileModal";  
import DashboardTab from "../tabs/DashboardTab";
import DoctorsTab from "../tabs/DoctorsTab";
import DepartmentsTab from "../tabs/DepartmentsTab";
import StatisticsTab from "../tabs/StatisticsTab";
import MyAccountTab from "../tabs/MyAccountTab";
import SettingsTab from "../tabs/SettingsTab";
import SmartInsightsTab from "../tabs/SmartInsightsTab";

import { normalizeDoctor } from "../tabs/DoctorsTab";


const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: null },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
];


const initialRequests = [];
const appointmentsData = [];
const paymentsData = [];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1500, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={`toast-notification ${type}`}
  >
    <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><i className="fa-solid fa-xmark"></i></button>
  </motion.div>
);

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(3);
  const [pendingRequests, setPendingRequests] = useState(initialRequests);
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [showInsights, setShowInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [allDoctorsForStats, setAllDoctorsForStats] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);  
  const [showDoctorProfile, setShowDoctorProfile] = useState(false);  
  const [doctorsData, setDoctorsData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchDoctors = async (page = 1) => {
    try {
      const response = await api.get(`/doctors?page=${page}`);
      const fetchedDoctors = response.data?.data || [];
      const paginationData = response.data?.pagination || {};

      setPagination({
        current_page: paginationData.current_page || 1,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || 10,
        total: paginationData.total || 0
      });

      setDoctorsData(fetchedDoctors);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await api.get('/doctors?per_page=1000');
      setAllDoctorsForStats(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch all doctors for stats:', error);
    }
  };

  useEffect(() => {
    console.log(' useEffect running - fetching doctors...'); 
    fetchDoctors(1);
    fetchAllDoctors();
  }, []);

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    department_id: '', first_name: '', last_name: '', address: '',
    email: '', phone_number: '', experience_years: '', education: '',
    fee: '', commission_percentage: '', profile_picture: null, cv: null,
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activePage]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('kidcare_insights');
    if (saved) {
      const insights = JSON.parse(saved);
      setInsightCount(insights.filter(i => !i.read).length);
    }
  }, [doctorsData, departmentsData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-box-wrapper')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartmentsData(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setDepartmentsData([]);
      }
    };

    fetchDepartments();
  }, []);

  const addNotification = useCallback((message, type = 'success', duration = 4000) => {
  const id = Date.now();
  setNotifications(prev => [...prev, { id, message, type }]);
  if (duration > 0) {
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
  }
}, []);

  const validateDoctorForm = () => {
    const newErrors = {};
    const requiredFields = [
      'department_id', 'first_name', 'last_name', 'address',
      'email', 'phone_number', 'experience_years', 'education',
      'fee', 'commission_percentage','gender'
    ];

    requiredFields.forEach(field => {
      if (!newDoctor[field] || newDoctor[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (newDoctor.department_id) {
      const deptId = parseInt(newDoctor.department_id);
      if (isNaN(deptId) || deptId <= 0) {
        newErrors.department_id = 'Please select a valid department';
      }
    }

    if (newDoctor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDoctor.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (newDoctor.phone_number && !/^\963\s?\d{2}\s?\d{3}\s?\d{4}$/.test(newDoctor.phone_number)) {
      newErrors.phone_number = 'Format: 963 90 000 0000';
    }

    if (newDoctor.experience_years && (isNaN(newDoctor.experience_years) || newDoctor.experience_years < 0)) {
      newErrors.experience_years = 'Must be a positive number';
    }

    if (newDoctor.fee && (isNaN(newDoctor.fee) || newDoctor.fee < 0)) {
      newErrors.fee = 'Must be a positive number';
    }

    if (newDoctor.commission_percentage && (isNaN(newDoctor.commission_percentage) || newDoctor.commission_percentage < 0 || newDoctor.commission_percentage > 100)) {
      newErrors.commission_percentage = 'Must be between 0-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue;
    if (name === 'department_id') {
      processedValue = value === '' ? '' : parseInt(value);
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else {
      processedValue = value;
    }

    setNewDoctor(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = fieldName === 'profile_picture' 
        ? ['image/jpeg', 'image/png', 'image/jpg']
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldName === 'profile_picture' ? 'Only JPG/PNG allowed' : 'Only PDF/DOC allowed'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 5MB' }));
        return;
      }

      setNewDoctor(prev => ({ ...prev, [fieldName]: file }));
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();

    if (!validateDoctorForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('department_id', newDoctor.department_id);
      formData.append('first_name', newDoctor.first_name);
      formData.append('last_name', newDoctor.last_name);
      formData.append('address', newDoctor.address);
      formData.append('email', newDoctor.email);
      formData.append('phone_number', newDoctor.phone_number);
      formData.append('experience_years', newDoctor.experience_years);
      formData.append('education', newDoctor.education);
      formData.append('fee', newDoctor.fee);
      formData.append('commission_percentage', newDoctor.commission_percentage);
      formData.append('gender', newDoctor.gender);

      if (newDoctor.profile_picture) {
        formData.append('profile_picture', newDoctor.profile_picture);
      }
      if (newDoctor.cv) {
        formData.append('cv', newDoctor.cv);
      }

      const response = await api.post('/doctors', formData);

addNotification(`Doctor added successfully! Password: ${response.data.generated_password}`, 'success', 0);
closeModal();
fetchDoctors(1);

    } catch (error) {
      console.error('Error adding doctor:', error);
      console.log('Response data:', error.response?.data);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to add doctor' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorClick = async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      if (response.data?.status === 'success') {
        setSelectedDoctor(response.data.data);
        setShowDoctorProfile(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        addNotification('Doctor not found, refreshing list...', 'info');
        fetchDoctors(1);
      } else {
        console.error('Failed to fetch doctor profile:', error);
        addNotification('Failed to load doctor profile', 'error');
      }
    }
  };

  const handleDoctorUpdate = (updatedDoctor) => {
    setDoctorsData(prev => 
      prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc)
    );
    setAllDoctorsForStats(prev => 
      prev.map(doc => doc.id === updatedDoctor.id ? updatedDoctor : doc)
    );
    setSelectedDoctor(updatedDoctor);
    addNotification('Doctor updated successfully!', 'success');
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await api.delete(`/doctors/${doctorId}`);

      setDoctorsData(prev => prev.filter(d => d.id !== doctorId));
      setAllDoctorsForStats(prev => prev.filter(d => d.id !== doctorId));

      setShowDoctorProfile(false);
      setSelectedDoctor(null);

      addNotification('Doctor deleted successfully!', 'success');

    } catch (error) {
      console.error('Failed to delete doctor:', error);

      if (error.response?.status === 404) {
        addNotification('Doctor already deleted or not found', 'info');
        setDoctorsData(prev => prev.filter(d => d.id !== doctorId));
        setAllDoctorsForStats(prev => prev.filter(d => d.id !== doctorId));
        setShowDoctorProfile(false);
        setSelectedDoctor(null);
      } else {
        addNotification('Failed to delete doctor', 'error');
      }
    }
  };

  const closeModal = () => {
    setShowAddDoctorModal(false);
    setErrors({});
    setNewDoctor({
      department_id: '', first_name: '', last_name: '', address: '',
      email: '', phone_number: '', experience_years: '', education: '',
      fee: '', commission_percentage: '', profile_picture: null, cv: null,
      gender: ''
    });
  };

  const renderAppointments = () => {
    const filtered = appointmentFilter === 'all' ? appointmentsData : appointmentsData.filter(a => a.status === appointmentFilter);

    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="page-header" variants={itemVariants}>
          <div className="filter-tabs">
            {['all', 'confirmed', 'pending', 'in-progress', 'cancelled'].map(filter => (
              <button key={filter} className={`filter-tab ${appointmentFilter === filter ? 'active' : ''}`} onClick={() => setAppointmentFilter(filter)}>
                {filter === 'all' ? 'All' : filter.replace('-', ' ')}
              </button>
            ))}
          </div>
          <motion.button className="add-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <i className="fa-solid fa-plus"></i> New Appointment
          </motion.button>
        </motion.div>
        <motion.div className="appointments-table-wrapper" variants={itemVariants}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt, index) => (
                <motion.tr key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                  <td><div className="patient-cell"><div className="patient-avatar">{apt.patient.split(' ').map(n => n[0]).join('')}</div><span>{apt.patient} <small>({apt.age} yrs)</small></span></div></td>
                  <td>{apt.doctor}</td>
                  <td><span className="time-badge"><i className="fa-regular fa-clock"></i> {apt.time}</span></td>
                  <td>{apt.type}</td>
                  <td><span className="status-badge">{apt.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="action-btn edit"><i className="fa-solid fa-pen"></i></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="action-btn delete"><i className="fa-solid fa-trash"></i></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    );
  };

  const renderRequests = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="requests-page-grid" variants={itemVariants}>
        <AnimatePresence mode="popLayout">
          {pendingRequests.map((req, index) => (
            <motion.div key={req.id} layout className="request-card-kidcare request-large"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="request-header">
                <span className="request-type">{req.type}</span>
                <small className="request-date">{req.date}</small>
              </div>
              <div className="request-body">
                <div className="doctor-profile">
                  <motion.div className="doctor-avatar" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>{req.avatar}</motion.div>
                  <div className="doctor-info">
                    <p className="doctor-name">{req.doctor}</p>
                    <small>Pediatric Specialist</small>
                  </div>
                </div>
                <div className="request-actions">
                  <motion.button className="btn-approve" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPendingRequests(prev => prev.filter(r => r.id !== req.id)); addNotification('Doctor approved successfully!', 'success'); setNotificationCount(prev => Math.max(0, prev - 1)); }}>
                    <i className="fa-solid fa-check"></i> Approve
                  </motion.button>
                  <motion.button className="btn-reject" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPendingRequests(prev => prev.filter(r => r.id !== req.id)); addNotification('Doctor request rejected.', 'info'); setNotificationCount(prev => Math.max(0, prev - 1)); }}>
                    <i className="fa-solid fa-xmark"></i> Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {pendingRequests.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <i className="fa-solid fa-clipboard-check"></i><p>All doctor requests processed!</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="payments-summary" variants={itemVariants}>
        <div className="payment-stat-card">
          <i className="fa-solid fa-wallet"></i>
          <div><h4>Total Revenue</h4><p>$9,800</p></div>
        </div>
        <div className="payment-stat-card">
          <i className="fa-solid fa-clock"></i>
          <div><h4>Pending</h4><p>$1,450</p></div>
        </div>
        <div className="payment-stat-card">
          <i className="fa-solid fa-check-circle"></i>
          <div><h4>Paid</h4><p>$8,350</p></div>
        </div>
      </motion.div>
      <motion.div className="payments-table-wrapper" variants={itemVariants}>
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Patient</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {paymentsData.map((payment, index) => (
              <motion.tr key={payment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                <td><span className="invoice-badge">{payment.id}</span></td>
                <td>{payment.patient}</td>
                <td>{payment.service}</td>
                <td><span className="amount">${payment.amount}</span></td>
                <td><span className="method-badge"><i className={`fa-solid ${payment.method === 'Card' ? 'fa-credit-card' : payment.method === 'Cash' ? 'fa-money-bill' : 'fa-shield-halved'}`}></i> {payment.method}</span></td>
                <td><span className="status-badge">{payment.status}</span></td>
                <td>{payment.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );

  const renderContent = () => {
    const pages = {
      dashboard: () => <DashboardTab 
        pendingRequests={pendingRequests} 
        setPendingRequests={setPendingRequests}
        addNotification={addNotification}
        notificationCount={notificationCount}
        setNotificationCount={setNotificationCount}
      />,
      insights: () => <SmartInsightsTab 
        doctorsData={doctorsData}
        departmentsData={departmentsData}
      />,
      doctors: () => <DoctorsTab 
        doctorFilter={doctorFilter} 
        setDoctorFilter={setDoctorFilter}
        setShowAddDoctorModal={setShowAddDoctorModal}
        doctorsData={doctorsData}
        setDoctorsData={setDoctorsData}
        pagination={pagination}
        fetchDoctors={fetchDoctors}
        handleDoctorClick={handleDoctorClick}
      />,
      appointments: renderAppointments,
      departments: () => <DepartmentsTab />, 
      requests: renderRequests,
      payments: renderPayments,
      statistics: () => <StatisticsTab 
        selectedDoctorId={selectedDoctorId} 
        setSelectedDoctorId={setSelectedDoctorId}
        doctorsData={allDoctorsForStats}  
      />,
      myaccount: () => <MyAccountTab />,
      settings: () => <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} />,
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div key={activePage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {isLoading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="loading-card"><div className="loading-shimmer"></div></div>)}
            </div>
          ) : (
            pages[activePage] ? pages[activePage]() : (
              <motion.div className="placeholder-text" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <i className={`fa-solid ${sidebarItems.find(i => i.id === activePage)?.icon} fa-3x`}></i>
                <h2>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
                <p>This page is under development. Coming soon...</p>
              </motion.div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : ''}`}>
      <AddDoctorModal
        showAddDoctorModal={showAddDoctorModal}
        newDoctor={newDoctor}
        errors={errors}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmitDoctor={handleSubmitDoctor}
        closeModal={closeModal}
      />

      <DoctorProfileModal
        show={showDoctorProfile}
        doctor={selectedDoctor}
        onUpdate={handleDoctorUpdate}
        onDelete={handleDeleteDoctor}
        onClose={() => {
          setShowDoctorProfile(false);
          setSelectedDoctor(null);
        }}
      />

      <div className="toast-container">
        <AnimatePresence>
          {notifications.map(notif => (
            <Toast key={notif.id} message={notif.message} type={notif.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            />
          ))}
        </AnimatePresence>
      </div>

      <SmartInsights 
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        doctorsData={doctorsData}
        departmentsData={departmentsData}
        onInsightRead={() => {
          const saved = localStorage.getItem('kidcare_insights');
          if (saved) {
            const insights = JSON.parse(saved);
            setInsightCount(insights.filter(i => !i.read).length);
          }
        }}
      />

      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        darkMode={darkMode}
      />

      <main className="main-wrapper">
        <motion.header className="main-header glass-effect" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
          <div className="header-greeting">
            <motion.h1 key={activePage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {sidebarItems.find(i => i.id === activePage)?.label}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} â€¢ {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </motion.p>
          </div>
          <div className="header-right">
            <div className="search-box-wrapper" style={{ position: 'relative' }}>
              <motion.div className="search-box-kidcare" whileFocus={{ scale: 1.02 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search doctors" 
                  value={searchQuery} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    if (value.length < 2) {
                      setShowSearchDropdown(false);
                      return;
                    }

                    const filtered = allDoctorsForStats.filter(doc => 
                      doc.full_name?.toLowerCase().includes(value.toLowerCase()) ||
                      doc.department?.toLowerCase().includes(value.toLowerCase())
                    );

                    setSearchResults(filtered);
                    setShowSearchDropdown(true);
                  }}
                />
                {searchQuery && (
                  <i 
                    className="fa-solid fa-xmark" 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#90A4AE' }}
                    onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                  ></i>
                )}
              </motion.div>

              {showSearchDropdown && (
                <div className="search-dropdown" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  padding: '8px',
                  zIndex: 9999,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {searchResults.length > 0 ? (
                    searchResults.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setActivePage('doctors');
                          setSelectedDoctorId(doc.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#E3F2FD'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#E3F2FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4FC3F7',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {doc.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1565C0' }}>
                            Dr. {doc.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#90A4AE' }}>
                            {doc.department || 'General'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#90A4AE', fontSize: '14px' }}>
                      No doctors found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="action-icons">
              <motion.button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.4 }}>
                <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </motion.button>
              <motion.div 
                className="admin-avatar" 
                whileHover={{ scale: 1.1, borderColor: '#4FC3F7' }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePage('myaccount')}
                style={{ cursor: 'pointer' }}
              >
                A
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="content-container">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard;
`

## D:\my-first-app\src\features\admin\tabs\DashboardTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber, QuickStatCard, StatCard } from '../components/SharedComponents';
import api from '../../../api/axios';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const DashboardTab = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    presentDoctors: 0,
    appointmentsToday: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    topDoctor: null,
    topDepartment: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          patientsRes,
          doctorsRes,
          appointmentsRes,
          occupancyRes,
          monthlyRevenueRes,
          dailyRevenueRes,
          topDoctorRes,
          topDepartmentRes,
        ] = await Promise.allSettled([
          api.get('/home/patients-count'),
          api.get('/home/present-doctors-count'),
          api.get('/home/appointments-count'),
          api.get('/home/clinic-occupancy'),
          api.get('/monthly-revenue'),
          api.get('/daily-revenue'),
          api.get('/doctors/top-this-week'),
          api.get('/home/top-department'),
        ]);

        const getData = (res) => {
          if (res.status === 'rejected') {
            console.warn('API call rejected:', res.reason?.message || res.reason);
            return null;
          }
          return res.value?.data ?? null;
        };

        const patientsData = getData(patientsRes);
        const doctorsData = getData(doctorsRes);
        const appointmentsData = getData(appointmentsRes);
        const occupancyData = getData(occupancyRes);
        const monthlyData = getData(monthlyRevenueRes);
        const dailyData = getData(dailyRevenueRes);
        const topDoctorData = getData(topDoctorRes);
        const topDeptData = getData(topDepartmentRes);

        setStats({
          totalPatients: patientsData?.patients_count || 0,
          presentDoctors: doctorsData?.data?.present_doctors_count || 0,
          appointmentsToday: appointmentsData?.data?.today_appointments_count || 0,
          occupancyRate: parseFloat(occupancyData?.data?.clinic_occupancy_percentage) || 0,
          monthlyRevenue: monthlyData?.data?.financials?.total_revenue || 0,
          dailyRevenue: dailyData?.data?.financials?.total_revenue || 0,
          topDoctor: topDoctorData?.data || null,
          topDepartment: topDeptData?.data || null,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error(' Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading dashboard...</div>
      </motion.div>
    );
  }

  if (stats.error) {
    return (
      <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="error-message">{stats.error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible" exit="exit">

      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard 
          icon="fa-users" 
          label="Total Patients" 
          value={<AnimatedNumber value={stats.totalPatients} />} 
          color="blue" 
        />
        <QuickStatCard 
          icon="fa-user-doctor" 
          label="Active Doctors" 
          value={<AnimatedNumber value={stats.presentDoctors} />} 
          color="green" 
        />
        <QuickStatCard 
          icon="fa-calendar-check" 
          label="Today's Appointments" 
          value={<AnimatedNumber value={stats.appointmentsToday} />} 
          color="purple" 
        />
        <QuickStatCard 
          icon="fa-bed-pulse" 
          label="Occupancy Rate" 
          value={`${stats.occupancyRate}%`} 
          color="orange" 
        />
      </motion.section>

      <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>

        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Financial Overview</h3>

          <StatCard 
            title="Monthly Revenue" 
            value={`$${stats.monthlyRevenue.toLocaleString('en-US')}`} 
            sub={`Net Profit: $${(stats.monthlyRevenue * 0.7).toLocaleString('en-US')}`}
            progress={75} 
            icon="fa-wallet" 
            color="blue" 
          />

          <StatCard 
            title="Daily Revenue" 
            value={`$${stats.dailyRevenue.toLocaleString('en-US')}`} 
            sub={`Clinic Profit: $${(stats.dailyRevenue * 0.6).toLocaleString('en-US')}`}
            progress={stats.dailyRevenue > 0 ? Math.min((stats.dailyRevenue / 1000) * 100, 100) : 0} 
            icon="fa-money-bill-transfer" 
            color="orange" 
          />
        </motion.div>

        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Performance Stats</h3>

          <StatCard 
            title="Top Doctor This Week" 
            value={stats.topDoctor?.doctor_name || 'No data'} 
            sub={`${stats.topDoctor?.appointments_count || 0} Appointments â€¢ ${stats.topDoctor?.department_name || ''}`} 
            icon="fa-award" 
            color="purple" 
          />

          <StatCard 
            title="Top Department" 
            value={stats.topDepartment?.department_name || 'No data'} 
            sub={`${stats.topDepartment?.appointments_count || 0} Appointments This Week`} 
            icon="fa-stethoscope" 
            color="pink" 
          />
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default DashboardTab;
`

## D:\my-first-app\src\features\admin\tabs\DepartmentsTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const departmentColors = {
  'Pediatrics': '#4FC3F7',
  'Dentistry': '#EF5350',
  'Psychiatry': '#AB47BC',
  'Vaccination': '#66BB6A',
  'General': '#FFA726',
  'Cardiology': '#42A5F5',
  'Neurology': '#EC407A',
};

const getDepartmentColor = (name) => {
  return departmentColors[name] || '#4FC3F7';
};

const DonutChart = ({ percentage, color, label }) => (
  <div className="donut-chart-container">
    <ResponsiveContainer width={140} height={140}>
      <PieChart>
        <Pie
          data={[{ value: percentage }, { value: 100 - percentage }]}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={60}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          animationDuration={1500}
        >
          <Cell fill={color} />
          <Cell fill="rgba(79,195,247,0.1)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="donut-label">
      <span className="donut-percentage">{percentage}%</span>
      <span className="donut-text">{label}</span>
    </div>
  </div>
);

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/daily-report');
        console.log('Departments data:', response.data);

        if (response.data.status === 'success') {
          setDepartments(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading departments...</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="departments-grid" variants={itemVariants}>
        {departments.map((dept, index) => {
          const color = getDepartmentColor(dept.department_name);
          const occupancy = parseFloat(dept.occupancy_percentage) || 0;

          return (
            <motion.div key={dept.department_id} className="department-card" variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: `0 15px 40px ${color}20` }}
            >
              <div className="dept-header" style={{ borderBottom: `3px solid ${color}` }}>
                <div className="dept-icon" style={{ background: `${color}20`, color: color }}>
                  <i className="fa-solid fa-hospital"></i>
                </div>
                <div className="dept-info">
                  <h4>{dept.department_name}</h4>
                </div>
              </div>
              <div className="dept-stats">
                <div className="dept-stat"><i className="fa-solid fa-user-doctor"></i><span>{dept.doctors} Doctors</span></div>
                <div className="dept-stat"><i className="fa-solid fa-users"></i><span>{dept.patients} Patients</span></div>
                <div className="dept-stat"><i className="fa-solid fa-bed"></i><span>{dept.max_available_slots} Slots</span></div>
              </div>
              <div className="dept-occupancy">
                <div className="occupancy-header"><span>Occupancy</span><span style={{ color: color }}>{dept.occupancy_percentage}</span></div>
                <div className="progress-bar-kidcare">
                  <motion.div className="progress-fill" style={{ background: color }}
                    initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </div>
              </div>
              <DonutChart percentage={occupancy} color={color} label="Full" />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default DepartmentsTab;
`

## D:\my-first-app\src\features\admin\tabs\DoctorsTab.jsx

`javascript
import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// âœ… normalizeDoctor
const normalizeDoctor = (doctor) => {
  if (!doctor) return null;

  const fullName = doctor.full_name 
    || (doctor.first_name && doctor.last_name 
        ? `${doctor.first_name} ${doctor.last_name}` 
        : null)
    || doctor.name 
    || 'Unknown Doctor';

  let departmentName = 'No Department';
  if (typeof doctor.department === 'object' && doctor.department !== null) {
    departmentName = doctor.department.name || 'No Department';
  } else if (typeof doctor.department === 'string') {
    departmentName = doctor.department;
  } else if (doctor.department_id) {
    departmentName = `Department ${doctor.department_id}`;
  }

  let currentStatus = doctor.current_status || doctor.status;

  if (!currentStatus && doctor.availabilities && doctor.availabilities.length > 0) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayAvail = doctor.availabilities.find(
      a => a.day_of_week?.toLowerCase() === today.toLowerCase()
    );

    if (todayAvail) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = (todayAvail.start_time || '00:00').split(':').map(Number);
      const [endHour, endMinute] = (todayAvail.end_time || '00:00').split(':').map(Number);

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (currentTime >= startTime && currentTime <= endTime) {
        currentStatus = 'Available';
      } else {
        currentStatus = 'Out of Schedule';
      }
    } else {
      currentStatus = 'Out of Schedule';
    }
  }

  if (currentStatus === 'Available' && doctor.appointments_count > 0) {
    currentStatus = 'Busy';
  }

  return {
    id: doctor.id,
    full_name: fullName,
    first_name: doctor.first_name || '',
    last_name: doctor.last_name || '',
    current_status: currentStatus || 'Unknown',
    department: departmentName,
    department_id: typeof doctor.department === 'object' 
      ? doctor.department?.id 
      : doctor.department_id,
    patients_count: doctor.patients_count ?? doctor.patients ?? 0,
    experience_years: doctor.experience_years ?? doctor.experience ?? 0,
    image: doctor.image || doctor.avatar || doctor.profile_picture || null,
    phone_number: doctor.phone_number || doctor.phone || '',
    email: doctor.email || '',
    address: doctor.address || '',
    gender: doctor.gender || '',
    education: doctor.education || '',
    fee: doctor.fee ?? '',
    commission_percentage: doctor.commission_percentage ?? '',
    cv: doctor.cv || null,
    availabilities: doctor.availabilities || [],
  };
};

const DoctorsTab = ({ 
  doctorFilter, 
  setDoctorFilter, 
  setShowAddDoctorModal, 
  doctorsData, 
  setDoctorsData,
  pagination, 
  fetchDoctors, 
  handleDoctorClick 
}) => {

  const normalizedDoctors = (Array.isArray(doctorsData) ? doctorsData : []).map(normalizeDoctor).filter(Boolean);

  const filtered = doctorFilter === 'all' 
    ? normalizedDoctors 
    : normalizedDoctors.filter(d => d.current_status === doctorFilter);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image !== 'string') return null;
    if (image.startsWith('http')) return image;
    const baseUrl = 'https://kidcare.sy/storage/';
    return `${baseUrl}${image.replace(/^storage\//, '').replace(/^\/+/, '')}`;
  };

  const renderAvatar = (doctor) => {
    if (!doctor) return '?';

    const imageUrl = getImageUrl(doctor.image);

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={doctor.full_name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerText = getInitials(doctor.full_name);
            }
          }}
        />
      );
    }
    return getInitials(doctor.full_name);
  };

  // âœ… StatusBadge Ù…Ø¹Ø¯Ù„ Ù„Ø¯Ø¹Ù… ÙƒÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª ÙˆØ§Ù„ØªØ­ÙƒÙ… Ø¨Ø§Ù„Ø£Ù„ÙˆØ§Ù†
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Available': '#22c55e',       // Ø£Ø®Ø¶Ø±
      'active': '#22c55e',
      'available': '#22c55e',
      'Busy': '#ef4444',            // Ø£Ø­Ù…Ø±
      'busy': '#ef4444',
      'Out of Schedule': '#3b82f6', // Ø£Ø²Ø±Ù‚ Ù…Ø±ÙŠØ­ Ù„Ù„Ø­Ø§Ù„Ø© Ø®Ø§Ø±Ø¬ Ø§Ù„Ø¯ÙˆØ§Ù…/ØºÙŠØ± Ù…ØªØ§Ø­
      'Offline': '#3b82f6',
      'offline': '#3b82f6',
      'on-leave': '#f59e0b',        // Ø¨Ø±ØªÙ‚Ø§Ù„ÙŠ Ù„Ù„Ø¥Ø¬Ø§Ø²Ø§Øª
    };

    const statusLabels = {
      'Available': 'Available',
      'active': 'Available',
      'available': 'Available',
      'Busy': 'Busy',
      'busy': 'Busy',
      'Out of Schedule': 'Offline',
      'Offline': 'Offline',
      'offline': 'Offline',
      'on-leave': 'On Leave',
    };

    const safeStatus = status || 'Unknown';
    const bg = statusColors[safeStatus] || statusColors[safeStatus.toLowerCase()] || '#3b82f6';
    const label = statusLabels[safeStatus] || safeStatus;

    return (
      <span className="status-badge" style={{ background: bg, color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
        {label}
      </span>
    );
  };

  const getPageNumbers = () => {
    const pages = [];
    const { current_page, last_page } = pagination || {};

    if (!last_page || last_page <= 1) return pages;

    if (last_page <= 7) {
      for (let i = 1; i <= last_page; i++) pages.push(i);
    } else {
      if (current_page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(last_page);
      } else if (current_page >= last_page - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = last_page - 4; i <= last_page; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current_page - 1; i <= current_page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(last_page);
      }
    }
    return pages;
  };

  const safePagination = pagination || { current_page: 1, last_page: 1, total: 0 };

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants}>
        <div className="filter-tabs">
          {['all', 'Available', 'Busy', 'Out of Schedule'].map(filter => (
            <button key={filter} className={`filter-tab ${doctorFilter === filter ? 'active' : ''}`} onClick={() => setDoctorFilter(filter)}>
              {filter === 'all' ? 'All' : filter === 'Out of Schedule' ? 'Offline' : filter}
            </button>
          ))}
        </div>
        <motion.button className="add-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddDoctorModal(true)}>
          <i className="fa-solid fa-plus"></i> Add Doctor
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: '16px', color: '#78909C', fontSize: '14px' }}>
        Showing {filtered.length} of {safePagination.total} doctors
        {safePagination.total > 0 && ` (Page ${safePagination.current_page} of ${safePagination.last_page})`}
      </motion.div>

      <div className="doctors-grid">
        {filtered.map((doctor, index) => {
          const isAvailable = doctor.current_status === 'Available' || doctor.current_status === 'active';

          return (
            <motion.div 
              key={doctor.id || `doctor-${index}`} 
              className="doctor-card" 
              variants={itemVariants}
              onClick={() => doctor.id && handleDoctorClick(doctor.id)}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(79,195,247,0.15)' }}
            >
              <div className="doctor-card-header">
                <div className="doctor-avatar-large" style={{
                  background: doctor.image
                    ? '#f0f0f0'
                    : `linear-gradient(135deg, ${isAvailable ? '#E1F5FE' : '#FFF3E0'}, ${isAvailable ? '#B3E5FC' : '#FFE0B2'})`,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%'
                }}>
                  {renderAvatar(doctor)}
                </div>
                <StatusBadge status={doctor.current_status} />
              </div>
              <h4 className="doctor-name">{doctor.full_name}</h4>
              <p className="doctor-specialty">{doctor.department}</p>
              <div className="doctor-stats">
                <div className="doctor-stat">
                  <i className="fa-solid fa-users"></i>
                  <span>{doctor.patients_count} Patients</span>
                </div>
                <div className="doctor-stat">
                  <i className="fa-solid fa-briefcase"></i>
                  <span>{doctor.experience_years} Yrs</span>
                </div>
              </div>
              <div className="doctor-contact">
                {doctor.phone_number && (
                  <p><i className="fa-solid fa-phone"></i> {doctor.phone_number}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state"
          style={{ textAlign: 'center', padding: '60px 20px', color: '#78909C' }}
        >
          <i className="fa-solid fa-user-doctor fa-3x" style={{ marginBottom: '16px', color: '#B0BEC5' }}></i>
          <p>No doctors found {doctorFilter !== 'all' ? `with status "${doctorFilter}"` : ''}</p>
        </motion.div>
      )}

      {safePagination.last_page > 1 && (
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            marginTop: '32px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => fetchDoctors(safePagination.current_page - 1)}
            disabled={safePagination.current_page === 1}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: safePagination.current_page === 1 ? '#F5F5F5' : '#fff',
              color: safePagination.current_page === 1 ? '#BDBDBD' : '#2196F3',
              cursor: safePagination.current_page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={`page-${index}`}>
              {page === '...' ? (
                <span style={{ color: '#78909C', padding: '0 4px', fontSize: '14px' }}>...</span>
              ) : (
                <button
                  onClick={() => fetchDoctors(page)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: safePagination.current_page === page ? '#2196F3' : '#E0E0E0',
                    background: safePagination.current_page === page ? '#2196F3' : '#fff',
                    color: safePagination.current_page === page ? '#fff' : '#546E7A',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: safePagination.current_page === page ? '600' : '500',
                    minWidth: '40px',
                    transition: 'all 0.2s',
                  }}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => fetchDoctors(safePagination.current_page + 1)}
            disabled={safePagination.current_page === safePagination.last_page}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: safePagination.current_page === safePagination.last_page ? '#F5F5F5' : '#fff',
              color: safePagination.current_page === safePagination.last_page ? '#BDBDBD' : '#2196F3',
              cursor: safePagination.current_page === safePagination.last_page ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export { normalizeDoctor };
export default DoctorsTab;
`

## D:\my-first-app\src\features\admin\tabs\MyAccountTab.jsx

`javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';  

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const adminProfile = {
  name: 'Admin User',
  role: 'System Administrator',
  email: 'admin@kidcare.com',
  phone: '+963 96 853 9430',
  joinDate: '2020-01-15',
  avatar: 'A',
  lastLogin: '2024-05-18 09:30 AM',
};

const MyAccountTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [receptionFormData, setReceptionFormData] = useState({
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [receptionLoading, setReceptionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [receptionMessage, setReceptionMessage] = useState(null);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');  
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      sessionStorage.removeItem('reception_token');
      sessionStorage.removeItem('reception_user');
      window.location.href = '/login';
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
      const phoneNumber = user.phone_number || adminProfile.phone;

      const formDataToSend = new FormData();
      formDataToSend.append('phone_number', phoneNumber);
      formDataToSend.append('password', formData.new_password);
      formDataToSend.append('password_confirmation', formData.confirm_password);

      await api.post('/SetAdminPassword', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => {
        setShowModal(false);
        setFormData({ old_password: '', new_password: '', confirm_password: '' });
        setMessage(null);
      }, 1500);

    } catch (error) {
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);

      const errorData = error.response?.data;
      let errorMsg = 'An error occurred';

      if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join(' | ');
      }

      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleReceptionChange = (e) => {
    setReceptionFormData({ ...receptionFormData, [e.target.name]: e.target.value });
  };

  const handleReceptionSubmit = async (e) => {
    e.preventDefault();

    if (receptionFormData.password !== receptionFormData.password_confirmation) {
      setReceptionMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setReceptionLoading(true);
    setReceptionMessage(null);

    try {
      const params = new URLSearchParams();
      params.append('password', receptionFormData.password);
      params.append('password_confirmation', receptionFormData.password_confirmation);

      await api.put('/admin/receptionists/1/change-password',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      setReceptionMessage({ type: 'success', text: 'Reception password changed successfully' });
      setTimeout(() => {
        setShowReceptionModal(false);
        setReceptionFormData({ password: '', password_confirmation: '' });
        setReceptionMessage(null);
      }, 1500);

    } catch (error) {
      console.log('Reception Error status:', error.response?.status);
      console.log('Reception Error data:', error.response?.data);

      const errorData = error.response?.data;
      let errorMsg = 'An error occurred';

      if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join(' | ');
      }

      setReceptionMessage({ type: 'error', text: errorMsg });
    } finally {
      setReceptionLoading(false);
    }
  };

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="account-card" variants={itemVariants}>
        <div className="account-header">
          <motion.div className="account-avatar" whileHover={{ scale: 1.05 }}>
            {adminProfile.avatar}
          </motion.div>
          <div className="account-info">
            <h2>{adminProfile.name}</h2>
            <p className="account-role">{adminProfile.role}</p>
          </div>
        </div>

        <div className="account-details">
          <div className="detail-group">
            <h4><i className="fa-solid fa-envelope"></i> Email</h4>
            <p>{adminProfile.email}</p>
          </div>
          <div className="detail-group">
            <h4><i className="fa-solid fa-phone"></i> Phone</h4>
            <p>{adminProfile.phone}</p>
          </div>
        </div>

        <div className="account-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <motion.button 
            className="btn-secondary" 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
          >
            <i className="fa-solid fa-key"></i> Change Password
          </motion.button>

          <motion.button 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#4caf50', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowReceptionModal(true)}
          >
            <i className="fa-solid fa-user-shield"></i> Change Reception Password
          </motion.button>

          <motion.button 
            className="btn-danger" 
            style={{ 
              backgroundColor: '#ef5350', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i> Log Out
          </motion.button>
        </div>
      </motion.div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3><i className="fa-solid fa-key"></i> Change Password</h3>

            {message && (
              <div className={`alert alert-${message.type}`} style={{ marginBottom: '15px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showReceptionModal && (
        <div className="modal-overlay" onClick={() => setShowReceptionModal(false)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3><i className="fa-solid fa-user-shield"></i> Change Reception Password</h3>

            {receptionMessage && (
              <div className={`alert alert-${receptionMessage.type}`} style={{ marginBottom: '15px' }}>
                {receptionMessage.text}
              </div>
            )}

            <form onSubmit={handleReceptionSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={receptionFormData.password}
                  onChange={handleReceptionChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={receptionFormData.password_confirmation}
                  onChange={handleReceptionChange}
                  required
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowReceptionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={receptionLoading}>
                  {receptionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MyAccountTab;
`

## D:\my-first-app\src\features\admin\tabs\SettingsTab.jsx

`javascript
import React from 'react';
import { motion } from 'framer-motion';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const SettingsTab = ({ darkMode, setDarkMode }) => (
  <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div className="settings-card" variants={itemVariants}>
      <h3><i className="fa-solid fa-sliders"></i> General Settings</h3>
      <div className="setting-item">
        <div>
          <h4>Dark Mode</h4>
          <p>Toggle between light and dark theme</p>
        </div>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={() => setDarkMode(!darkMode)} 
          />
          <span className="toggle-slider"></span>
        </label>
      </div>  
    </motion.div>
  </motion.div>
);

export default SettingsTab;
`

## D:\my-first-app\src\features\admin\tabs\SmartInsightsTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import SmartInsights from "../components/SmartInsights";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SmartInsightsTab = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchAllData = async (signal) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      
      const firstDocRes = await api.get('/doctors?page=1', { signal });
      const firstPageDocs = firstDocRes.data?.data || [];
      const lastPage = firstDocRes.data?.pagination?.last_page || 1;

      let allDoctors = [...firstPageDocs];

      
      if (lastPage > 1) {
        const pagePromises = [];
        for (let page = 2; page <= lastPage; page++) {
          pagePromises.push(api.get(`/doctors?page=${page}`, { signal }));
        }
        const extraResponses = await Promise.all(pagePromises);
        extraResponses.forEach(res => {
          allDoctors = [...allDoctors, ...(res.data?.data || [])];
        });
      }

      const formattedDoctors = allDoctors.map(doc => ({
        id: doc.id,
        name: `Dr. ${doc.full_name}`,
        patients: doc.patients_count || 0,
        appointments: doc.appointments_count || 0,
        experience: doc.experience_years || 0,
        workingHours: doc.weekly_working_hours || 0,
        status: doc.status || 'active',
      }));

      
      const [deptsResponse, ageRes, budgetRes, weeklyRes] = await Promise.all([
        api.get('/departments', { signal }),
        api.get('/reports/children-age-distribution', { signal }),
        api.get('/reports/monthly-budget', { signal }),
        api.get('/reports/appointments-per-weekday', { signal }),
      ]);

      const depts = deptsResponse.data?.data || [];
      const formattedDepts = depts.map(dept => ({
        id: dept.id,
        name: dept.name,
        patients: dept.patients_count || 0,
        capacity: dept.capacity || 100,
      }));

      setDoctorsData(formattedDoctors);
      setDepartmentsData(formattedDepts);

      if (ageRes.data?.status === 'success') {
        setAgeDistribution(ageRes.data.data?.map(item => ({
          range: item.age_range,
          count: item.children_count
        })) || []);
      }

      if (budgetRes.data?.status === 'success') {
        setRevenueData((budgetRes.data.data || []).map(item => ({
          month: item.month_name?.slice(0, 3) || '',
          revenue: item.income_details?.total_income || 0,
          expenses: item.expense_details?.total_expense || 0,
        })));
      }

      if (weeklyRes.data?.status === 'success') {
        const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const weeklyData = weeklyRes.data.data || [];
        const arr = days.map(day => {
          const found = weeklyData.find(d => d.day_name?.slice(0, 3) === day);
          return found ? found.appointments_count : 0;
        });
        setWeeklyAppointments(arr);
      }

    } catch (error) {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error('Error fetching insights data:', error);
        setErrorMsg('Failed to load insights data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAllData(controller.signal);

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>Loading insights...</p>
        </div>
      </motion.div>
    );
  }

  if (errorMsg) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="error-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ef5350', marginBottom: '15px' }}>{errorMsg}</p>
          <button className="btn-primary" onClick={() => fetchAllData()}>
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants} />

      <SmartInsights 
        isOpen={true}
        onClose={() => {}}
        doctorsData={doctorsData}
        departmentsData={departmentsData}
        ageDistribution={ageDistribution}
        revenueData={revenueData}
        weeklyAppointments={weeklyAppointments}
        inlineMode={true}
      />
    </motion.div>
  );
};

export default SmartInsightsTab;
`

## D:\my-first-app\src\features\admin\tabs\StatisticsTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import Select from 'react-select';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const CreativeAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#EF5350" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#EF5350" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
      <XAxis dataKey="month" stroke="#90A4AE" fontSize={12} />
      <YAxis stroke="#90A4AE" fontSize={12} />
      <Tooltip contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
      <Area type="monotone" dataKey="revenue" stroke="#4FC3F7" strokeWidth={3} fill="url(#colorRevenue)" />
      <Area type="monotone" dataKey="expenses" stroke="#EF5350" strokeWidth={3} fill="url(#colorExpenses)" />
    </AreaChart>
  </ResponsiveContainer>
);

const CreativePieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" animationBegin={0} animationDuration={1500}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
    </PieChart>
  </ResponsiveContainer>
);

const CreativeBarChart = ({ data, dataKey = "appointments", color = "#4FC3F7" }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
      <XAxis dataKey="day" stroke="#90A4AE" fontSize={12} />
      <YAxis stroke="#90A4AE" fontSize={12} />
      <Tooltip cursor={{ fill: 'rgba(79,195,247,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
      <Bar dataKey={dataKey} fill={color} radius={[12, 12, 0, 0]} animationDuration={1500}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={index === 3 ? '#29B6F6' : '#81D4FA'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const CreativeRadarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
      <PolarGrid stroke="rgba(79,195,247,0.2)" />
      <PolarAngleAxis dataKey="subject" stroke="#90A4AE" fontSize={12} />
      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#90A4AE" fontSize={10} />
      <Radar name="Performance" dataKey="A" stroke="#4FC3F7" strokeWidth={3} fill="#4FC3F7" fillOpacity={0.2} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
    </RadarChart>
  </ResponsiveContainer>
);

const StatisticsTab = ({ selectedDoctorId, setSelectedDoctorId }) => {
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState([]);
  const [departmentsShare, setDepartmentsShare] = useState([]);
  const [weeklyAppointmentsData, setWeeklyAppointmentsData] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllDoctorsPages = async () => {
      try {
        const firstPageRes = await api.get('/doctors?page=1', { signal: controller.signal });
        const firstPageData = firstPageRes.data?.data || [];
        const lastPage = firstPageRes.data?.pagination?.last_page || 1;

        let allDoctors = [...firstPageData];

        if (lastPage > 1) {
          const pagePromises = [];
          for (let page = 2; page <= lastPage; page++) {
            pagePromises.push(api.get(`/doctors?page=${page}`, { signal: controller.signal }));
          }
          const extraResponses = await Promise.all(pagePromises);
          extraResponses.forEach(res => {
            allDoctors = [...allDoctors, ...(res.data?.data || [])];
          });
        }

        const formatted = allDoctors.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.full_name}`,
        }));

        setDoctorsList(formatted);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching doctors:', error);
        }
      }
    };

    fetchAllDoctorsPages();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorsList[0].id);
    }
  }, [doctorsList, selectedDoctorId, setSelectedDoctorId]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStatistics = async () => {
      setLoading(true);
      const doctorId = selectedDoctorId || doctorsList[0]?.id;

      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.allSettled([
          api.get('/reports/children-age-distribution', { signal: controller.signal }),
          api.get(`/reports/${doctorId}/weekly-stats`, { signal: controller.signal }),
          api.get('/reports/weekly-summary', { signal: controller.signal }),
          api.get('/reports/monthly-budget', { signal: controller.signal }),
          api.get('/reports/top-three-departments-share', { signal: controller.signal }),
          api.get('/reports/appointments-per-weekday', { signal: controller.signal }),
        ]);

        const [ageRes, docStatsRes, summaryRes, budgetRes, deptsRes, weeklyRes] = results;

        if (ageRes.status === 'fulfilled' && ageRes.value.data?.status === 'success') {
          setAgeDistribution(ageRes.value.data.data?.map(item => ({
            age: item.age_range,
            count: item.children_count
          })) || []);
        }

        if (docStatsRes.status === 'fulfilled' && docStatsRes.value.data?.status === 'success') {
          setWeeklyStats(docStatsRes.value.data.data);
        } else {
          setWeeklyStats(null);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.status === 'success') {
          setWeeklySummary(summaryRes.value.data.data);
        }

        if (budgetRes.status === 'fulfilled' && budgetRes.value.data?.status === 'success') {
          setMonthlyBudget(budgetRes.value.data.data || []);
        }

        if (deptsRes.status === 'fulfilled' && deptsRes.value.data?.status === 'success') {
          setDepartmentsShare(deptsRes.value.data.data || []);
        }

        if (weeklyRes.status === 'fulfilled' && weeklyRes.value.data?.status === 'success') {
          setWeeklyAppointmentsData(weeklyRes.value.data.data || []);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching statistics:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (doctorsList.length > 0) {
      fetchStatistics();
    }

    return () => controller.abort();
  }, [doctorsList]);

  useEffect(() => {
    if (!selectedDoctorId || doctorsList.length === 0) return;

    const doctorExists = doctorsList.some(doc => doc.id === selectedDoctorId);
    if (!doctorExists) return;

    const controller = new AbortController();

    const fetchDoctorStats = async () => {
      try {
        const response = await api.get(`/reports/${selectedDoctorId}/weekly-stats`, { signal: controller.signal });
        if (response.data?.status === 'success') {
          setWeeklyStats(response.data.data);
        }
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
          setWeeklyStats(null);
        }
      }
    };

    fetchDoctorStats();
    return () => controller.abort();
  }, [selectedDoctorId, doctorsList]);

  const doctorOptions = doctorsList.map(doc => ({
    value: doc.id,
    label: doc.name
  }));

  const selectedOption = doctorOptions.find(opt => opt.value === selectedDoctorId) || null;

  const monthlyRevenue = monthlyBudget.map(item => ({
    month: item.month_name?.slice(0, 3) || '',
    revenue: item.income_details?.total_income || 0,
    expenses: item.expense_details?.total_expense || 0,
  }));

  const departmentDistribution = departmentsShare.map(dept => ({
    name: dept.department_name,
    value: dept.appointments_count || 0,
    color: dept.department_id === 1 ? '#4FC3F7' : 
           dept.department_id === 2 ? '#EF5350' : '#AB47BC',
  }));

  const weeklyAppointments = weeklyAppointmentsData.map(day => ({
    day: day.day_name?.slice(0, 3) || '',
    appointments: day.appointments_count || 0,
  }));

  const getDoctorPerformance = () => {
    if (!weeklyStats) return [];

    return [
      { subject: 'Appointments', A: Math.round(Math.min(((weeklyStats.weekly_appointments || 0) / 50) * 100, 100)), fullMark: 100 },
      { subject: 'Patients', A: Math.round(Math.min(((weeklyStats.weekly_patients || 0) / 30) * 100, 100)), fullMark: 100 },
      { subject: 'Hours', A: Math.round(Math.min(((weeklyStats.weekly_working_hours || 0) / 40) * 100, 100)), fullMark: 100 },
      { subject: 'Experience', A: Math.round(Math.min(((weeklyStats.experience_years || 0) / 15) * 100, 100)), fullMark: 100 },
    ];
  };

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>Loading statistics...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
    
      <motion.div className="manager-insights-grid" variants={itemVariants}>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E8F5E9', color: '#66BB6A' }}>
            <i className="fa-solid fa-door-open"></i>
          </div>
          <div className="insight-content">
            <h4>Weekly Appointments</h4>
            <p className="insight-value">{weeklySummary?.total_confirmed_and_completed || 0}</p>
            <small>This week's total</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E1F5FE', color: '#4FC3F7' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="insight-content">
            <h4>Active Doctors</h4>
            <p className="insight-value">{weeklySummary?.active_doctors_this_week || 0}</p>
            <small>Working this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FFF3E0', color: '#FF9800' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="insight-content">
            <h4>Available Slots</h4>
            <p className="insight-value">{weeklySummary?.available_appointments_left || 0}</p>
            <small>Remaining this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FCE4EC', color: '#EC407A' }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="insight-content">
            <h4>Busiest Day</h4>
            <p className="insight-value">{weeklySummary?.busiest_day_of_week?.day_name || '-'}</p>
            <small>{weeklySummary?.busiest_day_of_week?.appointments_count || 0} appointments</small>
          </div>
        </motion.div>
      </motion.div>

      <div className="charts-grid">
        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-area"></i> Monthly Revenue vs Expenses</h4>
          <CreativeAreaChart data={monthlyRevenue} />
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-pie"></i> Department Distribution</h4>
          <CreativePieChart data={departmentDistribution} />
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-bar"></i> Weekly Appointments</h4>
          <CreativeBarChart data={weeklyAppointments} />
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header-with-select">
            <h4 className="chart-title"><i className="fa-solid fa-bullseye"></i> Doctor Performance</h4>

            <Select
              value={selectedOption}
              onChange={(option) => setSelectedDoctorId(option?.value)}
              options={doctorOptions}
              placeholder="Select a doctor..."
              isSearchable={true}
              maxMenuHeight={300}
              menuPlacement="auto"
              className="doctor-select-react"
              classNamePrefix="doctor-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  border: '2px solid rgba(79, 195, 247, 0.2)',
                  padding: '2px 8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '250px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#4FC3F7' },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: state.isSelected ? '#4FC3F7' : state.isFocused ? '#E1F5FE' : '#fff',
                  color: state.isSelected ? '#fff' : '#1565C0',
                  cursor: 'pointer',
                  '&:active': { backgroundColor: '#4FC3F7' },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#1565C0',
                  fontWeight: '700',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#90A4AE',
                }),
              }}
            />
          </div>

          <CreativeRadarChart data={getDoctorPerformance()} />

          {weeklyStats && (
            <div className="selected-doctor-info">
              <p>
                <strong>{weeklyStats.doctor_name}</strong> | 
                Department: {weeklyStats.department_id} | 
                Appointments: {weeklyStats.weekly_appointments || 0} | 
                Patients: {weeklyStats.weekly_patients || 0}
              </p>
              <small>
                Week: {weeklyStats.week_range?.start_saturday} to {weeklyStats.week_range?.end_thursday}
              </small>
            </div>
          )}
        </motion.div>

        <motion.div className="chart-card wide" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-child"></i> Patient Age Distribution (0-6 Years)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
              <XAxis dataKey="age" stroke="#90A4AE" fontSize={12} />
              <YAxis stroke="#90A4AE" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#4FC3F7" radius={[12, 12, 0, 0]} animationDuration={1500}>
                {ageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4FC3F7', '#81D4FA', '#29B6F6', '#0288D1', '#01579B', '#B3E5FC'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatisticsTab;
`

## D:\my-first-app\src\features\reception\components\AddAppointmentModal.jsx

`javascript
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
`

## D:\my-first-app\src\features\reception\components\AddParentModal.jsx

`javascript
import React, { useState } from 'react';
import api from '../../../api/axios';

export default function AddParentModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let phone = e.target.phone_number.value.trim();

    
    if (phone.startsWith('09')) {
      phone = '963' + phone.slice(1);
    } else if (phone.startsWith('00963')) {
      phone = phone.replace('00963', '963');
    } else if (phone.startsWith('+963')) {
      phone = phone.replace('+963', '963');
    } else if (!phone.startsWith('963')) {
      phone = '963' + phone;
    }

    const formData = {
      first_name: e.target.first_name.value.trim(),
      last_name: e.target.last_name.value.trim(),
      email: e.target.email.value.trim(),
      phone_number: phone,
      address: e.target.address.value.trim(),
    };

    try {
      const res = await api.post('/reception/parents/add', formData);
      const newParent = res.data?.data;
      onSuccess?.(newParent);
      e.target.reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="form-card modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <h3 className="card-title">Add New Parent Account</h3>
          <button className="modal-close" onClick={onClose}>Ã—</button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name <span className="required">*</span></label>
              <input type="text" name="first_name" className="form-input" placeholder="e.g. Sarah" required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name <span className="required">*</span></label>
              <input type="text" name="last_name" className="form-input" placeholder="e.g. Ali" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number <span className="required">*</span></label>
              <input 
                type="tel" 
                name="phone_number" 
                className="form-input" 
                placeholder="963xxxxxxxx" 
                defaultValue="963"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email <span className="required">*</span></label>
              <input type="email" name="email" className="form-input" placeholder="example@email.com" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input type="text" name="address" className="form-input" placeholder="e.g. Damascus" />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Account'}
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
`

## D:\my-first-app\src\features\reception\components\AppointmentModal.jsx

`javascript
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
    if (st.includes('Ù…Ø¤ÙƒØ¯') || st.includes('confirmed')) return 'status-confirmed';
    if (st.includes('Ù…ÙƒØªÙ…Ù„') || st.includes('completed')) return 'status-completed';
    if (st.includes('Ø¥Ù„ØºØ§Ø¡') || st.includes('cancelled') || st.includes('canceled')) return 'status-cancelled';
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
`

## D:\my-first-app\src\features\reception\components\ChildDetailsModal.jsx

`javascript
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
          <button className="modal-close" onClick={onClose}>Ã—</button>
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
`

## D:\my-first-app\src\features\reception\components\ParentCard.jsx

`javascript
import React from 'react';

const ParentCard = ({ parent, onClick }) => {
  const fullName = `${parent.first_name || ''} ${parent.last_name || ''}`.trim() || 'No Name';

  const childrenCount = Array.isArray(parent.children)
    ? parent.children.length
    : (typeof parent.children_count === 'number' ? parent.children_count : 0);

  const formatPhone = (phone) => {
    if (!phone) return 'No phone';
    let cleanPhone = phone.toString().trim();
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

  return (
    <div className="parent-card" onClick={() => onClick(parent)}>
      <div className="parent-card-avatar">
        {parent.first_name?.charAt(0)}{parent.last_name?.charAt(0)}
      </div>
      <div className="parent-card-info">
        <h3 className="parent-card-name">{fullName}</h3>
        <p className="parent-card-email">{parent.email || 'No email'}</p>
        <p className="parent-card-phone">{formatPhone(parent.phone_number)}</p>
        <div className="parent-card-footer">
          <span className="parent-card-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {parent.address || 'Not specified'}
          </span>
          <span className="children-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {childrenCount} {childrenCount === 1 ? 'Child' : 'Children'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParentCard;
`

## D:\my-first-app\src\features\reception\components\ParentProfileModal.jsx

`javascript
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
          <button className="modal-close" onClick={onClose}>Ã—</button>
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
          <button className="modal-close" onClick={onClose}>Ã—</button>
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
`

## D:\my-first-app\src\features\reception\components\Sidebar.jsx

`javascript
import React from 'react';
import { LayoutDashboard, CalendarDays, UserPlus, DollarSign, Syringe } from 'lucide-react';

import logoImage from "../../../assets/logo.jpg";

const menuItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'add-account', label: 'Add Account', icon: UserPlus },
];

export default function Sidebar({ activePage, onPageChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img 
            src={logoImage} 
            alt="KidCare Clinic"
            style={{ 
              width: 32, 
              height: 32, 
              objectFit: 'contain',
              borderRadius: 8,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          
          <div 
            style={{
              width: 32,
              height: 32,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4FC3F7',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span>KidCare Clinic</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">R</div>
          <div className="user-details">
            <span className="user-name">Reception User</span>
            <span className="user-role">Receptionist</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
`

## D:\my-first-app\src\features\reception\pages\ReceptionDashboard.jsx

`javascript
import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DashboardTab from '../tabs/DashboardTab';
import AppointmentsTab from '../tabs/AppointmentsTab';
import AddAccountTab from '../tabs/ParentsTab';
import VaccinesTab from '../tabs/VaccinesTab'; 
import './ReceptionDashboard.css';

const pageTitles = {
  dashboard: 'Home',
  appointments: 'Appointments',
  vaccines: 'Vaccines & Immunization', 
  'add-account': 'Add Account',
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="date-display" style={{ display: 'flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
      <Clock size={14} />
      {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

export default function ReceptionDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="main-content">
        <header className="top-bar">
          <div className="page-title">{pageTitles[activePage]}</div>
          <div className="top-bar-actions">
            <LiveClock />
          </div>
        </header>

        <div style={{ display: activePage === 'dashboard' ? 'block' : 'none' }}>
          <DashboardTab />
        </div>

        <div style={{ display: activePage === 'appointments' ? 'block' : 'none' }}>
          <AppointmentsTab showToast={showToast} />
        </div>

        <div style={{ display: activePage === 'vaccines' ? 'block' : 'none' }}>
          <VaccinesTab onToast={showToast} />
        </div>

        <div style={{ display: activePage === 'add-account' ? 'block' : 'none' }}>
          <AddAccountTab onToast={showToast} />
        </div>
      </main>

      {toast && (
        <div className="toast show">
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
`

## D:\my-first-app\src\features\reception\tabs\AppointmentsTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, User, Stethoscope, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import AppointmentModal from '../components/AppointmentModal';
import AddAppointmentModal from '../components/AddAppointmentModal';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const sortAppointments = (list) => {
    return Array.isArray(list)
      ? [...list].sort((a, b) => {
          const dateTimeA = new Date(`${a.date || ''} ${a.time || ''}`);
          const dateTimeB = new Date(`${b.date || ''} ${b.time || ''}`);
          return dateTimeA - dateTimeB;
        })
      : [];
  };

  const fetchAppointments = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const res = await api.get('/reception/appointments');
      const rawList = res.data?.appointments || res.data || [];
      setAppointments(sortAppointments(rawList));
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(true);
  }, []);

  const handleAppointmentAdded = (newApt) => {
    if (newApt) {
      setAppointments(prev => sortAppointments([newApt, ...prev]));
    }
    fetchAppointments(false);
  };

  const handleAppointmentUpdated = () => {
    fetchAppointments(false);
  };

  const handleAppointmentDeleted = (deletedId) => {
    if (deletedId) {
      setAppointments(prev => prev.filter(apt => apt.id !== deletedId));
    }
    fetchAppointments(false);
  };

  const getChildName = (apt) => {
    if (apt.child_first_name) return `${apt.child_first_name} ${apt.child_last_name || ''}`;
    if (apt.child?.first_name) return `${apt.child.first_name} ${apt.child.last_name || ''}`;
    if (apt.child_name) return apt.child_name;
    if (apt.patient_name) return apt.patient_name;
    return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
  };

  const getDoctorName = (apt) => {
    if (apt.doctor_first_name) return `Dr. ${apt.doctor_first_name} ${apt.doctor_last_name || ''}`;
    if (apt.doctor?.first_name) return `Dr. ${apt.doctor.first_name} ${apt.doctor.last_name || ''}`;
    if (apt.doctor_name) return `Dr. ${apt.doctor_name}`;
    return 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯';
  };

  const filteredAppointments = appointments.filter((apt) => {
    const childName = getChildName(apt).toLowerCase();
    const doctorName = getDoctorName(apt).toLowerCase();
    const term = searchTerm.toLowerCase();
    return childName.includes(term) || doctorName.includes(term) || String(apt.id).includes(term);
  });

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge status-pending">Pending</span>;
    const st = status.toLowerCase();
    if (st.includes('Ù…Ø¤ÙƒØ¯') || st.includes('confirmed')) return <span className="status-badge status-confirmed">{status}</span>;
    if (st.includes('Ù…ÙƒØªÙ…Ù„') || st.includes('completed')) return <span className="status-badge status-completed">{status}</span>;
    if (st.includes('Ø¥Ù„ØºØ§Ø¡') || st.includes('cancelled') || st.includes('canceled')) return <span className="status-badge status-cancelled">{status}</span>;
    return <span className="status-badge status-pending">{status}</span>;
  };

  return (
    <div className="tab-container" style={{ padding: '20px' }}>
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

      {selectedAppointmentId && (
        <AppointmentModal 
          appointmentId={selectedAppointmentId} 
          onClose={() => setSelectedAppointmentId(null)} 
          onUpdated={handleAppointmentUpdated}
          onDeleted={handleAppointmentDeleted}
        />
      )}

      {showAddModal && (
        <AddAppointmentModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={handleAppointmentAdded}
        />
      )}
    </div>
  );
}
`

## D:\my-first-app\src\features\reception\tabs\DashboardTab.jsx

`javascript
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Users,
  Wallet,
  CreditCard,
  Loader2,
  AlertCircle,
  Calendar,
  History,
  Phone,
  User,
  Stethoscope,
  Building2,
  CheckCircle2,
  Receipt,
  X,
  LogOut
} from 'lucide-react';
import api from '../../../api/axios.js'; 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const colorMap = {
  blue: { bg: 'rgba(79,195,247,0.1)', icon: '#4FC3F7', bar: '#4FC3F7' },
  green: { bg: 'rgba(102,187,106,0.1)', icon: '#66BB6A', bar: '#66BB6A' },
  purple: { bg: 'rgba(171,71,188,0.1)', icon: '#AB47BC', bar: '#AB47BC' },
  cyan: { bg: 'rgba(79,195,247,0.1)', icon: '#29B6F6', bar: '#29B6F6' },
  orange: { bg: 'rgba(255,152,0,0.1)', icon: '#FF9800', bar: '#FF9800' },
  pink: { bg: 'rgba(244,143,177,0.1)', icon: '#F48FB1', bar: '#F48FB1' },
};

const AnimatedNumber = ({ value = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const numericValue = Number(value) || 0;
    if (numericValue === 0) {
      setDisplayValue(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const duration = 1200, steps = 40;
    const increment = numericValue / steps;
    let current = 0;

    timerRef.current = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timerRef.current);
        timerRef.current = null;
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value]);

  return <span>{prefix}{(displayValue || 0).toLocaleString('en-US')}{suffix}</span>;
};

const fmt = (n) => (Number(n) || 0).toLocaleString('en-US');

const fetchWithRetry = async (url, retries = 2, signal) => {
  try {
    return await api.get(url, { signal });
  } catch (err) {
    if (retries > 0 && !api.isCancel?.(err) && err.name !== 'AbortError' && err.name !== 'CanceledError') {
      return fetchWithRetry(url, retries - 1, signal);
    }
    throw err;
  }
};

export default function DashboardTab() {
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    clinic_net_profit: 0,
    clinic_additions_profit: 0,
    doctors_total_payout: 0,
    breakdown_by_method: { online_stripe: 0, cash_reception: 0 },
    breakdown_by_type: { fixed_appointments: 0, additions_total: 0 },
  });
  const [newChildrenCount, setNewChildrenCount] = useState(0);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dateAppointments, setDateAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = localStorage.getItem('receptionist_token') || localStorage.getItem('token');
      await api.post('/logoutReception', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setLogoutLoading(false);
      window.location.href = '/login';
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const [appointmentsRes, revenueRes, childrenRes] = await Promise.all([
        fetchWithRetry('/home/appointments-count', 2, controller.signal),
        fetchWithRetry('/daily-revenue', 2, controller.signal),
        fetchWithRetry('/home/today-children-count', 2, controller.signal),
      ]);

      // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø¹Ø¯Ø¯ Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯
      const aptCount = 
        appointmentsRes.data?.data?.today_appointments_count ?? 
        appointmentsRes.data?.today_appointments_count ?? 
        0;
      setAppointmentsCount(Number(aptCount));

      // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø¨Ø§Ù„ÙˆØµÙˆÙ„ Ù„ÙƒØ§Ø¦Ù† financials
      const rawData = revenueRes.data?.data || {};
      const financials = rawData.financials || rawData;
      const methods = rawData.breakdown_by_method || {};
      const types = rawData.breakdown_by_type || {};

      setRevenueData({
        total_revenue: Number(financials.total_revenue ?? financials.today_revenue ?? 0),
        clinic_net_profit: Number(financials.clinic_net_profit ?? financials.net_profit ?? 0),
        clinic_additions_profit: Number(financials.clinic_additions_profit ?? 0),
        doctors_total_payout: Number(financials.doctors_total_payout ?? financials.doctors_payout ?? 0),
        breakdown_by_method: {
          online_stripe: Number(methods.online_stripe ?? methods.online ?? 0),
          cash_reception: Number(methods.cash_reception ?? methods.cash ?? 0),
        },
        breakdown_by_type: {
          fixed_appointments: Number(types.fixed_appointments ?? types.fixed_price ?? 0),
          additions_total: Number(types.additions_total ?? types.additions ?? 0),
        },
      });

      // Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ø·ÙØ§Ù„
      const childrenCount = 
        childrenRes.data?.today_added_children_count ?? 
        childrenRes.data?.data?.today_added_children_count ?? 
        0;
      setNewChildrenCount(Number(childrenCount));

    } catch (err) {
      if (api.isCancel?.(err) || err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      console.error('Error fetching dashboard data:', err);

      if (err.response?.status === 500) {
        setError({ type: 'server', message: 'Server error (500). Please check Laravel logs.' });
      } else if (err.response?.status >= 400 && err.response?.status !== 401) {
        setError({ type: 'client', message: err.response?.data?.message || 'Failed to load dashboard data.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointmentsByDate = useCallback(async (date) => {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const res = await api.get(`/reception/appointments/date/${date}`);

      const appointments = 
        res.data?.appointments || 
        res.data?.data?.appointments || 
        res.data?.data || 
        [];
      
      setDateAppointments(Array.isArray(appointments) ? appointments : []);
    } catch (err) {
      console.error('Appointments Error:', err.response?.data);
      setDateAppointments([]);
      setAppointmentsError(err.response?.data?.message || 'Failed to load appointments for selected date');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, fetchAppointmentsByDate]);

  const handleOpenPaymentModal = async (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setLoadingSummary(true);
    try {
      const res = await api.get(`/appointments/${appointmentId}/payment-summary-reception`);
      setPaymentSummary(res.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch payment summary');
      setSelectedAppointmentId(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCheckInAndOpenPayment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    try {
      await api.post(`/appointments/${appointmentId}/check-in`);
      
      setDateAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'checked_in' } : apt)
      );

      await handleOpenPaymentModal(appointmentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedAppointmentId) return;
    setSubmittingPayment(true);
    try {
      await api.post(`/appointments/${selectedAppointmentId}/complete-payment`);
      alert('Payment has been completed successfully.');
      
      setDateAppointments(prev => 
        prev.map(apt => apt.id === selectedAppointmentId ? { ...apt, status: 'completed', payment_status: 'paid' } : apt)
      );

      setSelectedAppointmentId(null);
      setPaymentSummary(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const {
    total_revenue = 0,
    clinic_net_profit = 0,
    clinic_additions_profit = 0,
    doctors_total_payout = 0,
    breakdown_by_method = { online_stripe: 0, cash_reception: 0 },
    breakdown_by_type = { fixed_appointments: 0, additions_total: 0 },
  } = revenueData || {};

  const netProfitProgress = useMemo(() => {
    return total_revenue > 0 ? Math.min((clinic_net_profit / total_revenue) * 100, 100) : 0;
  }, [total_revenue, clinic_net_profit]);

  const payoutProgress = useMemo(() => {
    return total_revenue > 0 ? Math.min((doctors_total_payout / total_revenue) * 100, 100) : 0;
  }, [total_revenue, doctors_total_payout]);

  const totalMethods = useMemo(() => {
    return (breakdown_by_method?.online_stripe || 0) + (breakdown_by_method?.cash_reception || 0);
  }, [breakdown_by_method]);

  const getChildImage = (patient) => {
    if (patient?.image && !patient.image.includes('girl.png') && !patient.image.includes('boy.png')) {
      return patient.image;
    }
    return patient?.gender === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  const isTodaySelected = selectedDate === getTodayDate();

  return (
    <motion.div 
      className="dashboard-grid-content" 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      exit="exit"
    >
      {error && (
        <motion.div 
          variants={itemVariants}
          style={{ 
            background: error.type === 'server' ? '#fff3e0' : '#ffebee', 
            color: error.type === 'server' ? '#e65100' : '#c62828', 
            padding: '16px 20px', 
            borderRadius: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: `1px solid ${error.type === 'server' ? '#ffe0b2' : '#ffcdd2'}`,
          }}
        >
          <AlertCircle size={20} />
          <div>
            <strong style={{ fontSize: 14 }}>
              {error.type === 'server' ? 'Server Error' : 'Error'}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
              {error.message}
            </p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px 20px',
            gap: 16,
            color: '#90A4AE'
          }}
        >
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Loading dashboard data...</p>
        </motion.div>
      ) : (
        <>
          <motion.section className="quick-stats-grid" variants={itemVariants}>
            <QuickStatCard
              icon={CalendarDays}
              label="Total Appointments"
              value={<AnimatedNumber value={appointmentsCount} />}
              trendType="neutral"
              color="blue"
            />
            <QuickStatCard
              icon={Users}
              label="New Children"
              value={<AnimatedNumber value={newChildrenCount} />}
              trendType="neutral"
              color="cyan"
            />
            <QuickStatCard
              icon={DollarSign}
              label="Today's Revenue"
              value={<AnimatedNumber value={total_revenue} prefix="$" />}
              trendType="positive"
              color="purple"
            />
            <QuickStatCard
              icon={Wallet}
              label="Doctors Payout"
              value={<AnimatedNumber value={doctors_total_payout} prefix="$" />}
              trendType="neutral"
              color="orange"
            />
          </motion.section>

          <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>
            <motion.div className="stats-column" variants={itemVariants}>
              <h3 className="section-title">Financial Overview</h3>

              <StatCard
                title="Total Revenue"
                value={`$${fmt(total_revenue)}`}
                sub={`Fixed: $${fmt(breakdown_by_type.fixed_appointments)} | Additions: $${fmt(breakdown_by_type.additions_total)}`}
                progress={total_revenue > 0 ? 100 : 0}
                icon={DollarSign}
                color="blue"
              />

              <StatCard
                title="Clinic Net Profit"
                value={`$${fmt(clinic_net_profit)}`}
                sub={`Additions profit: $${fmt(clinic_additions_profit)}`}
                progress={netProfitProgress}
                icon={TrendingUp}
                color="green"
              />
            </motion.div>

            <motion.div className="stats-column" variants={itemVariants}>
              <h3 className="section-title">Payouts & Methods</h3>

              <StatCard
                title="Doctors Payout"
                value={`$${fmt(doctors_total_payout)}`}
                sub="Total doctors earnings today"
                progress={payoutProgress}
                icon={Wallet}
                color="orange"
              />

              <StatCard
                title="Payment Methods"
                value={`$${fmt(totalMethods)}`}
                sub={`Online: $${fmt(breakdown_by_method.online_stripe)} | Cash: $${fmt(breakdown_by_method.cash_reception)}`}
                progress={total_revenue > 0 ? 100 : 0}
                icon={CreditCard}
                color="purple"
              />
            </motion.div>
          </motion.section>

          <motion.section 
            className="appointments-section" 
            variants={itemVariants}
            style={{ marginTop: 24 }}
          >
            <div className="section-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Calendar size={20} />
                Appointments List
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, color: '#90A4AE', fontWeight: 500 }}>Select Date:</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'inherit',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {appointmentsError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {appointmentsError}
              </div>
            )}

            {appointmentsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 40, justifyContent: 'center' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Loading appointments...</span>
              </div>
            ) : dateAppointments.length > 0 ? (
              <motion.div 
                className="appointments-list"
                variants={itemVariants}
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {dateAppointments.map(apt => {
                    const statusNormalized = apt.status?.toLowerCase();
                    
                    const isCheckedIn = 
                      statusNormalized === 'checked_in' || 
                      statusNormalized === 'checked in' || 
                      statusNormalized === 'messages.checked_in';

                    const isCompleted = statusNormalized === 'completed';

                    return (
                      <div 
                        key={apt.id} 
                        className="appointment-card"
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          background: 'rgba(79,195,247,0.05)',
                          border: '1px solid rgba(79,195,247,0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <img 
                            src={getChildImage(apt.patient)} 
                            alt={apt.patient?.child_name}
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = 'https://kidcare.sy/images/default-avatar.png'}
                          />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>
                              {apt.patient?.child_name}
                            </p>
                            <p style={{ fontSize: 12, color: '#90A4AE', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} /> Parent: {apt.patient?.parent_name}
                            </p>
                          </div>

                          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                            {isCheckedIn ? (
                              <button
                                onClick={() => handleOpenPaymentModal(apt.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  background: '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Receipt size={14} /> View Payment
                              </button>
                            ) : (
                              isTodaySelected && !isCompleted && (
                                <button
                                  onClick={() => handleCheckInAndOpenPayment(apt.id)}
                                  disabled={actionLoadingId === apt.id}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  {actionLoadingId === apt.id ? (
                                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )} 
                                  Check In
                                </button>
                              )
                            )}

                            <span style={{ 
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: isCompleted ? 'rgba(102,187,106,0.15)' : isCheckedIn ? 'rgba(59,130,246,0.15)' : 'rgba(255,152,0,0.15)',
                              color: isCompleted ? '#66BB6A' : isCheckedIn ? '#3b82f6' : '#FF9800',
                            }}>
                              {isCompleted ? 'Completed' : isCheckedIn ? 'Checked In' : apt.status}
                            </span>
                            
                            <span style={{ 
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: apt.payment_status === 'paid' ? 'rgba(102,187,106,0.15)' : 'rgba(239,83,80,0.15)',
                              color: apt.payment_status === 'paid' ? '#66BB6A' : '#EF5350',
                            }}>
                              {apt.payment_status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '4px 0' }} />

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                          gap: 12, 
                          fontSize: 13, 
                          color: '#607D8B' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={15} color="#4FC3F7" />
                            <span>Time: <strong>{apt.time}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarSign size={15} color="#66BB6A" />
                            <span>Price: <strong>${apt.price}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Stethoscope size={15} color="#AB47BC" />
                            <span>Doctor: <strong>Dr. {apt.doctor?.full_name}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={15} color="#FF9800" />
                            <span>Dept: <strong>{apt.doctor?.department}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={15} color="#29B6F6" />
                            <span>Phone: <strong>{apt.patient?.parent_phone}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 60, 
                color: '#90A4AE',
                background: 'var(--card-bg, #ffffff)',
                borderRadius: 16,
                border: '1px dashed var(--border-color, #e2e8f0)',
              }}>
                <History size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>No appointments scheduled for {selectedDate}</p>
              </div>
            )}
          </motion.section>

          <motion.div 
            variants={itemVariants}
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px dashed var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                border: '1px solid rgba(239, 83, 80, 0.3)',
                background: 'rgba(239, 83, 80, 0.08)',
                color: '#ef5350',
                fontWeight: 600,
                fontSize: 14,
                cursor: logoutLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {logoutLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <LogOut size={18} />
              )}
              <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {selectedAppointmentId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#fff', width: '100%', maxWidth: '480px', margin: '20px',
                borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={20} color="#10b981" /> Payment Summary
                </h3>
                <button onClick={() => { setSelectedAppointmentId(null); setPaymentSummary(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <X size={20} color="#94a3b8" />
                </button>
              </div>

              {loadingSummary ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                </div>
              ) : paymentSummary ? (
                <div>
                  <div style={{ fontSize: 14, color: '#475569', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>Patient:</strong> {paymentSummary.patient_name}</div>
                    <div><strong>Doctor:</strong> {paymentSummary.doctor_name}</div>
                    <div><strong>Booking Source:</strong> {paymentSummary.booking_source}</div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <span>Fixed Consultation Price:</span>
                    <strong>${paymentSummary.fixed_price} ({paymentSummary.fixed_price_status})</strong>
                  </div>

                  {paymentSummary.additions && paymentSummary.additions.length > 0 && (
                    <div style={{ margin: '12px 0' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 6 }}>Additions & Services:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                        {paymentSummary.additions.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span>{item.item_name}</span>
                            <strong>${item.price}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Additions Total:</span>
                      <strong>${paymentSummary.totals?.additions_total}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Already Paid Online:</span>
                      <strong>${paymentSummary.totals?.already_paid_online}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
                      <span>Required Cash Now:</span>
                      <span>${paymentSummary.totals?.required_cash_now}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    disabled={submittingPayment}
                    style={{
                      width: '100%', padding: '12px', background: '#10b981', color: '#fff',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {submittingPayment ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />} Complete Payment
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#ef4444' }}>Could not load payment details.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuickStatCard({ icon: Icon, label, value, trend, trendType, color }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div className="quick-stat-card" whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <div className="stat-icon-wrapper" style={{ background: c.bg, color: c.icon }}>
        <Icon size={24} />
      </div>
      <div className="quick-stat-content">
        <h4>{label}</h4>
        <p className="quick-stat-value">{value}</p>
        <div className={`trend ${trendType}`}>
          {trend}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, title, value, sub, progress, color }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div className="stat-card-v2" whileHover={{ borderColor: 'rgba(79,195,247,0.2)' }} transition={{ duration: 0.2 }}>
      <div className="stat-icon-v2" style={{ background: c.bg, color: c.icon }}>
        <Icon size={26} />
      </div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <span className="stat-sub">{sub}</span>
        <div className="progress-bar-kidcare">
          <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%`, background: c.bar }}></div>
        </div>
      </div>
    </motion.div>
  );
}
`

## D:\my-first-app\src\features\reception\tabs\ParentsTab.jsx

`javascript
import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import ParentCard from '../components/ParentCard';
import AddParentModal from '../components/AddParentModal';
import ParentProfileModal from '../components/ParentProfileModal';

export default function ParentsTab() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/parents/profiles');

      if (response.data && response.data.users) {
        setParents(response.data.users);
      } else {
        setParents([]);
      }
    } catch (err) {
      console.error('Error fetching parent profiles:', err);
      setError('Failed to load parents profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleAddSuccess = (newParent) => {
    setParents(prev => [newParent, ...prev]);
  };

  const handleUpdateSuccess = (updatedParent) => {
    setParents(prev => prev.map(p => {
      if (p.id === updatedParent.id) {
        return {
          ...p,
          ...updatedParent,
          children: updatedParent.children || p.children,
          children_count: updatedParent.children_count ?? p.children_count ?? (Array.isArray(p.children) ? p.children.length : 0)
        };
      }
      return p;
    }));
  };

  const handleModalClose = () => {
    setSelectedParentId(null);
  };

  const filteredParents = parents.filter(p => {
    const search = searchTerm.toLowerCase();
    const firstName = (p.first_name || '').toLowerCase();
    const lastName = (p.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const email = (p.email || '').toLowerCase();
    const phone = p.phone_number || '';

    return fullName.includes(search) ||
           email.includes(search) ||
           phone.includes(search);
  });

  return (
    <div className="parents-tab">
      <div className="parents-header">
        <div>
          <h2 className="page-title">Parent Profiles</h2>
          <p className="parents-subtitle">{parents.length} parent{parents.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="parents-header-right">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary add-btn" onClick={() => setShowAddModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Parent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="alert alert-error">{error}</p>
          <button className="btn btn-secondary btn-sm" onClick={fetchParents}>Retry</button>
        </div>
      ) : filteredParents.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 1 0 7.75"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No parents found</h3>
          <p>There are no profiles matching your search or registered yet.</p>
        </div>
      ) : (
        <div className="parents-grid">
          {filteredParents.map(parent => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onClick={() => setSelectedParentId(parent.id)}
            />
          ))}
        </div>
      )}

      <AddParentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <ParentProfileModal
        isOpen={!!selectedParentId}
        onClose={handleModalClose}
        parentId={selectedParentId}
        onUpdate={handleUpdateSuccess}
      />
    </div>
  );
}
`

## D:\my-first-app\src\features\reception\tabs\VaccinesTab.jsx

`javascript
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
      
      onToast?.('Schedule created successfully! âœ“', 'success');
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
      
      onToast?.('Vaccination recorded successfully! âœ“', 'success');
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
      
      onToast?.('Schedule status updated! âœ“', 'success');
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
`

## D:\my-first-app\src\features\LoginForm.jsx

`javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './LoginForm.css';
import logoImage from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({ phone_number: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const validate = () => {
    let newErrors = {};
    if (!formData.phone_number.startsWith('963')) newErrors.phone_number = "Must start with 963";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAction = async (e, role) => {
    e.preventDefault();
    setApiError('');
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    const result = await login(formData.phone_number, formData.password, role);
    
    setIsLoading(false);
    
    if (result.success) {
      alert(`Login successful! Role: ${role}`);
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-decoration">
          <div className="soft-circle blue-soft"></div>
          <div className="soft-circle light-soft"></div>
      </div>

      <motion.div 
        className="login-card-v2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        
        <div className="extra-shapes-layer">
          <span className="scattered-shape s1">â˜…</span>
          <span className="scattered-shape c1"></span>
          <span className="scattered-shape s2">â˜…</span>
          <span className="scattered-shape c2"></span>
          <span className="scattered-shape s3">â˜…</span>
          <span className="scattered-shape c3"></span>
          <span className="scattered-shape s4">â˜…</span>
          <span className="scattered-shape c4"></span>
          <span className="scattered-shape s5">â˜…</span>
          <span className="scattered-shape c5"></span>
          <span className="scattered-shape s6">â˜…</span>
          <span className="scattered-shape c6"></span>
        </div>
        <div className="header-section">
          <div className="app-logo-container">
              <img src={logoImage} alt="Logo" className="app-custom-logo" />
          </div>
          <h1>Welcome</h1>
          <p>Login to your KidCare account</p>
        </div>

        <form className="form-section">
          {apiError && <div className="error-msg" style={{textAlign: 'center', marginBottom: '10px'}}>{apiError}</div>}
          
          <div className="input-box">
            <label>Phone Number</label>
            <div className={`input-field ${errors.phone_number ? 'error-border' : ''}`}>
              <input 
                type="tel" 
                placeholder="example 963*********" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
              <i className="fa-regular fa-envelope"></i>
            </div>
            {errors.phone_number && <span className="error-msg">{errors.phone_number}</span>}
          </div>

          <div className="input-box">
            <label>Password</label>
            <div className={`input-field ${errors.password ? 'error-border' : ''}`}>
              <input 
                type="password" 
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="login-spacer"></div>

          <button className="btn-primary" onClick={(e) => handleAction(e, 'admin')} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login as Admin'}
          </button>

          <button className="btn-outline" onClick={(e) => handleAction(e, 'reception')} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login as Reception'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
`

## D:\my-first-app\src\pages\LoginPage.jsx

`javascript
import React from 'react';
import LoginForm from "../features/LoginForm";

const LoginPage = () => {
  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: 'var(--bg-light)' 
    }}>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
`

## D:\my-first-app\src\App.jsx

`javascript
import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
import ReceptionDashboard from './features/reception/pages/ReceptionDashboard.jsx';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app">
      {!user ? (
        <LoginPage />
      ) : (
        <div className="main-container">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : user.role === 'reception' ? (
            
            <ReceptionDashboard />
          ) : (
            
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Public Sans' }}>
              <h1>Welcome, {user.name}</h1>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
`

## D:\my-first-app\src\main.jsx

`javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/variables.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
`

