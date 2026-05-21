import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';
import logoImage from '../../../assets/logo.jpg';
import './AdminDashboard.css';

// ==================== DATA ====================

// Sidebar Items
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-house', badge: null },
  { id: 'doctors', label: 'Doctors', icon: 'fa-user-doctor', badge: 12 },
  { id: 'appointments', label: 'Appointments', icon: 'fa-calendar-days', badge: 5 },
  { id: 'departments', label: 'Departments', icon: 'fa-stethoscope', badge: null },
  { id: 'requests', label: 'Approvals', icon: 'fa-file-signature', badge: 3 },
  { id: 'payments', label: 'Payments', icon: 'fa-credit-card', badge: null },
  { id: 'statistics', label: 'Statistics', icon: 'fa-chart-pie', badge: null },
  { id: 'myaccount', label: 'My Account', icon: 'fa-user', badge: null },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', badge: null },
];

// Dashboard Stats
const dashboardStats = {
  monthlyBudget: 250000, dailyBudget: 32000,
  topDoctor: 'Dr. Sarah Ahmed', activeDept: 'General Pediatrics',
  rem: { daily: 12000, monthly: 30000 },
  totalPatients: 1248, totalDoctors: 45,
  appointmentsToday: 89, occupancyRate: 78
};

// Doctors Data - Updated with new departments (5 departments)
const doctorsData = [
  { id: 1, name: 'Dr. Sarah Ahmed', specialty: 'General Pediatrics', department: 'General Pediatrics', status: 'active', patients: 156, rating: 4.9, experience: 12, email: 'sarah.ahmed@kidcare.com', phone: '+966 50 123 4567', joinDate: '2019-03-15', avatar: 'SA' },
  { id: 2, name: 'Dr. Mohammed Ali', specialty: 'General Pediatrics', department: 'General Pediatrics', status: 'active', patients: 203, rating: 4.7, experience: 8, email: 'mohammed.ali@kidcare.com', phone: '+966 50 234 5678', joinDate: '2020-06-22', avatar: 'MA' },
  { id: 3, name: 'Dr. Fatima Hassan', specialty: 'Dental', department: 'Dental', status: 'on-leave', patients: 89, rating: 4.8, experience: 15, email: 'fatima.hassan@kidcare.com', phone: '+966 50 345 6789', joinDate: '2018-01-10', avatar: 'FH' },
  { id: 4, name: 'Dr. Ahmed Khalid', specialty: 'Vaccination', department: 'Vaccination', status: 'active', patients: 134, rating: 4.6, experience: 10, email: 'ahmed.khalid@kidcare.com', phone: '+966 50 456 7890', joinDate: '2019-11-05', avatar: 'AK' },
  { id: 5, name: 'Dr. Layla Omar', specialty: 'Psychiatry', department: 'Psychiatry', status: 'active', patients: 112, rating: 4.9, experience: 14, email: 'layla.omar@kidcare.com', phone: '+966 50 567 8901', joinDate: '2017-08-30', avatar: 'LO' },
  { id: 6, name: 'Dr. Yusuf Ibrahim', specialty: 'Speech and Hearing Impairments', department: 'Speech and Hearing Impairments', status: 'busy', patients: 67, rating: 4.8, experience: 11, email: 'yusuf.ibrahim@kidcare.com', phone: '+966 50 678 9012', joinDate: '2020-02-14', avatar: 'YI' },
];

// Appointments Data - Ages 0-6 only
const appointmentsData = [
  { id: 1, patient: 'Adam Khalid', doctor: 'Dr. Sarah Ahmed', time: '09:00 AM', date: '2024-05-18', type: 'Check-up', status: 'confirmed', age: 5 },
  { id: 2, patient: 'Lina Mohammed', doctor: 'Dr. Mohammed Ali', time: '09:30 AM', date: '2024-05-18', type: 'Follow-up', status: 'in-progress', age: 3 },
  { id: 3, patient: 'Omar Hassan', doctor: 'Dr. Fatima Hassan', time: '10:00 AM', date: '2024-05-18', type: 'Dental Check', status: 'confirmed', age: 1 },
  { id: 4, patient: 'Noor Ahmed', doctor: 'Dr. Ahmed Khalid', time: '10:30 AM', date: '2024-05-18', type: 'Vaccination', status: 'pending', age: 6 },
  { id: 5, patient: 'Yara Saeed', doctor: 'Dr. Layla Omar', time: '11:00 AM', date: '2024-05-18', type: 'Psychology Check', status: 'confirmed', age: 4 },
  { id: 6, patient: 'Zaid Omar', doctor: 'Dr. Yusuf Ibrahim', time: '11:30 AM', date: '2024-05-18', type: 'Speech Therapy', status: 'confirmed', age: 2 },
  { id: 7, patient: 'Maya Khalid', doctor: 'Dr. Sarah Ahmed', time: '02:00 PM', date: '2024-05-18', type: 'Check-up', status: 'confirmed', age: 6 },
  { id: 8, patient: 'Rayan Ali', doctor: 'Dr. Mohammed Ali', time: '02:30 PM', date: '2024-05-18', type: 'Check-up', status: 'cancelled', age: 0 },
];

// Departments Data - 5 departments only
const departmentsData = [
  { id: 1, name: 'General Pediatrics', head: 'Dr. Mohammed Ali', doctors: 12, patients: 450, capacity: 500, occupancy: 90, color: '#4FC3F7' },
  { id: 2, name: 'Dental', head: 'Dr. Fatima Hassan', doctors: 8, patients: 280, capacity: 300, occupancy: 93, color: '#EF5350' },
  { id: 3, name: 'Psychiatry', head: 'Dr. Layla Omar', doctors: 6, patients: 150, capacity: 200, occupancy: 75, color: '#AB47BC' },
  { id: 4, name: 'Speech and Hearing Impairments', head: 'Dr. Yusuf Ibrahim', doctors: 5, patients: 180, capacity: 250, occupancy: 72, color: '#FFA726' },
  { id: 5, name: 'Vaccination', head: 'Dr. Ahmed Khalid', doctors: 7, patients: 220, capacity: 280, occupancy: 79, color: '#66BB6A' },
];

// Pending Requests - Only "Add Doctor" requests
const initialRequests = [
  { id: 1, type: 'Add Doctor', doctor: 'Dr. Sarah Ahmed', date: 'May 18, 2024', status: 'pending', avatar: 'SA' },
  { id: 2, type: 'Add Doctor', doctor: 'Dr. Mohammed Ali', date: 'May 18, 2024', status: 'pending', avatar: 'MA' },
  { id: 3, type: 'Add Doctor', doctor: 'Dr. Fatima Hassan', date: 'May 17, 2024', status: 'pending', avatar: 'FH' },
];

// Payments Data
const paymentsData = [
  { id: 'INV-001', patient: 'Adam Khalid', amount: 450, method: 'Cash', status: 'paid', date: '2024-05-18', service: 'Consultation' },
  { id: 'INV-002', patient: 'Lina Mohammed', amount: 1200, method: 'Cash', status: 'paid', date: '2024-05-18', service: 'Vaccination Package' },
  { id: 'INV-003', patient: 'Omar Hassan', amount: 850, method: 'Cash', status: 'pending', date: '2024-05-17', service: 'Dental Check' },
  { id: 'INV-004', patient: 'Noor Ahmed', amount: 2500, method: 'Cash', status: 'paid', date: '2024-05-17', service: 'Surgery Consult' },
  { id: 'INV-005', patient: 'Yara Saeed', amount: 600, method: 'Cash', status: 'pending', date: '2024-05-16', service: 'Psychology Session' },
  { id: 'INV-006', patient: 'Zaid Omar', amount: 3800, method: 'Cash', status: 'paid', date: '2024-05-16', service: 'Vaccination' },
];

// Statistics Data
const monthlyRevenue = [
  { month: 'Jan', revenue: 180000, expenses: 120000 },
  { month: 'Feb', revenue: 195000, expenses: 125000 },
  { month: 'Mar', revenue: 220000, expenses: 130000 },
  { month: 'Apr', revenue: 210000, expenses: 128000 },
  { month: 'May', revenue: 250000, expenses: 135000 },
  { month: 'Jun', revenue: 235000, expenses: 132000 },
];

const departmentDistribution = [
  { name: 'General Pediatrics', value: 450, color: '#4FC3F7' },
  { name: 'Dental', value: 280, color: '#EF5350' },
  { name: 'Psychiatry', value: 150, color: '#AB47BC' },
  { name: 'Speech and Hearing Impairments', value: 180, color: '#FFA726' },
  { name: 'Vaccination', value: 220, color: '#66BB6A' },
];

// Age distribution - 0 to 6 years only
const ageDistribution = [
  { age: '0-1', count: 320 },
  { age: '1-2', count: 280 },
  { age: '2-3', count: 220 },
  { age: '3-4', count: 180 },
  { age: '4-5', count: 150 },
  { age: '5-6', count: 98 },
];

const weeklyAppointments = [
  { day: 'Mon', appointments: 45 },
  { day: 'Tue', appointments: 52 },
  { day: 'Wed', appointments: 48 },
  { day: 'Thu', appointments: 61 },
  { day: 'Fri', appointments: 55 },
  { day: 'Sat', appointments: 38 },
  { day: 'Sun', appointments: 25 },
];

// Doctor performance for manager insights
const doctorPerformance = [
  { subject: 'Patients', A: 120, fullMark: 150 },
  { subject: 'Rating', A: 98, fullMark: 100 },
  { subject: 'Experience', A: 85, fullMark: 100 },
  { subject: 'Availability', A: 90, fullMark: 100 },
  { subject: 'Reviews', A: 95, fullMark: 100 },
];

// Department capacity data for manager
const departmentCapacity = [
  { name: 'General Pediatrics', current: 450, max: 500, available: 50, extraAppointments: 25 },
  { name: 'Dental', current: 280, max: 300, available: 20, extraAppointments: 10 },
  { name: 'Psychiatry', current: 150, max: 200, available: 50, extraAppointments: 20 },
  { name: 'Speech and Hearing Impairments', current: 180, max: 250, available: 70, extraAppointments: 35 },
  { name: 'Vaccination', current: 220, max: 280, available: 60, extraAppointments: 15 },
];

// My Account Data
const adminProfile = {
  name: 'Admin User',
  role: 'System Administrator',
  email: 'admin@kidcare.com',
  phone: '+966 50 000 0000',
  joinDate: '2020-01-15',
  avatar: 'A',
  lastLogin: '2024-05-18 09:30 AM',
  permissions: ['Full Access', 'User Management', 'Financial Reports', 'System Settings'],
};

// ==================== ANIMATION VARIANTS ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// ==================== UTILITY COMPONENTS ====================
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

const StatusBadge = ({ status }) => {
  const colors = {
    active: '#66BB6A', 'on-leave': '#FFA726', busy: '#EF5350',
    confirmed: '#66BB6A', pending: '#FFA726', 'in-progress': '#4FC3F7',
    cancelled: '#EF5350', paid: '#66BB6A',
  };
  return (
    <span className="status-badge" style={{ background: colors[status] || '#90A4AE' }}>
      {status.replace('-', ' ')}
    </span>
  );
};

// ==================== CREATIVE CHART COMPONENTS ====================

const CreativeAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#EF5350" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#EF5350" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
      <XAxis dataKey="month" stroke="#90A4AE" fontSize={12} />
      <YAxis stroke="#90A4AE" fontSize={12} />
      <Tooltip 
        contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      />
      <Area type="monotone" dataKey="revenue" stroke="#4FC3F7" strokeWidth={3} fill="url(#colorRevenue)" />
      <Area type="monotone" dataKey="expenses" stroke="#EF5350" strokeWidth={3} fill="url(#colorExpenses)" />
    </AreaChart>
  </ResponsiveContainer>
);

const CreativePieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
        animationBegin={0}
        animationDuration={1500}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const CreativeBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
      <XAxis dataKey="day" stroke="#90A4AE" fontSize={12} />
      <YAxis stroke="#90A4AE" fontSize={12} />
      <Tooltip 
        cursor={{ fill: 'rgba(79,195,247,0.05)' }}
        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      />
      <Bar dataKey="appointments" fill="#4FC3F7" radius={[12, 12, 0, 0]} animationDuration={1500}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={index === 3 ? '#29B6F6' : '#81D4FA'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const CreativeRadarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
      <PolarGrid stroke="rgba(79,195,247,0.2)" />
      <PolarAngleAxis dataKey="subject" stroke="#90A4AE" fontSize={12} />
      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#90A4AE" fontSize={10} />
      <Radar name="Performance" dataKey="A" stroke="#4FC3F7" strokeWidth={3} fill="#4FC3F7" fillOpacity={0.2} />
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
    </RadarChart>
  </ResponsiveContainer>
);

const DonutChart = ({ percentage, color, label }) => (
  <div className="donut-chart-container">
    <ResponsiveContainer width={140} height={140}>
      <PieChart>
        <Pie
          data={[{ value: percentage }, { value: 100 - percentage }]}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={60}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          animationDuration={1500}
        >
          <Cell fill={color} />
          <Cell fill="rgba(79,195,247,0.1)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="donut-label">
      <span className="donut-percentage">{percentage}%</span>
      <span className="donut-text">{label}</span>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

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
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);

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

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const handleApprove = (id) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    addNotification('Doctor approved successfully!', 'success');
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  const handleReject = (id) => {
    setPendingRequests(prev => prev.filter(req => req.id !== id));
    addNotification('Doctor request rejected.', 'info');
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  // ==================== PAGE RENDERERS ====================

  const renderDashboard = () => (
    <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard icon="fa-users" label="Total Patients" value={<AnimatedNumber value={dashboardStats.totalPatients} />} trend="+12%" color="blue" />
        <QuickStatCard icon="fa-user-doctor" label="Active Doctors" value={<AnimatedNumber value={dashboardStats.totalDoctors} />} trend="+3" color="green" />
        <QuickStatCard icon="fa-calendar-check" label="Today's Appointments" value={<AnimatedNumber value={dashboardStats.appointmentsToday} />} trend="On Track" color="purple" />
        <QuickStatCard icon="fa-bed-pulse" label="Occupancy Rate" value={`${dashboardStats.occupancyRate}%`} trend="High" color="orange" />
      </motion.section>

      <motion.section className="dashboard-section" variants={itemVariants}>
        <div className="section-header">
          <h3 className="section-title">Pending Doctor Approvals</h3>
          <motion.span className="badge-count pulse-badge" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
            {pendingRequests.length}
          </motion.span>
        </div>
        <div className="requests-grid">
          <AnimatePresence mode="popLayout">
            {pendingRequests.map((req, index) => (
              <motion.div key={req.id} layout variants={itemVariants}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8, transition: { duration: 0.3 } }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(79, 195, 247, 0.15)' }}
                className="request-card-kidcare"
              >
                <div className="request-header">
                  <span className="request-type">{req.type}</span>
                  <small className="request-date">{req.date}</small>
                </div>
                <div className="request-body">
                  <div className="doctor-profile">
                    <motion.div className="doctor-avatar" whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                      {req.avatar}
                    </motion.div>
                    <div className="doctor-info">
                      <p className="doctor-name">{req.doctor}</p>
                      <small>Pediatric Specialist</small>
                    </div>
                  </div>
                  <div className="request-actions">
                    <motion.button className="btn-approve" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(req.id)}>
                      <i className="fa-solid fa-check"></i> Approve
                    </motion.button>
                    <motion.button className="btn-reject" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReject(req.id)}>
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
        </div>
      </motion.section>

      <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Financial Overview</h3>
          <StatCard title="Monthly Budget" value={`$${dashboardStats.monthlyBudget.toLocaleString('en-US')}`} sub={`Remaining: $${dashboardStats.rem.monthly.toLocaleString('en-US')}`}
            progress={((dashboardStats.monthlyBudget - dashboardStats.rem.monthly) / dashboardStats.monthlyBudget) * 100} icon="fa-wallet" color="blue" />
          <StatCard title="Daily Budget" value={`$${dashboardStats.dailyBudget.toLocaleString('en-US')}`} sub={`Remaining: $${dashboardStats.rem.daily.toLocaleString('en-US')}`}
            progress={((dashboardStats.dailyBudget - dashboardStats.rem.daily) / dashboardStats.dailyBudget) * 100} icon="fa-money-bill-transfer" color="orange" />
        </motion.div>
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Performance Stats</h3>
          <StatCard title="Top Doctor" value={dashboardStats.topDoctor} sub="Pediatrics Dept • 98% Satisfaction" icon="fa-award" color="purple" />
          <StatCard title="Most Active Dept" value={dashboardStats.activeDept} sub="150+ Visits/Week" icon="fa-stethoscope" color="pink" />
        </motion.div>
      </motion.section>
    </motion.div>
  );

  const renderDoctors = () => {
    const filtered = doctorFilter === 'all' ? doctorsData : doctorsData.filter(d => d.status === doctorFilter);
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
          <motion.button className="add-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                <div className="doctor-avatar-large" style={{ background: `linear-gradient(135deg, ${doctor.status === 'active' ? '#E1F5FE' : '#FFF3E0'}, ${doctor.status === 'active' ? '#B3E5FC' : '#FFE0B2'})` }}>
                  {doctor.avatar}
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
                  <td><StatusBadge status={apt.status} /></td>
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

  const renderDepartments = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="departments-grid" variants={itemVariants}>
        {departmentsData.map((dept, index) => (
          <motion.div key={dept.id} className="department-card" variants={itemVariants}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: `0 15px 40px ${dept.color}20` }}
          >
            <div className="dept-header" style={{ borderBottom: `3px solid ${dept.color}` }}>
              <div className="dept-icon" style={{ background: `${dept.color}20`, color: dept.color }}>
                <i className="fa-solid fa-hospital"></i>
              </div>
              <div className="dept-info">
                <h4>{dept.name}</h4>
                <p>Head: {dept.head}</p>
              </div>
            </div>
            <div className="dept-stats">
              <div className="dept-stat"><i className="fa-solid fa-user-doctor"></i><span>{dept.doctors} Doctors</span></div>
              <div className="dept-stat"><i className="fa-solid fa-users"></i><span>{dept.patients} Patients</span></div>
              <div className="dept-stat"><i className="fa-solid fa-bed"></i><span>{dept.capacity} Capacity</span></div>
            </div>
            <div className="dept-occupancy">
              <div className="occupancy-header"><span>Occupancy</span><span style={{ color: dept.color }}>{dept.occupancy}%</span></div>
              <div className="progress-bar-kidcare">
                <motion.div className="progress-fill" style={{ background: dept.color }}
                  initial={{ width: 0 }} animate={{ width: `${dept.occupancy}%` }} transition={{ duration: 1.2, delay: 0.3 }}
                />
              </div>
            </div>
            <DonutChart percentage={dept.occupancy} color={dept.color} label="Full" />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

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
                  <motion.button className="btn-approve" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(req.id)}>
                    <i className="fa-solid fa-check"></i> Approve
                  </motion.button>
                  <motion.button className="btn-reject" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReject(req.id)}>
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
                <td><StatusBadge status={payment.status} /></td>
                <td>{payment.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );

  // Updated Statistics - Manager-focused insights
  const renderStatistics = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      {/* Manager Insight Cards */}
      <motion.div className="manager-insights-grid" variants={itemVariants}>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E8F5E9', color: '#66BB6A' }}>
            <i className="fa-solid fa-door-open"></i>
          </div>
          <div className="insight-content">
            <h4>Available Rooms</h4>
            <p className="insight-value">12</p>
            <small>Can open for active departments</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E1F5FE', color: '#4FC3F7' }}>
            <i className="fa-solid fa-calendar-plus"></i>
          </div>
          <div className="insight-content">
            <h4>Extra Appointments</h4>
            <p className="insight-value">105</p>
            <small>Available slots this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FFF3E0', color: '#FF9800' }}>
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div className="insight-content">
            <h4>Active Doctors</h4>
            <p className="insight-value">38/45</p>
            <small>Can take more patients</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FCE4EC', color: '#EC407A' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="insight-content">
            <h4>Peak Day</h4>
            <p className="insight-value">Thursday</p>
            <small>61 appointments scheduled</small>
          </div>
        </motion.div>
      </motion.div>

      <div className="charts-grid">
        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-area"></i> Monthly Revenue vs Expenses</h4>
          <CreativeAreaChart data={monthlyRevenue} />
        </motion.div>
        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-pie"></i> Department Distribution</h4>
          <CreativePieChart data={departmentDistribution} />
        </motion.div>
        <motion.div className="chart-card" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-chart-bar"></i> Weekly Appointments</h4>
          <CreativeBarChart data={weeklyAppointments} />
        </motion.div>
        <motion.div className="chart-card" variants={itemVariants}>
          <div className="chart-header-with-select">
            <h4 className="chart-title"><i className="fa-solid fa-bullseye"></i> Doctor Performance</h4>
            <select 
              value={selectedDoctorId} 
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              className="doctor-select"
            >
              {doctorsData.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* نحسب أداء الطبيب المختار */}
          {(() => {
            const selectedDoctor = doctorsData.find(d => d.id === selectedDoctorId);
            const dynamicPerformance = [
              { subject: 'Patients', A: Math.min((selectedDoctor.patients / 200) * 100, 100), fullMark: 100 },
              { subject: 'Rating', A: (selectedDoctor.rating / 5) * 100, fullMark: 100 },
              { subject: 'Experience', A: Math.min((selectedDoctor.experience / 15) * 100, 100), fullMark: 100 },
              { subject: 'Availability', A: selectedDoctor.status === 'active' ? 90 : selectedDoctor.status === 'busy' ? 60 : 30, fullMark: 100 },
              { subject: 'Reviews', A: (selectedDoctor.rating / 5) * 98, fullMark: 100 },
            ];
            return <CreativeRadarChart data={dynamicPerformance} />;
          })()}
          
          <div className="selected-doctor-info">
            <p>
              <strong>{doctorsData.find(d => d.id === selectedDoctorId).name}</strong> | 
              Patients: {doctorsData.find(d => d.id === selectedDoctorId).patients} | 
              Rating: ⭐ {doctorsData.find(d => d.id === selectedDoctorId).rating} | 
              Experience: {doctorsData.find(d => d.id === selectedDoctorId).experience} years
            </p>
          </div>
        </motion.div>

        {/* Department Capacity Table for Manager */}
        <motion.div className="chart-card wide" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-hospital"></i> Department Capacity & Expansion Opportunities</h4>
          <div className="capacity-table-wrapper">
            <table className="capacity-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Current Patients</th>
                  <th>Max Capacity</th>
                  <th>Available Slots</th>
                  <th>Extra Appointments</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {departmentCapacity.map((dept, index) => (
                  <motion.tr key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <td><strong>{dept.name}</strong></td>
                    <td>{dept.current}</td>
                    <td>{dept.max}</td>
                    <td><span className="available-badge">{dept.available}</span></td>
                    <td><span className="extra-badge">+{dept.extraAppointments}</span></td>
                    <td>
                      <span className={`status-pill ${dept.available > 40 ? 'high' : dept.available > 20 ? 'medium' : 'low'}`}>
                        {dept.available > 40 ? 'Can Expand' : dept.available > 20 ? 'Moderate' : 'Near Full'}
                      </span>
                    </td>
                    <td>
                      <motion.button 
                        className={`action-btn-small ${dept.available > 20 ? 'can-open' : 'limited'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {dept.available > 20 ? 'Open Room' : 'Limited'}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Patient Age Distribution - 0 to 6 years */}
        <motion.div className="chart-card wide" variants={itemVariants}>
          <h4 className="chart-title"><i className="fa-solid fa-child"></i> Patient Age Distribution (0-6 Years)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
              <XAxis dataKey="age" stroke="#90A4AE" fontSize={12} />
              <YAxis stroke="#90A4AE" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#4FC3F7" radius={[12, 12, 0, 0]} animationDuration={1500}>
                {ageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4FC3F7', '#81D4FA', '#29B6F6', '#0288D1', '#01579B', '#B3E5FC'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderMyAccount = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="account-card" variants={itemVariants}>
        <div className="account-header">
          <motion.div className="account-avatar" whileHover={{ scale: 1.05 }}>
            {adminProfile.avatar}
          </motion.div>
          <div className="account-info">
            <h2>{adminProfile.name}</h2>
            <p className="account-role">{adminProfile.role}</p>
            <p className="account-meta"><i className="fa-solid fa-calendar"></i> Member since {adminProfile.joinDate}</p>
            <p className="account-meta"><i className="fa-solid fa-clock"></i> Last login: {adminProfile.lastLogin}</p>
          </div>
        </div>
        <div className="account-details">
          <div className="detail-group">
            <h4><i className="fa-solid fa-envelope"></i> Email</h4>
            <p>{adminProfile.email}</p>
          </div>
          <div className="detail-group">
            <h4><i className="fa-solid fa-phone"></i> Phone</h4>
            <p>{adminProfile.phone}</p>
          </div>
          <div className="detail-group full">
            <h4><i className="fa-solid fa-shield-halved"></i> Permissions</h4>
            <div className="permissions-list">
              {adminProfile.permissions.map((perm, index) => (
                <motion.span key={index} className="permission-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                  <i className="fa-solid fa-check"></i> {perm}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
        <div className="account-actions">
          <motion.button className="btn-primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <i className="fa-solid fa-pen"></i> Edit Profile
          </motion.button>
          <motion.button className="btn-secondary" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <i className="fa-solid fa-key"></i> Change Password
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="settings-card" variants={itemVariants}>
        <h3><i className="fa-solid fa-sliders"></i> General Settings</h3>
        <div className="setting-item">
          <div><h4>Dark Mode</h4><p>Toggle between light and dark theme</p></div>
          <label className="toggle-switch">
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div><h4>Notifications</h4><p>Enable push notifications</p></div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div><h4>Auto-refresh</h4><p>Auto-refresh dashboard data</p></div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderContent = () => {
    const pages = {
      dashboard: renderDashboard,
      doctors: renderDoctors,
      appointments: renderAppointments,
      departments: renderDepartments,
      requests: renderRequests,
      payments: renderPayments,
      statistics: renderStatistics,
      myaccount: renderMyAccount,
      settings: renderSettings,
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
      <div className="toast-container">
        <AnimatePresence>
          {notifications.map(notif => (
            <Toast key={notif.id} message={notif.message} type={notif.type}
              onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.aside className={`sidebar-kidcare ${!isSidebarOpen ? 'collapsed' : ''}`}
        initial={false} animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <div className="sidebar-brand">
          <motion.div className="brand-logo" whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
            <div className="brand-logo" style={{ 
  backgroundImage: `url(${logoImage})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}}>
  {!logoImage && <span>KC</span>} {/* fallback text */}
</div>
          </motion.div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div className="brand-text" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <h2>KidCare Clinic</h2>
                <span>Pediatric Excellence</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="nav-menu">
          {sidebarItems.map((item, index) => (
            <motion.div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(79, 195, 247, 0.08)' }} whileTap={{ scale: 0.98 }}
            >
              <motion.i className={`fa-solid ${item.icon}`} whileHover={{ rotate: 15, scale: 1.2 }} transition={{ type: 'spring', stiffness: 300 }}></motion.i>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && isSidebarOpen && (
                <motion.span className="nav-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                  {item.badge}
                </motion.span>
              )}
              {activePage === item.id && <motion.div className="active-indicator" layoutId="activeIndicator" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
            </motion.div>
          ))}
        </nav>

        <motion.button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <i className={`fa-solid fa-chevron-${isSidebarOpen ? 'left' : 'right'}`}></i>
        </motion.button>
      </motion.aside>

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
              <motion.button className="notif-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <i className="fa-regular fa-bell"></i>
                {notificationCount > 0 && (
                  <motion.span className="notif-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                    {notificationCount}
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
  );
};

// ==================== SUB-COMPONENTS ====================

const QuickStatCard = ({ icon, label, value, trend, color }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    green: { bg: '#E8F5E9', icon: '#66BB6A', gradient: 'linear-gradient(90deg, #66BB6A, #43A047)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
  };
  return (
    <motion.div className="quick-stat-card" whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(79, 195, 247, 0.15)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="stat-icon-wrapper" style={{ background: colorMap[color].bg }}>
        <i className={`fa-solid ${icon}`} style={{ color: colorMap[color].icon }}></i>
      </div>
      <div className="quick-stat-content">
        <h4>{label}</h4>
        <p className="quick-stat-value">{value}</p>
        <small className={`trend ${trend.startsWith('+') ? 'positive' : 'neutral'}`}>
          <i className={`fa-solid ${trend.startsWith('+') ? 'fa-arrow-trend-up' : 'fa-minus'}`}></i>{trend}
        </small>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, sub, icon, color, progress }) => {
  const colorMap = {
    blue: { bg: '#E1F5FE', icon: '#4FC3F7', gradient: 'linear-gradient(90deg, #4FC3F7, #29B6F6)' },
    orange: { bg: '#FFF3E0', icon: '#FF9800', gradient: 'linear-gradient(90deg, #FF9800, #F57C00)' },
    purple: { bg: '#F3E5F5', icon: '#AB47BC', gradient: 'linear-gradient(90deg, #AB47BC, #8E24AA)' },
    pink: { bg: '#FCE4EC', icon: '#EC407A', gradient: 'linear-gradient(90deg, #EC407A, #D81B60)' },
  };
  return (
    <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="stat-card-v2">
      <motion.div className="stat-icon-v2" style={{ background: colorMap[color].bg, color: colorMap[color].icon }}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}
      >
        <i className={`fa-solid ${icon}`}></i>
      </motion.div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <small className="stat-sub">{sub}</small>
        {progress && (
          <div className="progress-bar-kidcare">
            <motion.div className="progress-fill" style={{ background: colorMap[color].gradient }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
