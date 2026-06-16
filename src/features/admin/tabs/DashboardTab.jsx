import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedNumber, QuickStatCard, StatCard } from '../components/SharedComponents';

// Inline animation variants (same as original)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// Inline dashboard stats (same as original)
const dashboardStats = {
  monthlyBudget: 250000, dailyBudget: 32000,
  topDoctor: 'Dr. Sarah Ahmed', activeDept: 'General Pediatrics',
  rem: { daily: 12000, monthly: 30000 },
  totalPatients: 1248, totalDoctors: 45,
  appointmentsToday: 89, occupancyRate: 78
};

const DashboardTab = () => {
  return (
    <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard icon="fa-users" label="Total Patients" value={<AnimatedNumber value={dashboardStats.totalPatients} />} trend="+12%" color="blue" />
        <QuickStatCard icon="fa-user-doctor" label="Active Doctors" value={<AnimatedNumber value={dashboardStats.totalDoctors} />} trend="+3" color="green" />
        <QuickStatCard icon="fa-calendar-check" label="Today's Appointments" value={<AnimatedNumber value={dashboardStats.appointmentsToday} />} trend="On Track" color="purple" />
        <QuickStatCard icon="fa-bed-pulse" label="Occupancy Rate" value={`${dashboardStats.occupancyRate}%`} trend="High" color="orange" />
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
};

export default DashboardTab;