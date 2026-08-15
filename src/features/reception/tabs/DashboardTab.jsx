import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Users,
  Wallet,
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronDown,
  Calendar,
  History,
  User
} from 'lucide-react';
import api from '../../../api/axios.js'; 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const colorMap = {
  blue: { bg: 'rgba(79,195,247,0.1)', icon: '#4FC3F7', bar: '#4FC3F7' },
  green: { bg: 'rgba(102,187,106,0.1)', icon: '#66BB6A', bar: '#66BB6A' },
  purple: { bg: 'rgba(171,71,188,0.1)', icon: '#AB47BC', bar: '#AB47BC' },
  cyan: { bg: 'rgba(79,195,247,0.1)', icon: '#29B6F6', bar: '#29B6F6' },
  orange: { bg: 'rgba(255,152,0,0.1)', icon: '#FF9800', bar: '#FF9800' },
  pink: { bg: 'rgba(244,143,177,0.1)', icon: '#F48FB1', bar: '#F48FB1' },
};

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const duration = 1500, steps = 60;
    const increment = value / steps;
    let current = 0;

    timerRef.current = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timerRef.current);
        timerRef.current = null;
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="date-display" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Clock size={14} />
      {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &bull; {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

const fmt = (n) => (n ?? 0).toLocaleString('en-US');

const fetchWithRetry = async (url, retries = 2, signal) => {
  try {
    return await api.get(url, { signal });
  } catch (err) {
    if (retries > 0 && !api.isCancel?.(err) && err.name !== 'AbortError' && err.name !== 'CanceledError') {
      return fetchWithRetry(url, retries - 1, signal);
    }
    throw err;
  }
};

export default function DashboardTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    clinic_net_profit: 0,
    clinic_additions_profit: 0,
    doctors_total_payout: 0,
    breakdown_by_method: { online_stripe: 0, cash_reception: 0 },
    breakdown_by_type: { fixed_appointments: 0, additions_total: 0 },
  });
  const [newChildrenCount, setNewChildrenCount] = useState(0);

  // ✅ حالة المواعيد
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const [appointmentsRes, revenueRes, childrenRes] = await Promise.all([
        fetchWithRetry('/home/appointments-count', 2, controller.signal),
        fetchWithRetry('/daily-revenue', 2, controller.signal),
        fetchWithRetry('/home/today-children-count', 2, controller.signal),
      ]);

      setAppointmentsCount(appointmentsRes.data?.data?.today_appointments_count || 0);
      setRevenueData(revenueRes.data?.data || {
        total_revenue: 0,
        clinic_net_profit: 0,
        clinic_additions_profit: 0,
        doctors_total_payout: 0,
        breakdown_by_method: { online_stripe: 0, cash_reception: 0 },
        breakdown_by_type: { fixed_appointments: 0, additions_total: 0 },
      });
      setNewChildrenCount(childrenRes.data?.data?.today_added_children_count || 0);
    } catch (err) {
      if (api.isCancel?.(err) || err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      console.error('Dashboard data fetch error:', err);

      if (err.response?.status === 500) {
        setError({ type: 'server', message: 'Server error (500). Please check Laravel logs.' });
      } else if (err.response?.status >= 400 && err.response?.status !== 401) {
        setError({ type: 'client', message: err.response?.data?.message || 'Failed to load dashboard data.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ جيب قائمة الأطفال
  const fetchChildren = useCallback(async () => {
    try {
      const res = await api.get('/children');
      setChildren(res.data?.children || []);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    }
  }, []);

  // ✅ جيب مواعيد الطفل المختار
  const fetchChildAppointments = useCallback(async (childId) => {
    if (!childId) return;
    
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const [upcomingRes, pastRes] = await Promise.all([
        api.get(`/appointments/upcoming/${childId}`),
        api.get(`/appointments/past/${childId}`),
      ]);

      setUpcomingAppointments(upcomingRes.data?.appointments || []);
      setPastAppointments(pastRes.data?.appointments || []);
    } catch (err) {
      setAppointmentsError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchChildren();

    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDashboardData, fetchChildren]);

  // ✅ لما يتغير الطفل المختار
  useEffect(() => {
    if (selectedChild) {
      fetchChildAppointments(selectedChild.id);
    } else {
      setUpcomingAppointments([]);
      setPastAppointments([]);
    }
  }, [selectedChild, fetchChildAppointments]);

  const {
    total_revenue = 0,
    clinic_net_profit = 0,
    clinic_additions_profit = 0,
    doctors_total_payout = 0,
    breakdown_by_method = { online_stripe: 0, cash_reception: 0 },
    breakdown_by_type = { fixed_appointments: 0, additions_total: 0 },
  } = revenueData || {};

  const netProfitProgress = useMemo(() => {
    return total_revenue > 0 ? Math.min((clinic_net_profit / total_revenue) * 100, 100) : 0;
  }, [total_revenue, clinic_net_profit]);

  const payoutProgress = useMemo(() => {
    return total_revenue > 0 ? Math.min((doctors_total_payout / total_revenue) * 100, 100) : 0;
  }, [total_revenue, doctors_total_payout]);

  const totalMethods = useMemo(() => {
    return (breakdown_by_method?.online_stripe || 0) + (breakdown_by_method?.cash_reception || 0);
  }, [breakdown_by_method]);

  const getChildImage = (child) => {
    if (child?.image && !child.image.includes('girl.png') && !child.image.includes('boy.png')) {
      return child.image;
    }
    return child?.gender === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div 
      className="dashboard-grid-content" 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      exit="exit"
    >
      {/* Error Banner */}
      {error && (
        <motion.div 
          variants={itemVariants}
          style={{ 
            background: error.type === 'server' ? '#fff3e0' : '#ffebee', 
            color: error.type === 'server' ? '#e65100' : '#c62828', 
            padding: '16px 20px', 
            borderRadius: 12,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: `1px solid ${error.type === 'server' ? '#ffe0b2' : '#ffcdd2'}`,
          }}
        >
          <AlertCircle size={20} />
          <div>
            <strong style={{ fontSize: 14 }}>
              {error.type === 'server' ? 'Server Error' : 'Error'}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
              {error.message}
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <motion.div 
          variants={itemVariants}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px 20px',
            gap: 16,
            color: '#90A4AE'
          }}
        >
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Loading dashboard data...</p>
        </motion.div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <motion.section className="quick-stats-grid" variants={itemVariants}>
            <QuickStatCard
              icon={CalendarDays}
              label="Total Appointments"
              value={<AnimatedNumber value={appointmentsCount} />}
              trend="Today"
              trendType="neutral"
              color="blue"
            />
            <QuickStatCard
              icon={Users}
              label="New Children"
              value={<AnimatedNumber value={newChildrenCount} />}
              trend="Added today"
              trendType="neutral"
              color="cyan"
            />
            <QuickStatCard
              icon={DollarSign}
              label="Today's Revenue"
              value={<AnimatedNumber value={total_revenue} prefix="$" />}
              trend={`Net: $${fmt(clinic_net_profit)}`}
              trendType="positive"
              color="purple"
            />
            <QuickStatCard
              icon={Wallet}
              label="Doctors Payout"
              value={<AnimatedNumber value={doctors_total_payout} prefix="$" />}
              trend="Total earnings"
              trendType="neutral"
              color="orange"
            />
          </motion.section>

          {/* Financial Overview & Payouts */}
          <motion.section className="dashboard-stats-wrapper" variants={containerVariants}>
            <motion.div className="stats-column" variants={itemVariants}>
              <h3 className="section-title">Financial Overview</h3>

              <StatCard
                title="Total Revenue"
                value={`$${fmt(total_revenue)}`}
                sub={`Fixed: $${fmt(breakdown_by_type.fixed_appointments)} | Additions: $${fmt(breakdown_by_type.additions_total)}`}
                progress={total_revenue > 0 ? 100 : 0}
                icon={DollarSign}
                color="blue"
              />

              <StatCard
                title="Clinic Net Profit"
                value={`$${fmt(clinic_net_profit)}`}
                sub={`Additions profit: $${fmt(clinic_additions_profit)}`}
                progress={netProfitProgress}
                icon={TrendingUp}
                color="green"
              />
            </motion.div>

            <motion.div className="stats-column" variants={itemVariants}>
              <h3 className="section-title">Payouts & Methods</h3>

              <StatCard
                title="Doctors Payout"
                value={`$${fmt(doctors_total_payout)}`}
                sub="Total doctors earnings today"
                progress={payoutProgress}
                icon={Wallet}
                color="orange"
              />

              <StatCard
                title="Payment Methods"
                value={`$${fmt(totalMethods)}`}
                sub={`Online: $${fmt(breakdown_by_method.online_stripe)} | Cash: $${fmt(breakdown_by_method.cash_reception)}`}
                progress={total_revenue > 0 ? 100 : 0}
                icon={CreditCard}
                color="purple"
              />
            </motion.div>
          </motion.section>

          {/* ✅ قسم المواعيد */}
          <motion.section 
            className="appointments-section" 
            variants={itemVariants}
            style={{ marginTop: 24 }}
          >
            <div className="section-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20 
            }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} />
                Child Appointments
              </h3>
            </div>

            {/* ✅ Dropdown لاختيار الطفل */}
            <div className="child-selector" style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', maxWidth: 400 }}>
                <User size={16} style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#90A4AE',
                  zIndex: 1
                }} />
                <select
                  value={selectedChild?.id || ''}
                  onChange={(e) => {
                    const child = children.find(c => c.id === parseInt(e.target.value));
                    setSelectedChild(child || null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  <option value="">Select a child...</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.first_name} {child.last_name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ 
                  position: 'absolute', 
                  right: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#90A4AE',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>

            {appointmentsError && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {appointmentsError}
              </div>
            )}

            {appointmentsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 40, justifyContent: 'center' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Loading appointments...</span>
              </div>
            ) : selectedChild ? (
              <div className="appointments-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* ✅ المواعيد القادمة */}
                <motion.div 
                  className="appointment-column"
                  variants={itemVariants}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: 16,
                    padding: 20,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 16,
                    color: '#4FC3F7',
                    fontSize: 16
                  }}>
                    <Calendar size={18} />
                    Upcoming Appointments
                    <span style={{ 
                      background: 'rgba(79,195,247,0.15)', 
                      color: '#4FC3F7',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12
                    }}>
                      {upcomingAppointments.length}
                    </span>
                  </h4>

                  {upcomingAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {upcomingAppointments.map(apt => (
                        <div 
                          key={apt.id} 
                          className="appointment-card"
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            background: 'rgba(79,195,247,0.05)',
                            border: '1px solid rgba(79,195,247,0.15)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <img 
                              src={getChildImage(apt.child)} 
                              alt={apt.child?.first_name}
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 14 }}>{apt.child?.first_name}</p>
                              <p style={{ fontSize: 12, color: '#90A4AE' }}>Dr. {apt.doctor?.full_name}</p>
                            </div>
                            <span style={{ 
                              marginLeft: 'auto',
                              padding: '4px 12px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 500,
                              background: apt.status === 'Confirmed' ? 'rgba(102,187,106,0.15)' : 'rgba(255,152,0,0.15)',
                              color: apt.status === 'Confirmed' ? '#66BB6A' : '#FF9800',
                            }}>
                              {apt.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#90A4AE' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CalendarDays size={14} />
                              {formatDate(apt.date)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} />
                              {apt.time}
                            </span>
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#4FC3F7' }}>
                              ${apt.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#90A4AE', padding: 20 }}>
                      No upcoming appointments
                    </p>
                  )}
                </motion.div>

                {/* ✅ المواعيد السابقة */}
                <motion.div 
                  className="appointment-column"
                  variants={itemVariants}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: 16,
                    padding: 20,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 16,
                    color: '#AB47BC',
                    fontSize: 16
                  }}>
                    <History size={18} />
                    Past Appointments
                    <span style={{ 
                      background: 'rgba(171,71,188,0.15)', 
                      color: '#AB47BC',
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 12
                    }}>
                      {pastAppointments.length}
                    </span>
                  </h4>

                  {pastAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {pastAppointments.map(apt => (
                        <div 
                          key={apt.id} 
                          className="appointment-card"
                          style={{
                            padding: 16,
                            borderRadius: 12,
                            background: 'rgba(171,71,188,0.05)',
                            border: '1px solid rgba(171,71,188,0.15)',
                            opacity: 0.85,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <img 
                              src={getChildImage(apt.child)} 
                              alt={apt.child?.first_name}
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <p style={{ fontWeight: 600, fontSize: 14 }}>{apt.child?.first_name}</p>
                              <p style={{ fontSize: 12, color: '#90A4AE' }}>Dr. {apt.doctor?.full_name}</p>
                            </div>
                            <span style={{ 
                              marginLeft: 'auto',
                              padding: '4px 12px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 500,
                              background: apt.status === 'Completed' ? 'rgba(102,187,106,0.15)' : 'rgba(239,83,80,0.15)',
                              color: apt.status === 'Completed' ? '#66BB6A' : '#EF5350',
                            }}>
                              {apt.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#90A4AE' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CalendarDays size={14} />
                              {formatDate(apt.date)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} />
                              {apt.time}
                            </span>
                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#AB47BC' }}>
                              ${apt.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#90A4AE', padding: 20 }}>
                      No past appointments
                    </p>
                  )}
                </motion.div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 60, 
                color: '#90A4AE',
                background: 'var(--card-bg)',
                borderRadius: 16,
                border: '1px dashed var(--border-color)',
              }}>
                <User size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>Select a child to view their appointments</p>
              </div>
            )}
          </motion.section>
        </>
      )}
    </motion.div>
  );
}

function QuickStatCard({ icon: Icon, label, value, trend, trendType, color }) {
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
          <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, progress))}%`, background: c.bar }}></div>
        </div>
      </div>
    </motion.div>
  );
}