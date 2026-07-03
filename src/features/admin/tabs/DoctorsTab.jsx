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

const DoctorsTab = ({ doctorFilter, setDoctorFilter, setShowAddDoctorModal, doctorsData, pagination, fetchDoctors,handleDoctorClick }) => {
  const filtered = doctorFilter === 'all' ? doctorsData : doctorsData.filter(d => d.status === doctorFilter);
  
  const renderAvatar = (doctor) => {
    
    if (doctor.avatar && doctor.avatar.startsWith('http')) {
      return (
        <img 
          src={doctor.avatar} 
          alt={doctor.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            console.error('Image failed to load:', e.target.src);
            e.target.style.display = 'none';
            e.target.parentElement.innerText = doctor.name.split(' ').slice(1).map(n => n[0]).join('');
          }}
        />
      );
    }
    
    return doctor.avatar;
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      active: '#66BB6A',
      'on-leave': '#FF9800',
      busy: '#EF5350'
    };
    const statusLabels = {
      active: 'Active',
      'on-leave': 'On Leave',
      busy: 'Busy'
    };
    return (
      <span className="status-badge" style={{ background: statusColors[status] || '#90A4AE' }}>
        {statusLabels[status] || status}
      </span>
    );
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { current_page, last_page } = pagination;
    
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

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants}>
        <div className="filter-tabs">
          {['all', 'active', 'busy', 'on-leave'].map(filter => (
            <button key={filter} className={`filter-tab ${doctorFilter === filter ? 'active' : ''}`} onClick={() => setDoctorFilter(filter)}>
              {filter === 'all' ? 'All' : filter.replace('-', ' ')}
            </button>
          ))}
        </div>
        <motion.button className="add-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddDoctorModal(true)}>
          <i className="fa-solid fa-plus"></i> Add Doctor
        </motion.button>
      </motion.div>

      {/* Results count */}
      <motion.div variants={itemVariants} style={{ marginBottom: '16px', color: '#78909C', fontSize: '14px' }}>
        Showing {filtered.length} of {pagination.total} doctors
        {pagination.total > 0 && ` (Page ${pagination.current_page} of ${pagination.last_page})`}
      </motion.div>

      <div className="doctors-grid">
        {filtered.map((doctor, index) => (
          <motion.div key={doctor.id} className="doctor-card" variants={itemVariants}
           onClick={() => handleDoctorClick(doctor.id)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(79,195,247,0.15)' }}
          >
            <div className="doctor-card-header">
              <div className="doctor-avatar-large" style={{ 
                background: doctor.avatar?.startsWith('http') 
                  ? '#f0f0f0' 
                  : `linear-gradient(135deg, ${doctor.status === 'active' ? '#E1F5FE' : '#FFF3E0'}, ${doctor.status === 'active' ? '#B3E5FC' : '#FFE0B2'})`,
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
              <StatusBadge status={doctor.status} />
            </div>
            <h4 className="doctor-name">{doctor.name}</h4>
            <p className="doctor-specialty">{doctor.specialty}</p>
            <div className="doctor-stats">
              <div className="doctor-stat">
                <i className="fa-solid fa-users"></i>
                <span>{doctor.patients} Patients</span>
              </div>
              <div className="doctor-stat">
                <i className="fa-solid fa-star"></i>
                <span>{doctor.rating || 'N/A'}</span>
              </div>
              <div className="doctor-stat">
                <i className="fa-solid fa-briefcase"></i>
                <span>{doctor.experience} Yrs</span>
              </div>
            </div>
            <div className="doctor-contact">
              {doctor.email && <p><i className="fa-solid fa-envelope"></i> {doctor.email}</p>}
              {doctor.phone && <p><i className="fa-solid fa-phone"></i> {doctor.phone}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
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

      {/* Pagination */}
      {pagination.last_page > 1 && (
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
          {/* Previous button */}
          <button
            onClick={() => fetchDoctors(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: pagination.current_page === 1 ? '#F5F5F5' : '#fff',
              color: pagination.current_page === 1 ? '#BDBDBD' : '#2196F3',
              cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span style={{ color: '#78909C', padding: '0 4px', fontSize: '14px' }}>...</span>
              ) : (
                <button
                  onClick={() => fetchDoctors(page)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: pagination.current_page === page ? '#2196F3' : '#E0E0E0',
                    background: pagination.current_page === page ? '#2196F3' : '#fff',
                    color: pagination.current_page === page ? '#fff' : '#546E7A',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: pagination.current_page === page ? '600' : '500',
                    minWidth: '40px',
                    transition: 'all 0.2s',
                  }}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* Next button */}
          <button
            onClick={() => fetchDoctors(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #E0E0E0',
              background: pagination.current_page === pagination.last_page ? '#F5F5F5' : '#fff',
              color: pagination.current_page === pagination.last_page ? '#BDBDBD' : '#2196F3',
              cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer',
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

export default DoctorsTab;
