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
];

const defaultDoctorsData = [
  { id: 1, name: 'Dr. Sarah Ahmed', specialty: 'General Pediatrics', department: 'General Pediatrics', status: 'active', patients: 156, rating: 4.9, experience: 12, email: 'sarah.ahmed@kidcare.com', phone: '+966 50 123 4567', joinDate: '2019-03-15', avatar: 'SA' },
  { id: 2, name: 'Dr. Mohammed Ali', specialty: 'General Pediatrics', department: 'General Pediatrics', status: 'active', patients: 203, rating: 4.7, experience: 8, email: 'mohammed.ali@kidcare.com', phone: '+966 50 234 5678', joinDate: '2020-06-22', avatar: 'MA' },
  { id: 3, name: 'Dr. Fatima Hassan', specialty: 'Dental', department: 'Dental', status: 'on-leave', patients: 89, rating: 4.8, experience: 15, email: 'fatima.hassan@kidcare.com', phone: '+966 50 345 6789', joinDate: '2018-01-10', avatar: 'FH' },
  { id: 4, name: 'Dr. Ahmed Khalid', specialty: 'Vaccination', department: 'Vaccination', status: 'active', patients: 134, rating: 4.6, experience: 10, email: 'ahmed.khalid@kidcare.com', phone: '+966 50 456 7890', joinDate: '2019-11-05', avatar: 'AK' },
  { id: 5, name: 'Dr. Layla Omar', specialty: 'Psychiatry', department: 'Psychiatry', status: 'active', patients: 112, rating: 4.9, experience: 14, email: 'layla.omar@kidcare.com', phone: '+966 50 567 8901', joinDate: '2017-08-30', avatar: 'LO' },
];

const staticDepartmentsData = [
  { id: 1, name: 'Pediatrics', head: 'Dr. Mohammed Ali', doctors: 12, patients: 450, capacity: 500, occupancy: 90, color: '#4FC3F7' },
  { id: 2, name: 'Dentistry', head: 'Dr. Fatima Hassan', doctors: 8, patients: 280, capacity: 300, occupancy: 93, color: '#EF5350' },
  { id: 3, name: 'Psychiatry', head: 'Dr. Layla Omar', doctors: 6, patients: 150, capacity: 200, occupancy: 75, color: '#AB47BC' },
  { id: 5, name: 'Vaccination', head: 'Dr. Ahmed Khalid', doctors: 7, patients: 220, capacity: 280, occupancy: 79, color: '#66BB6A' },
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

  const [departmentsData, setDepartmentsData] = useState(staticDepartmentsData);

  const [doctorsData, setDoctorsData] = useState(() => {
    const saved = localStorage.getItem('kidcare_doctors');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kidcare_doctors', JSON.stringify(doctorsData));
  }, [doctorsData]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const fetchedDoctors = response.data?.data || [];

        const formattedDoctors = fetchedDoctors.map(doc => {
          const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
          const avatarUrl = doc.profile_picture
            ? `${baseUrl}/storage/${doc.profile_picture}`
            : null;

          return {
            id: doc.id,
            name: `Dr. ${doc.first_name} ${doc.last_name}`,
            specialty: doc.department?.name || 'General',
            department: doc.department?.name || 'General',
            status: 'active',
            patients: doc.patients_count || 0,
            rating: doc.rating || 0,
            experience: doc.experience_years || 0,
            email: doc.email,
            phone: doc.phone_number,
            joinDate: doc.created_at ? doc.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            avatar: avatarUrl || `${doc.first_name?.[0] || ''}${doc.last_name?.[0] || ''}`.toUpperCase(),
          };
        });

        if (formattedDoctors.length > 0) {
          setDoctorsData(formattedDoctors);
        } else if (doctorsData.length === 0) {
          setDoctorsData(defaultDoctorsData);
        }
      } catch (error) {
        console.error('Failed to fetch doctors from API:', error);
        if (doctorsData.length === 0) {
          setDoctorsData(defaultDoctorsData);
        }
      }
    };

    fetchDoctors();
  }, []);

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    department_id: '', first_name: '', last_name: '', address: '',
    email: '', phone_number: '', experience_years: '', education: '',
    fee: '', commission_percentage: '', profile_picture: null, cv: null
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
      'fee', 'commission_percentage'
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
      addNotification('Please fill all required fields correctly', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('first_name', newDoctor.first_name);
      formData.append('last_name', newDoctor.last_name);
      formData.append('email', newDoctor.email);
      formData.append('phone_number', newDoctor.phone_number);
      formData.append('address', newDoctor.address);
      formData.append('experience_years', newDoctor.experience_years);
      formData.append('education', newDoctor.education);
      formData.append('department_id', newDoctor.department_id);
      formData.append('fee', newDoctor.fee);
      formData.append('commission_percentage', newDoctor.commission_percentage);

      if (newDoctor.profile_picture) {
        formData.append('profile_picture', newDoctor.profile_picture);
      }
      if (newDoctor.cv) {
        formData.append('cv', newDoctor.cv);
      }

      const response = await api.post('/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdDoctor = response.data?.data || response.data?.doctor || response.data;
      const selectedDept = departmentsData.find(d => d.id === newDoctor.department_id);

      const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
      const profilePath = createdDoctor?.profile_picture;
      const avatarUrl = profilePath 
        ? `${baseUrl}/storage/${profilePath}`
        : null;

      console.log('=== DEBUG ===');
      console.log('Profile Path:', profilePath);
      console.log('Avatar URL:', avatarUrl);
      console.log('Base URL:', baseUrl);
      console.log('=============');

      const newDoctorEntry = {
        id: createdDoctor?.id || doctorsData.length + 1,
        name: `Dr. ${newDoctor.first_name} ${newDoctor.last_name}`,
        specialty: selectedDept?.name || 'General',
        department: selectedDept?.name || 'General',
        status: 'active',
        patients: 0,
        experience: parseInt(newDoctor.experience_years),
        email: newDoctor.email,
        phone: newDoctor.phone_number,
        joinDate: new Date().toISOString().split('T')[0],
        avatar: avatarUrl || `${newDoctor.first_name[0]}${newDoctor.last_name[0]}`.toUpperCase(),
      };

      setDoctorsData(prev => [...prev, newDoctorEntry]);

      addNotification('Doctor added successfully!', 'success');
      setShowAddDoctorModal(false);
      setNewDoctor({
        department_id: '', first_name: '', last_name: '', address: '',
        email: '', phone_number: '', experience_years: '', education: '',
        fee: '', commission_percentage: '', profile_picture: null, cv: null
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding doctor:', error);

      if (error.response?.status === 422) {
        const backendErrors = error.response.data?.errors || {};
        const formattedErrors = {};

        Object.keys(backendErrors).forEach(key => {
          formattedErrors[key] = backendErrors[key][0];
        });

        setErrors(formattedErrors);
        addNotification('Please fix the validation errors', 'info');
      } else {
        addNotification(
          error.response?.data?.message || 'Failed to add doctor. Please try again.', 
          'info'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAddDoctorModal(false);
    setErrors({});
    setNewDoctor({
      department_id: '', first_name: '', last_name: '', address: '',
      email: '', phone_number: '', experience_years: '', education: '',
      fee: '', commission_percentage: '', profile_picture: null, cv: null
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
      />,
      appointments: renderAppointments,
      departments: DepartmentsTab,
      requests: renderRequests,
      payments: renderPayments,
      statistics: () => <StatisticsTab 
  selectedDoctorId={selectedDoctorId} 
  setSelectedDoctorId={setSelectedDoctorId}
  doctorsData={doctorsData}  
  />,
      myaccount: MyAccountTab,
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
            <motion.div className="search-box-kidcare" whileFocus={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search doctors, staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </motion.div>
            <div className="action-icons">
              <motion.button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} whileHover={{ rotate: 180, scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.4 }}>
                <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </motion.button>
              <motion.button 
              className="notif-btn" 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowInsights(!showInsights)}
            >
              <i className="fa-solid fa-lightbulb"></i>
              {insightCount > 0 && (
                <motion.span 
                  className="notif-badge" 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {insightCount}
                </motion.span>
              )}
            </motion.button>
              <motion.div className="admin-avatar" whileHover={{ scale: 1.1, borderColor: '#4FC3F7' }} whileTap={{ scale: 0.95 }}>
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