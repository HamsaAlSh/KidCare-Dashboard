import React, { useState } from 'react';

export default function AddAccountTab({ onToast }) {
  const [type, setType] = useState('patient');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    if (name) {
      onToast(`Account created: ${name}`);
      e.target.reset();
      setType('patient');
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: 560 }}>
      <div className="card-header">
        <h3 className="card-title">Add New Account</h3>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-group">
          <label className="form-label">Account Type</label>
          <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" name="name" className="form-input" placeholder="Enter full name" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="05xxxxxxxx" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="example@email.com" />
          </div>
        </div>
        {type === 'doctor' && (
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input type="text" className="form-input" placeholder="e.g. General Surgery" />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows="3" placeholder="Any additional notes"></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save Account</button>
          <button type="reset" className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}