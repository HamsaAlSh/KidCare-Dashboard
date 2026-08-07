import React from 'react';

export default function SettingsTab() {
  return (
    <div className="content-grid">
      <div className="form-card">
        <div className="card-header">
          <h3 className="card-title">Clinic Settings</h3>
        </div>
        <form className="form-body">
          <div className="form-group">
            <label className="form-label">Clinic Name</label>
            <input type="text" className="form-input" defaultValue="Al-Shifa Medical Clinic" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Opening Time</label>
              <input type="time" className="form-input" defaultValue="08:00" />
            </div>
            <div className="form-group">
              <label className="form-label">Closing Time</label>
              <input type="time" className="form-input" defaultValue="20:00" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Default Appointment Duration (minutes)</label>
            <input type="number" className="form-input" defaultValue="30" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Settings</button>
          </div>
        </form>
      </div>

      <div className="form-card">
        <div className="card-header">
          <h3 className="card-title">Notifications</h3>
        </div>
        <div className="form-body">
          <ToggleRow label="Appointment Reminders" desc="Send reminder 30 minutes before appointment" defaultChecked />
          <ToggleRow label="Payment Notifications" desc="Notify when payment is confirmed or cancelled" defaultChecked />
          <ToggleRow label="New Appointment Alerts" desc="Notify when a new appointment is booked" defaultChecked />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <span className="toggle-label">{label}</span>
        <span className="toggle-desc">{desc}</span>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" defaultChecked={defaultChecked} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}