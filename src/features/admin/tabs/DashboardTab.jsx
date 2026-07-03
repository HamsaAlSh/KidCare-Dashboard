import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber, QuickStatCard, StatCard } from '../components/SharedComponents';
import axios from 'axios'; // ✅ استخدم axios مباشرة

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const DashboardTab = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    presentDoctors: 0,
    appointmentsToday: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    topDoctor: null,
    topDepartment: null,
    loading: true,
    error: null,
  });

  // ✅ إنشاء axios instance محلي
  const api = axios.create({
    baseURL: '/api',
  });

  // ✅ إضافة التوكن للـ requests
  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // ✅ إضافة interceptor للـ 401
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          patientsRes,
          doctorsRes,
          appointmentsRes,
          occupancyRes,
          monthlyRevenueRes,
          dailyRevenueRes,
          topDoctorRes,
          topDepartmentRes,
        ] = await Promise.all([
          api.get('/home/patients-count'),
          api.get('/home/present-doctors-count'),
          api.get('/home/appointments-count'),
          api.get('/home/clinic-occupancy'),
          api.get('/monthly-revenue'),
          api.get('/daily-revenue'),
          api.get('/doctors/top-this-week'),
          api.get('/home/top-department'),
        ]);

        setStats({
          totalPatients: patientsRes.data.patients_count || 0,
          presentDoctors: doctorsRes.data.data?.present_doctors_count || 0,
          appointmentsToday: appointmentsRes.data.data?.today_appointments_count || 0,
          occupancyRate: parseFloat(occupancyRes.data.data?.clinic_occupancy_percentage) || 0,
          monthlyRevenue: monthlyRevenueRes.data.data?.financials?.total_revenue || 0,
          dailyRevenue: dailyRevenueRes.data.data?.financials?.total_revenue || 0,
          topDoctor: topDoctorRes.data.data || null,
          topDepartment: topDepartmentRes.data.data || null,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        setStats(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading dashboard...</div>
      </motion.div>
    );
  }

  if (stats.error) {
    return (
      <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="error-message">{stats.error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      
      {/* Quick Stats Grid */}
      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard 
          icon="fa-users" 
          label="Total Patients" 
          value={<AnimatedNumber value={stats.totalPatients} />} 
          trend="+12%" 
          color="blue" 
        />
        <QuickStatCard 
          icon="fa-user-doctor" 
          label="Active Doctors" 
          value={<AnimatedNumber value={stats.presentDoctors} />} 
          trend="Present Now" 
          color="green" 
        />
        <QuickStatCard 
          icon="fa-calendar-check" 
          label="Today's Appointments" 
          value={<AnimatedNumber value={stats.appointmentsToday} />} 
          trend="On Track" 
          color="purple" 
        />
        <QuickStatCard 
          icon="fa-bed-pulse" 
          label="Occupancy Rate" 
          value={`${stats.occupancyRate}%`} 
          trend={stats.occupancyRate > 80 ? 'High' : 'Normal'} 
          color="orange" 
        />
      </motion.section>

      {/* Financial Overview & Performance Stats */}
      <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>
        
        {/* Financial Overview */}
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Financial Overview</h3>
          
          <StatCard 
            title="Monthly Revenue" 
            value={`$${stats.monthlyRevenue.toLocaleString('en-US')}`} 
            sub={`Net Profit: $${(stats.monthlyRevenue * 0.7).toLocaleString('en-US')}`}
            progress={75} 
            icon="fa-wallet" 
            color="blue" 
          />
          
          <StatCard 
            title="Daily Revenue" 
            value={`$${stats.dailyRevenue.toLocaleString('en-US')}`} 
            sub={`Clinic Profit: $${(stats.dailyRevenue * 0.6).toLocaleString('en-US')}`}
            progress={60} 
            icon="fa-money-bill-transfer" 
            color="orange" 
          />
        </motion.div>

        {/* Performance Stats */}
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Performance Stats</h3>
          
          <StatCard 
            title="Top Doctor This Week" 
            value={stats.topDoctor?.doctor_name || 'No data'} 
            sub={`${stats.topDoctor?.appointments_count || 0} Appointments • ${stats.topDoctor?.department_name || ''}`} 
            icon="fa-award" 
            color="purple" 
          />
          
          <StatCard 
            title="Top Department" 
            value={stats.topDepartment?.department_name || 'No data'} 
            sub={`${stats.topDepartment?.appointments_count || 0} Appointments This Week`} 
            icon="fa-stethoscope" 
            color="pink" 
          />
        </motion.div>
      </motion.section>
    </motion.div>
  );
};

export default DashboardTab;