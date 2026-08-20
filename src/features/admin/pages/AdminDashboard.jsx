import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';
import logoImage from "../../../assets/logo.jpg";
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

import { normalizeDoctor } from "../tabs/DoctorsTab";


const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: null },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
];


const initialRequests = [];
const appointmentsData = [];
const paymentsData = [];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const duration = 1500, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

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

  // Pagination state
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
    console.log(' useEffect running - fetching doctors...'); 
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
      'fee', 'commission_percentage','gender'
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

    if (newDoctor.phone_number && !/^\963\s?\d{2}\s?\d{3}\s?\d{4}$/.test(newDoctor.phone_number)) {
      newErrors.phone_number = 'Format: 963 90 000 0000';
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

      const response = await api.post('/doctors', formData);

      console.log('Doctor added:', response.data);
      addNotification('Doctor added successfully!', 'success');
      closeModal();
      fetchDoctors(1);

    } catch (error) {
      console.error('Error adding doctor:', error);
      console.log('Response data:', error.response?.data);

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

  const handleDoctorUpdate = (updatedDoctor) => {
  
    window.location.reload();
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await api.delete(`/doctors/${doctorId}`);

      setDoctorsData(prev => prev.filter(d => d.id !== doctorId));
      await fetchDoctors(1);

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

  const renderAppointments = () => {
    const filtered = appointmentFilter === 'all' ? appointmentsData : appointmentsData.filter(a => a.status === appointmentFilter);

    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="page-header" variants={itemVariants}>
          <div className="filter-tabs">
            {['all', 'confirmed', 'pending', 'in-progress', 'cancelled'].map(filter => (
              <button key={filter} className={`filter-tab ${appointmentFilter === filter ? 'active' : ''}`} onClick={() => setAppointmentFilter(filter)}>
                {filter === 'all' ? 'All' : filter.replace('-', ' ')}
              </button>
            ))}
          </div>
          <motion.button className="add-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <i className="fa-solid fa-plus"></i> New Appointment
          </motion.button>
        </motion.div>
        <motion.div className="appointments-table-wrapper" variants={itemVariants}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt, index) => (
                <motion.tr key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                  <td><div className="patient-cell"><div className="patient-avatar">{apt.patient.split(' ').map(n => n[0]).join('')}</div><span>{apt.patient} <small>({apt.age} yrs)</small></span></div></td>
                  <td>{apt.doctor}</td>
                  <td><span className="time-badge"><i className="fa-regular fa-clock"></i> {apt.time}</span></td>
                  <td>{apt.type}</td>
                  <td><span className="status-badge">{apt.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="action-btn edit"><i className="fa-solid fa-pen"></i></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="action-btn delete"><i className="fa-solid fa-trash"></i></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    );
  };

  const renderRequests = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="requests-page-grid" variants={itemVariants}>
        <AnimatePresence mode="popLayout">
          {pendingRequests.map((req, index) => (
            <motion.div key={req.id} layout className="request-card-kidcare request-large"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="request-header">
                <span className="request-type">{req.type}</span>
                <small className="request-date">{req.date}</small>
              </div>
              <div className="request-body">
                <div className="doctor-profile">
                  <motion.div className="doctor-avatar" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>{req.avatar}</motion.div>
                  <div className="doctor-info">
                    <p className="doctor-name">{req.doctor}</p>
                    <small>Pediatric Specialist</small>
                  </div>
                </div>
                <div className="request-actions">
                  <motion.button className="btn-approve" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPendingRequests(prev => prev.filter(r => r.id !== req.id)); addNotification('Doctor approved successfully!', 'success'); setNotificationCount(prev => Math.max(0, prev - 1)); }}>
                    <i className="fa-solid fa-check"></i> Approve
                  </motion.button>
                  <motion.button className="btn-reject" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPendingRequests(prev => prev.filter(r => r.id !== req.id)); addNotification('Doctor request rejected.', 'info'); setNotificationCount(prev => Math.max(0, prev - 1)); }}>
                    <i className="fa-solid fa-xmark"></i> Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {pendingRequests.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <i className="fa-solid fa-clipboard-check"></i><p>All doctor requests processed!</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="payments-summary" variants={itemVariants}>
        <div className="payment-stat-card">
          <i className="fa-solid fa-wallet"></i>
          <div><h4>Total Revenue</h4><p>$9,800</p></div>
        </div>
        <div className="payment-stat-card">
          <i className="fa-solid fa-clock"></i>
          <div><h4>Pending</h4><p>$1,450</p></div>
        </div>
        <div className="payment-stat-card">
          <i className="fa-solid fa-check-circle"></i>
          <div><h4>Paid</h4><p>$8,350</p></div>
        </div>
      </motion.div>
      <motion.div className="payments-table-wrapper" variants={itemVariants}>
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Patient</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {paymentsData.map((payment, index) => (
              <motion.tr key={payment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                <td><span className="invoice-badge">{payment.id}</span></td>
                <td>{payment.patient}</td>
                <td>{payment.service}</td>
                <td><span className="amount">${payment.amount}</span></td>
                <td><span className="method-badge"><i className={`fa-solid ${payment.method === 'Card' ? 'fa-credit-card' : payment.method === 'Cash' ? 'fa-money-bill' : 'fa-shield-halved'}`}></i> {payment.method}</span></td>
                <td><span className="status-badge">{payment.status}</span></td>
                <td>{payment.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );

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
      appointments: renderAppointments,
      departments: () => <DepartmentsTab />, 
      requests: renderRequests,
      payments: renderPayments,
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
                          setSelectedDoctorId(doc.id);
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
  )
}

export default AdminDashboard;