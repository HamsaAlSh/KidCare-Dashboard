import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle, DollarSign, Users, Clock, TrendingUp } from 'lucide-react';
import { appointments } from '../data/appointments';
import AppointmentRow from '../components/AppointmentRow';

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
    const duration = 1500, steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

export default function DashboardTab() {
  const [stats, setStats] = useState({ total: 0, completed: 0, revenue: 0, new: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const completed = appointments.filter(a => a.status === 'completed');
    const paid = appointments.filter(a => a.paid);
    setStats({
      total: appointments.length,
      completed: completed.length,
      revenue: paid.reduce((s, a) => s + a.amount, 0),
      new: appointments.filter(a => a.id > 8).length,
    });

    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const current = appointments.filter(a => a.status === 'current');
  const upcoming = appointments.filter(a => a.status === 'upcoming');

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const paidCount = appointments.filter(a => a.paid).length;
  const paymentRate = stats.total > 0 ? Math.round((paidCount / stats.total) * 100) : 0;

  return (
    <motion.div className="dashboard-grid-content" variants={containerVariants} initial="hidden" animate="visible" exit="exit">

      {/* Page Header */}
      <motion.div className="page-header" variants={itemVariants}>
        <div className="header-greeting">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4FC3F7, #81D4FA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)',
              flexShrink: 0,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #1565C0 0%, #4FC3F7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>
                KidCare Clinic
              </h1>
              <p style={{ color: '#90A4AE', fontSize: 14, margin: '4px 0 0', fontWeight: 600 }}>
                Reception Dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="date-display" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} />
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.section className="quick-stats-grid" variants={itemVariants}>
        <QuickStatCard
          icon={CalendarDays}
          label="Total Appointments"
          value={<AnimatedNumber value={stats.total} />}
          trend={`+${stats.new} new today`}
          trendType="positive"
          color="blue"
        />
        <QuickStatCard
          icon={CheckCircle}
          label="Completed"
          value={<AnimatedNumber value={stats.completed} />}
          trend={`${completionRate}% completion rate`}
          trendType="positive"
          color="green"
        />
        <QuickStatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={<AnimatedNumber value={stats.revenue} prefix="$" />}
          trend={`${paidCount} payments received`}
          trendType="positive"
          color="purple"
        />
        <QuickStatCard
          icon={Users}
          label="New Patients"
          value={<AnimatedNumber value={stats.new} />}
          trend="This week"
          trendType="neutral"
          color="cyan"
        />
      </motion.section>

      {/* Financial Overview & Performance Stats */}
      <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>

        {/* Financial Overview */}
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Financial Overview</h3>

          <StatCard
            title="Today's Revenue"
            value={`$${stats.revenue.toLocaleString('en-US')}`}
            sub={`${paidCount} paid appointments out of ${stats.total}`}
            progress={paymentRate}
            icon={DollarSign}
            color="blue"
          />

          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            sub={`${stats.completed} of ${stats.total} appointments completed`}
            progress={completionRate}
            icon={CheckCircle}
            color="green"
          />
        </motion.div>

        {/* Performance Stats */}
        <motion.div className="stats-column" variants={itemVariants}>
          <h3 className="section-title">Performance Stats</h3>

          <StatCard
            title="New Patients"
            value={stats.new}
            sub="New registrations this week"
            progress={Math.min((stats.new / 20) * 100, 100)}
            icon={Users}
            color="purple"
          />

          <StatCard
            title="Total Appointments"
            value={stats.total}
            sub="Scheduled for today"
            progress={100}
            icon={CalendarDays}
            color="cyan"
          />
        </motion.div>
      </motion.section>

      {/* Appointments Section */}
      <motion.section className="dashboard-section" variants={itemVariants}>
        <div className="section-header">
          <h2 className="section-title">Appointments</h2>
          <span className="badge-count pulse-badge">{appointments.length}</span>
        </div>

        <div className="content-grid">
          {/* Current Appointments */}
          <motion.div className="content-card" variants={itemVariants}>
            <div className="card-header">
              <h3 className="card-title">Current Appointment</h3>
              <span className="badge badge-current">Live</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {current.length ? (
                    current.map(a => <AppointmentRow key={a.id} apt={a} />)
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">
                          <CalendarDays size={48} style={{ opacity: 0.4, color: '#81D4FA' }} />
                          <p>No current appointments</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div className="content-card" variants={itemVariants}>
            <div className="card-header">
              <h3 className="card-title">Upcoming Appointments</h3>
              <span className="badge badge-upcoming">{upcoming.length} Pending</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.length ? (
                    upcoming.map(a => <AppointmentRow key={a.id} apt={a} />)
                  ) : (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">
                          <CalendarDays size={48} style={{ opacity: 0.4, color: '#81D4FA' }} />
                          <p>No upcoming appointments</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}

function QuickStatCard({ icon: Icon, label, value, trend, trendType, color }) {
  const colorMap = {
    blue: { bg: 'rgba(79,195,247,0.1)', icon: '#4FC3F7', bar: '#4FC3F7' },
    green: { bg: 'rgba(102,187,106,0.1)', icon: '#66BB6A', bar: '#66BB6A' },
    purple: { bg: 'rgba(171,71,188,0.1)', icon: '#AB47BC', bar: '#AB47BC' },
    cyan: { bg: 'rgba(79,195,247,0.1)', icon: '#29B6F6', bar: '#29B6F6' },
    orange: { bg: 'rgba(255,152,0,0.1)', icon: '#FF9800', bar: '#FF9800' },
    pink: { bg: 'rgba(244,143,177,0.1)', icon: '#F48FB1', bar: '#F48FB1' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div className="quick-stat-card" whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
      <div className="stat-icon-wrapper" style={{ background: c.bg, color: c.icon }}>
        <Icon size={24} />
      </div>
      <div className="quick-stat-content">
        <h4>{label}</h4>
        <p className="quick-stat-value">{value}</p>
        <div className={`trend ${trendType}`}>
          {trendType === 'positive' && <TrendingUp size={12} />}
          {trend}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, title, value, sub, progress, color }) {
  const colorMap = {
    blue: { bg: 'rgba(79,195,247,0.1)', icon: '#4FC3F7', bar: '#4FC3F7' },
    green: { bg: 'rgba(102,187,106,0.1)', icon: '#66BB6A', bar: '#66BB6A' },
    purple: { bg: 'rgba(171,71,188,0.1)', icon: '#AB47BC', bar: '#AB47BC' },
    cyan: { bg: 'rgba(79,195,247,0.1)', icon: '#29B6F6', bar: '#29B6F6' },
    orange: { bg: 'rgba(255,152,0,0.1)', icon: '#FF9800', bar: '#FF9800' },
    pink: { bg: 'rgba(244,143,177,0.1)', icon: '#F48FB1', bar: '#F48FB1' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div className="stat-card-v2" whileHover={{ borderColor: 'rgba(79,195,247,0.2)' }} transition={{ duration: 0.2 }}>
      <div className="stat-icon-v2" style={{ background: c.bg, color: c.icon }}>
        <Icon size={26} />
      </div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-val">{value}</p>
        <span className="stat-sub">{sub}</span>
        <div className="progress-bar-kidcare">
          <div className="progress-fill" style={{ width: `${progress}%`, background: c.bar }}></div>
        </div>
      </div>
    </motion.div>
  );
}