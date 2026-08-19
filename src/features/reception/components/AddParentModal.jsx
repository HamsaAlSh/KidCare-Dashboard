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

    const formData = {
      first_name: e.target.first_name.value.trim(),
      last_name: e.target.last_name.value.trim(),
      email: e.target.email.value.trim(),
      phone_number: e.target.phone_number.value.trim(),
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
          <button className="modal-close" onClick={onClose}>×</button>
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
              <input type="text" name="last_name" className="form-input" placeholder="e.g. All" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number <span className="required">*</span></label>
              <input type="tel" name="phone_number" className="form-input" placeholder="09xxxxxxxx" required />
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