import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import "./AdminDashboard.css";
import api from "../../../api/axios";

import Sidebar from "../components/Sidebar";
import AddDoctorModal from "../components/AddDoctorModal";
import SmartInsights from "../components/SmartInsights";
import DoctorProfileModal from "../components/DoctorProfileModal";  
import DashboardTab from "../tabs/DashboardTab";
import DoctorsTab from "../tabs/DoctorsTab";
import DepartmentsTab from "../tabs/DepartmentsTab";
import StatisticsTab from "../tabs/StatisticsTab";
import MyAccountTab from "../tabs/MyAccountTab";
import SettingsTab from "../tabs/SettingsTab";
import SmartInsightsTab from "../tabs/SmartInsightsTab";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: null },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
  { id: 'insights', label: 'Smart Insights', icon: 'fa-lightbulb', badge: null },
];

const initialRequests = [];

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ x: 100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 100, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className={`toast-notification ${type}`}
  >
    <i className={`fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close"><i className="fa-solid fa-xmark"></i></button>
  </motion.div>
);

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(3);
  const [pendingRequests, setPendingRequests] = useState(initialRequests);
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [showInsights, setShowInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [allDoctorsForStats, setAllDoctorsForStats] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);  
  const [showDoctorProfile, setShowDoctorProfile] = useState(false);  
  const [doctorsData, setDoctorsData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchDoctors = async (page = 1) => {
    try {
      const response = await api.get(`/doctors?page=${page}`);
      const fetchedDoctors = response.data?.data || [];
      const paginationData = response.data?.pagination || {};

      setPagination({
        current_page: paginationData.current_page || 1,
        last_page: paginationData.last_page || 1,
        per_page: paginationData.per_page || 10,
        total: paginationData.total || 0
      });

      setDoctorsData(fetchedDoctors);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await api.get('/doctors?per_page=1000');
      setAllDoctorsForStats(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch all doctors for stats:', error);
    }
  };

  useEffect(() => {
    fetchDoctors(1);
    fetchAllDoctors();
  }, []);

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    department_id: '', first_name: '', last_name: '', address: '',
    email: '', phone_number: '', experience_years: '', education: '',
    fee: '', commission_percentage: '', profile_picture: null, cv: null,
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activePage]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('kidcare_insights');
    if (saved) {
      const insights = JSON.parse(saved);
      setInsightCount(insights.filter(i => !i.read).length);
    }
  }, [doctorsData, departmentsData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-box-wrapper')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartmentsData(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setDepartmentsData([]);
      }
    };

    fetchDepartments();
  }, []);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const validateDoctorForm = () => {
    const newErrors = {};
    const requiredFields = [
      'department_id', 'first_name', 'last_name', 'address',
      'email', 'phone_number', 'experience_years', 'education',
      'fee', 'commission_percentage', 'gender'
    ];

    requiredFields.forEach(field => {
      if (!newDoctor[field] || newDoctor[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (newDoctor.department_id) {
      const deptId = parseInt(newDoctor.department_id);
      if (isNaN(deptId) || deptId <= 0) {
        newErrors.department_id = 'Please select a valid department';
      }
    }

    if (newDoctor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDoctor.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (newDoctor.phone_number && !/^\+963\s?\d{2}\s?\d{3}\s?\d{4}$/.test(newDoctor.phone_number)) {
      newErrors.phone_number = 'Format: +963 90 000 0000';
    }

    if (newDoctor.experience_years && (isNaN(newDoctor.experience_years) || newDoctor.experience_years < 0)) {
      newErrors.experience_years = 'Must be a positive number';
    }

    if (newDoctor.fee && (isNaN(newDoctor.fee) || newDoctor.fee < 0)) {
      newErrors.fee = 'Must be a positive number';
    }

    if (newDoctor.commission_percentage && (isNaN(newDoctor.commission_percentage) || newDoctor.commission_percentage < 0 || newDoctor.commission_percentage > 100)) {
      newErrors.commission_percentage = 'Must be between 0-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue;
    if (name === 'department_id') {
      processedValue = value === '' ? '' : parseInt(value);
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else {
      processedValue = value;
    }

    setNewDoctor(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = fieldName === 'profile_picture' 
        ? ['image/jpeg', 'image/png', 'image/jpg']
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldName === 'profile_picture' ? 'Only JPG/PNG allowed' : 'Only PDF/DOC allowed'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 5MB' }));
        return;
      }

      setNewDoctor(prev => ({ ...prev, [fieldName]: file }));
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();

    if (!validateDoctorForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('department_id', newDoctor.department_id);
      formData.append('first_name', newDoctor.first_name);
      formData.append('last_name', newDoctor.last_name);
      formData.append('address', newDoctor.address);
      formData.append('email', newDoctor.email);
      formData.append('phone_number', newDoctor.phone_number);
      formData.append('experience_years', newDoctor.experience_years);
      formData.append('education', newDoctor.education);
      formData.append('fee', newDoctor.fee);
      formData.append('commission_percentage', newDoctor.commission_percentage);
      formData.append('gender', newDoctor.gender);

      if (newDoctor.profile_picture) {
        formData.append('profile_picture', newDoctor.profile_picture);
      }
      if (newDoctor.cv) {
        formData.append('cv', newDoctor.cv);
      }

      await api.post('/doctors', formData);

      addNotification('Doctor added successfully!', 'success');
      closeModal();
      fetchDoctors(1);
      fetchAllDoctors();

    } catch (error) {
      console.error('Error adding doctor:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to add doctor' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorClick = async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      if (response.data?.status === 'success') {
        setSelectedDoctor(response.data.data);
        setShowDoctorProfile(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        addNotification('Doctor not found, refreshing list...', 'info');
        fetchDoctors(1);
      } else {
        console.error('Failed to fetch doctor profile:', error);
        addNotification('Failed to load doctor profile', 'error');
      }
    }
  };

  const handleDoctorUpdate = () => {
    fetchDoctors(pagination.current_page);
    fetchAllDoctors();
    setShowDoctorProfile(false);
    addNotification('Doctor updated successfully!', 'success');
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await api.delete(`/doctors/${doctorId}`);

      setDoctorsData(prev => prev.filter(d => d.id !== doctorId));
      await fetchDoctors(pagination.current_page);
      await fetchAllDoctors();

      setShowDoctorProfile(false);
      setSelectedDoctor(null);

      addNotification('Doctor deleted successfully!', 'success');

    } catch (error) {
      console.error('Failed to delete doctor:', error);
      addNotification('Failed to delete doctor', 'error');
    }
  };

  const closeModal = () => {
    setShowAddDoctorModal(false);
    setErrors({});
    setNewDoctor({
      department_id: '', first_name: '', last_name: '', address: '',
      email: '', phone_number: '', experience_years: '', education: '',
      fee: '', commission_percentage: '', profile_picture: null, cv: null,
      gender: ''
    });
  };

  const renderContent = () => {
    const pages = {
      dashboard: () => <DashboardTab 
        pendingRequests={pendingRequests} 
        setPendingRequests={setPendingRequests}
        addNotification={addNotification}
        notificationCount={notificationCount}
        setNotificationCount={setNotificationCount}
      />,
      insights: () => <SmartInsightsTab 
        doctorsData={doctorsData}
        departmentsData={departmentsData}
      />,
      doctors: () => <DoctorsTab 
        doctorFilter={doctorFilter} 
        setDoctorFilter={setDoctorFilter}
        setShowAddDoctorModal={setShowAddDoctorModal}
        doctorsData={doctorsData}
        setDoctorsData={setDoctorsData}
        pagination={pagination}
        fetchDoctors={fetchDoctors}
        handleDoctorClick={handleDoctorClick}
      />,
      departments: () => <DepartmentsTab />, 
      statistics: () => <StatisticsTab 
        selectedDoctorId={selectedDoctorId} 
        setSelectedDoctorId={setSelectedDoctorId}
        doctorsData={allDoctorsForStats}  
      />,
      myaccount: () => <MyAccountTab />,
      settings: () => <SettingsTab darkMode={darkMode} setDarkMode={setDarkMode} />,
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div key={activePage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {isLoading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="loading-card"><div className="loading-shimmer"></div></div>)}
            </div>
          ) : (
            pages[activePage] ? pages[activePage]() : (
              <motion.div className="placeholder-text" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <i className={`fa-solid ${sidebarItems.find(i => i.id === activePage)?.icon} fa-3x`}></i>
                <h2>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
                <p>This page is under development. Coming soon...</p>
              </motion.div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`admin-layout ${darkMode ? 'dark' : ''}`}>
      <AddDoctorModal
        showAddDoctorModal={showAddDoctorModal}
        newDoctor={newDoctor}
        errors={errors}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmitDoctor={handleSubmitDoctor}
        closeModal={closeModal}
      />

      <DoctorProfileModal
        show={showDoctorProfile}
        doctor={selectedDoctor}
        onUpdate={handleDoctorUpdate}
        onDelete={handleDeleteDoctor}
        onClose={() => {
          setShowDoctorProfile(false);
          setSelectedDoctor(null);
        }}
      />

      <div className="toast-container">
        <AnimatePresence>
          {notifications.map(notif => (
            <Toast key={notif.id} message={notif.message} type={notif.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            />
          ))}
        </AnimatePresence>
      </div>

      <SmartInsights 
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        doctorsData={doctorsData}
        departmentsData={departmentsData}
        onInsightRead={() => {
          const saved = localStorage.getItem('kidcare_insights');
          if (saved) {
            const insights = JSON.parse(saved);
            setInsightCount(insights.filter(i => !i.read).length);
          }
        }}
      />

      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        darkMode={darkMode}
      />

      <main className="main-wrapper">
        <motion.header className="main-header glass-effect" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
          <div className="header-greeting">
            <motion.h1 key={activePage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {sidebarItems.find(i => i.id === activePage)?.label}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </motion.p>
          </div>
          <div className="header-right">
            <div className="search-box-wrapper" style={{ position: 'relative' }}>
              <motion.div className="search-box-kidcare" whileFocus={{ scale: 1.02 }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Search doctors" 
                  value={searchQuery} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    if (value.length < 2) {
                      setShowSearchDropdown(false);
                      return;
                    }

                    const filtered = allDoctorsForStats.filter(doc => 
                      doc.full_name?.toLowerCase().includes(value.toLowerCase()) ||
                      doc.department?.toLowerCase().includes(value.toLowerCase())
                    );

                    setSearchResults(filtered);
                    setShowSearchDropdown(true);
                  }}
                />
                {searchQuery && (
                  <i 
                    className="fa-solid fa-xmark" 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#90A4AE' }}
                    onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                  ></i>
                )}
              </motion.div>

              {showSearchDropdown && (
                <div className="search-dropdown" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  padding: '8px',
                  zIndex: 9999,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {searchResults.length > 0 ? (
                    searchResults.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setActivePage('doctors');
                          handleDoctorClick(doc.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#E3F2FD'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#E3F2FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4FC3F7',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {doc.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1565C0' }}>
                            Dr. {doc.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#90A4AE' }}>
                            {doc.department || 'General'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#90A4AE', fontSize: '14px' }}>
                      No doctors found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="action-icons">
              <motion.button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.4 }}>
                <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </motion.button>

              <motion.div 
                className="admin-avatar" 
                whileHover={{ scale: 1.1, borderColor: '#4FC3F7' }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePage('myaccount')}
                style={{ cursor: 'pointer' }}
              >
                A
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="content-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;