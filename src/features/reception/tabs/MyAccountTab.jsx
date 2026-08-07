import React from 'react';

export default function MyAccountTab() {
  return (
    <div className="content-grid">
      <div className="form-card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="user-avatar-large">R</div>
        <h3 style={{ margin: '16px 0 4px', fontSize: 18, fontWeight: 500 }}>Reception User</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>reception@clinic.com</p>
        <span className="badge" style={{ marginTop: 12, background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>Receptionist</span>
      </div>

      <div className="form-card">
        <div className="card-header">
          <h3 className="card-title">Change Password</h3>
        </div>
        <form className="form-body">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" placeholder="••••••••" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}