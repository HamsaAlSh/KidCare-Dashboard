import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getInitialDoctors = () => {
  const saved = localStorage.getItem('kidcare_doctors');
  return saved ? JSON.parse(saved) : [];
};

const saveDoctors = (doctors) => {
  localStorage.setItem('kidcare_doctors', JSON.stringify(doctors));
};

const departmentsData = [
  { id: 1, name: 'Pediatrics', head: 'Dr. Mohammed Ali', doctors: 12, patients: 450, capacity: 500, occupancy: 90, color: '#4FC3F7' },
  { id: 2, name: 'Dentistry', head: 'Dr. Fatima Hassan', doctors: 8, patients: 280, capacity: 300, occupancy: 93, color: '#EF5350' },
  { id: 3, name: 'Psychiatry', head: 'Dr. Layla Omar', doctors: 6, patients: 150, capacity: 200, occupancy: 75, color: '#AB47BC' },
  { id: 5, name: 'Vaccination', head: 'Dr. Ahmed Khalid', doctors: 7, patients: 220, capacity: 280, occupancy: 79, color: '#66BB6A' },
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
}) => (
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
                    value={newDoctor.phone_number}
                    onChange={handleInputChange}
                    placeholder="+966 50 123 4567"
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
                  <small className="file-hint">JPG, PNG • Max 5MB</small>
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
                  <small className="file-hint">PDF, DOC • Max 5MB</small>
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

export default AddDoctorModal;
export { getInitialDoctors, saveDoctors };