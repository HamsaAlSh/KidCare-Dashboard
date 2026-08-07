import React from 'react';

const statusLabels = {
  current: { text: 'Current', class: 'badge-current' },
  upcoming: { text: 'Upcoming', class: 'badge-upcoming' },
  completed: { text: 'Completed', class: 'badge-completed' },
};

const paidLabels = {
  true: { text: 'Paid', class: 'badge-paid' },
  false: { text: 'Unpaid', class: 'badge-unpaid' },
};

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function AppointmentRow({ apt, showActions, onPaymentToggle }) {
  const s = statusLabels[apt.status];
  const p = paidLabels[apt.paid];
  const isCurrent = apt.status === 'current';

  return (
    <tr className={isCurrent ? 'highlight-row' : ''}>
      <td>
        <div className="patient-cell">
          <div className="avatar">{getInitials(apt.patient)}</div>
          <div className="patient-info">
            <div className="patient-name">{apt.patient}</div>
            <div className="patient-phone">{apt.phone}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="doctor-cell">
          <div className="doctor-dot" style={{ background: apt.color }}></div>
          {apt.doctor}
        </div>
      </td>
      <td className="time-cell">{apt.time}</td>
      {showActions && <td><span className={`badge ${s.class}`}>{s.text}</span></td>}
      <td><span className={`badge ${p.class}`}>{p.text}</span></td>
      {showActions && (
        <td className="row-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => onPaymentToggle && onPaymentToggle(apt.id)}>
            {apt.paid ? 'Unpay' : 'Pay'}
          </button>
        </td>
      )}
    </tr>
  );
}