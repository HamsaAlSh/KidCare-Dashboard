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