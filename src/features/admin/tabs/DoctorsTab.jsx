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

const DoctorsTab = ({ doctorFilter, setDoctorFilter, setShowAddDoctorModal, doctorsData }) => {
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
            e.target.parentElement.innerText = `${doctor.name.split(' ')[1]?.[0] || ''}${doctor.name.split(' ')[2]?.[0] || ''}`;
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
    return (
      <span className="status-badge" style={{ background: statusColors[status] || '#90A4AE' }}>
        {status}
      </span>
    );
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
      <div className="doctors-grid">
        {filtered.map((doctor, index) => (
          <motion.div key={doctor.id} className="doctor-card" variants={itemVariants}
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
                <span>{doctor.rating}</span>
              </div>
              <div className="doctor-stat">
                <i className="fa-solid fa-briefcase"></i>
                <span>{doctor.experience} Yrs</span>
              </div>
            </div>
            <div className="doctor-contact">
              <p><i className="fa-solid fa-envelope"></i> {doctor.email}</p>
              <p><i className="fa-solid fa-phone"></i> {doctor.phone}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DoctorsTab;