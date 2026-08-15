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

// ✅ جديد — normalize البيانات من أي format
const normalizeDoctor = (doctor) => {
  if (!doctor) return null;

  // ✅ بناء full_name من first_name + last_name إذا لم يكن موجوداً
  const fullName = doctor.full_name 
    || (doctor.first_name && doctor.last_name 
        ? `${doctor.first_name} ${doctor.last_name}` 
        : null)
    || doctor.name 
    || 'Unknown Doctor';

  return {
    id: doctor.id,
    full_name: fullName,
    first_name: doctor.first_name || '',
    last_name: doctor.last_name || '',
    current_status: doctor.current_status || doctor.status || 'Unknown',
    department: typeof doctor.department === 'object' 
      ? doctor.department?.name 
      : (doctor.department || doctor.specialty || 'No Department'),
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

  // ✅ normalize كل الدكاترة قبل الفلترة
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
    // ✅ لو path نسبي، ضيف الـ base URL
    const baseUrl = 'http://localhost:8000/storage/'; 
    return `${baseUrl}${image.replace(/^\/+/, '')}`;
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

  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Available': '#22c55e',
      'Busy': '#ef4444',
      'Out of Schedule': '#6a6a8a',
      'active': '#22c55e',
      'on-leave': '#6a6a8a',
      'busy': '#ef4444'
    };
    const statusLabels = {
      'Available': 'Available',
      'Busy': 'Busy',
      'Out of Schedule': 'Offline',
      'active': 'Available',
      'on-leave': 'Offline',
      'busy': 'Busy'
    };
    const safeStatus = status || 'Unknown';
    return (
      <span className="status-badge" style={{ background: statusColors[safeStatus] || '#90A4AE' }}>
        {statusLabels[safeStatus] || safeStatus}
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

// ✅ تصدير normalizeDoctor لاستخدامه خارجياً
export { normalizeDoctor };
export default DoctorsTab;