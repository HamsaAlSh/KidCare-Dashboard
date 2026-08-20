import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber, QuickStatCard, StatCard } from '../components/SharedComponents';
import api from '../../../api/axios';

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
        ] = await Promise.allSettled([
          api.get('/home/patients-count'),
          api.get('/home/present-doctors-count'),
          api.get('/home/appointments-count'),
          api.get('/home/clinic-occupancy'),
          api.get('/monthly-revenue'),
          api.get('/daily-revenue'),
          api.get('/doctors/top-this-week'),
          api.get('/home/top-department'),
        ]);

        const getData = (res) => {
          if (res.status === 'rejected') {
            console.warn('API call rejected:', res.reason?.message || res.reason);
            return null;
          }
          return res.value?.data ?? null;
        };

        const patientsData = getData(patientsRes);
        const doctorsData = getData(doctorsRes);
        const appointmentsData = getData(appointmentsRes);
        const occupancyData = getData(occupancyRes);
        const monthlyData = getData(monthlyRevenueRes);
        const dailyData = getData(dailyRevenueRes);
        const topDoctorData = getData(topDoctorRes);
        const topDeptData = getData(topDepartmentRes);

        setStats({
          totalPatients: patientsData?.patients_count || 0,
          presentDoctors: doctorsData?.data?.present_doctors_count || 0,
          appointmentsToday: appointmentsData?.data?.today_appointments_count || 0,
          occupancyRate: parseFloat(occupancyData?.data?.clinic_occupancy_percentage) || 0,
          monthlyRevenue: monthlyData?.data?.financials?.total_revenue || 0,
          dailyRevenue: dailyData?.data?.financials?.total_revenue || 0,
          topDoctor: topDoctorData?.data || null,
          topDepartment: topDeptData?.data || null,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error(' Error fetching dashboard data:', error);
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

      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard 
          icon="fa-users" 
          label="Total Patients" 
          value={<AnimatedNumber value={stats.totalPatients} />} 
          color="blue" 
        />
        <QuickStatCard 
          icon="fa-user-doctor" 
          label="Active Doctors" 
          value={<AnimatedNumber value={stats.presentDoctors} />} 
          color="green" 
        />
        <QuickStatCard 
          icon="fa-calendar-check" 
          label="Today's Appointments" 
          value={<AnimatedNumber value={stats.appointmentsToday} />} 
          color="purple" 
        />
        <QuickStatCard 
          icon="fa-bed-pulse" 
          label="Occupancy Rate" 
          value={`${stats.occupancyRate}%`} 
          color="orange" 
        />
      </motion.section>

      <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>

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
            progress={stats.dailyRevenue > 0 ? Math.min((stats.dailyRevenue / 1000) * 100, 100) : 0} 
            icon="fa-money-bill-transfer" 
            color="orange" 
          />
        </motion.div>

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