import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  History,
  Phone,
  User,
  Stethoscope,
  Building2,
  CheckCircle2,
  Receipt,
  X,
  LogOut
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

const AnimatedNumber = ({ value = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const numericValue = Number(value) || 0;
    if (numericValue === 0) {
      setDisplayValue(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    const duration = 1200, steps = 40;
    const increment = numericValue / steps;
    let current = 0;

    timerRef.current = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
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

  return <span>{prefix}{(displayValue || 0).toLocaleString('en-US')}{suffix}</span>;
};

const fmt = (n) => (Number(n) || 0).toLocaleString('en-US');

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
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

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

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [dateAppointments, setDateAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = localStorage.getItem('receptionist_token') || localStorage.getItem('token');
      await api.post('/logoutReception', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setLogoutLoading(false);
      window.location.href = '/login';
    }
  };

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

      // استخراج عدد المواعيد
      const aptCount = 
        appointmentsRes.data?.data?.today_appointments_count ?? 
        appointmentsRes.data?.today_appointments_count ?? 
        0;
      setAppointmentsCount(Number(aptCount));

      // استخراج البيانات المالية بالوصول لكائن financials
      const rawData = revenueRes.data?.data || {};
      const financials = rawData.financials || rawData;
      const methods = rawData.breakdown_by_method || {};
      const types = rawData.breakdown_by_type || {};

      setRevenueData({
        total_revenue: Number(financials.total_revenue ?? financials.today_revenue ?? 0),
        clinic_net_profit: Number(financials.clinic_net_profit ?? financials.net_profit ?? 0),
        clinic_additions_profit: Number(financials.clinic_additions_profit ?? 0),
        doctors_total_payout: Number(financials.doctors_total_payout ?? financials.doctors_payout ?? 0),
        breakdown_by_method: {
          online_stripe: Number(methods.online_stripe ?? methods.online ?? 0),
          cash_reception: Number(methods.cash_reception ?? methods.cash ?? 0),
        },
        breakdown_by_type: {
          fixed_appointments: Number(types.fixed_appointments ?? types.fixed_price ?? 0),
          additions_total: Number(types.additions_total ?? types.additions ?? 0),
        },
      });

      // استخراج عدد الأطفال
      const childrenCount = 
        childrenRes.data?.today_added_children_count ?? 
        childrenRes.data?.data?.today_added_children_count ?? 
        0;
      setNewChildrenCount(Number(childrenCount));

    } catch (err) {
      if (api.isCancel?.(err) || err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      console.error('Error fetching dashboard data:', err);

      if (err.response?.status === 500) {
        setError({ type: 'server', message: 'Server error (500). Please check Laravel logs.' });
      } else if (err.response?.status >= 400 && err.response?.status !== 401) {
        setError({ type: 'client', message: err.response?.data?.message || 'Failed to load dashboard data.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAppointmentsByDate = useCallback(async (date) => {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const res = await api.get(`/reception/appointments/date/${date}`);

      const appointments = 
        res.data?.appointments || 
        res.data?.data?.appointments || 
        res.data?.data || 
        [];
      
      setDateAppointments(Array.isArray(appointments) ? appointments : []);
    } catch (err) {
      console.error('Appointments Error:', err.response?.data);
      setDateAppointments([]);
      setAppointmentsError(err.response?.data?.message || 'Failed to load appointments for selected date');
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsByDate(selectedDate);
    }
  }, [selectedDate, fetchAppointmentsByDate]);

  const handleOpenPaymentModal = async (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setLoadingSummary(true);
    try {
      const res = await api.get(`/appointments/${appointmentId}/payment-summary-reception`);
      setPaymentSummary(res.data?.data || null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch payment summary');
      setSelectedAppointmentId(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCheckInAndOpenPayment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    try {
      await api.post(`/appointments/${appointmentId}/check-in`);
      
      setDateAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'checked_in' } : apt)
      );

      await handleOpenPaymentModal(appointmentId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedAppointmentId) return;
    setSubmittingPayment(true);
    try {
      await api.post(`/appointments/${selectedAppointmentId}/complete-payment`);
      alert('Payment has been completed successfully.');
      
      setDateAppointments(prev => 
        prev.map(apt => apt.id === selectedAppointmentId ? { ...apt, status: 'completed', payment_status: 'paid' } : apt)
      );

      setSelectedAppointmentId(null);
      setPaymentSummary(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

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

  const getChildImage = (patient) => {
    if (patient?.image && !patient.image.includes('girl.png') && !patient.image.includes('boy.png')) {
      return patient.image;
    }
    return patient?.gender === 'male' 
      ? 'https://kidcare.sy/images/boy.png' 
      : 'https://kidcare.sy/images/girl.png';
  };

  const isTodaySelected = selectedDate === getTodayDate();

  return (
    <motion.div 
      className="dashboard-grid-content" 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      exit="exit"
    >
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
          <motion.section className="quick-stats-grid" variants={itemVariants}>
            <QuickStatCard
              icon={CalendarDays}
              label="Total Appointments"
              value={<AnimatedNumber value={appointmentsCount} />}
              trendType="neutral"
              color="blue"
            />
            <QuickStatCard
              icon={Users}
              label="New Children"
              value={<AnimatedNumber value={newChildrenCount} />}
              trendType="neutral"
              color="cyan"
            />
            <QuickStatCard
              icon={DollarSign}
              label="Today's Revenue"
              value={<AnimatedNumber value={total_revenue} prefix="$" />}
              trendType="positive"
              color="purple"
            />
            <QuickStatCard
              icon={Wallet}
              label="Doctors Payout"
              value={<AnimatedNumber value={doctors_total_payout} prefix="$" />}
              trendType="neutral"
              color="orange"
            />
          </motion.section>

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

          <motion.section 
            className="appointments-section" 
            variants={itemVariants}
            style={{ marginTop: 24 }}
          >
            <div className="section-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Calendar size={20} />
                Appointments List
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, color: '#90A4AE', fontWeight: 500 }}>Select Date:</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: 'var(--card-bg, #ffffff)',
                    color: 'inherit',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
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
            ) : dateAppointments.length > 0 ? (
              <motion.div 
                className="appointments-list"
                variants={itemVariants}
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  borderRadius: 16,
                  padding: 20,
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {dateAppointments.map(apt => {
                    const statusNormalized = apt.status?.toLowerCase();
                    
                    const isCheckedIn = 
                      statusNormalized === 'checked_in' || 
                      statusNormalized === 'checked in' || 
                      statusNormalized === 'messages.checked_in';

                    const isCompleted = statusNormalized === 'completed';

                    return (
                      <div 
                        key={apt.id} 
                        className="appointment-card"
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          background: 'rgba(79,195,247,0.05)',
                          border: '1px solid rgba(79,195,247,0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <img 
                            src={getChildImage(apt.patient)} 
                            alt={apt.patient?.child_name}
                            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = 'https://kidcare.sy/images/default-avatar.png'}
                          />
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>
                              {apt.patient?.child_name}
                            </p>
                            <p style={{ fontSize: 12, color: '#90A4AE', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} /> Parent: {apt.patient?.parent_name}
                            </p>
                          </div>

                          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                            {isCheckedIn ? (
                              <button
                                onClick={() => handleOpenPaymentModal(apt.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 8,
                                  background: '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Receipt size={14} /> View Payment
                              </button>
                            ) : (
                              isTodaySelected && !isCompleted && (
                                <button
                                  onClick={() => handleCheckInAndOpenPayment(apt.id)}
                                  disabled={actionLoadingId === apt.id}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  {actionLoadingId === apt.id ? (
                                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )} 
                                  Check In
                                </button>
                              )
                            )}

                            <span style={{ 
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: isCompleted ? 'rgba(102,187,106,0.15)' : isCheckedIn ? 'rgba(59,130,246,0.15)' : 'rgba(255,152,0,0.15)',
                              color: isCompleted ? '#66BB6A' : isCheckedIn ? '#3b82f6' : '#FF9800',
                            }}>
                              {isCompleted ? 'Completed' : isCheckedIn ? 'Checked In' : apt.status}
                            </span>
                            
                            <span style={{ 
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: apt.payment_status === 'paid' ? 'rgba(102,187,106,0.15)' : 'rgba(239,83,80,0.15)',
                              color: apt.payment_status === 'paid' ? '#66BB6A' : '#EF5350',
                            }}>
                              {apt.payment_status?.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', margin: '4px 0' }} />

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                          gap: 12, 
                          fontSize: 13, 
                          color: '#607D8B' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={15} color="#4FC3F7" />
                            <span>Time: <strong>{apt.time}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <DollarSign size={15} color="#66BB6A" />
                            <span>Price: <strong>${apt.price}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Stethoscope size={15} color="#AB47BC" />
                            <span>Doctor: <strong>Dr. {apt.doctor?.full_name}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={15} color="#FF9800" />
                            <span>Dept: <strong>{apt.doctor?.department}</strong></span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={15} color="#29B6F6" />
                            <span>Phone: <strong>{apt.patient?.parent_phone}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: 60, 
                color: '#90A4AE',
                background: 'var(--card-bg, #ffffff)',
                borderRadius: 16,
                border: '1px dashed var(--border-color, #e2e8f0)',
              }}>
                <History size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>No appointments scheduled for {selectedDate}</p>
              </div>
            )}
          </motion.section>

          <motion.div 
            variants={itemVariants}
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px dashed var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                border: '1px solid rgba(239, 83, 80, 0.3)',
                background: 'rgba(239, 83, 80, 0.08)',
                color: '#ef5350',
                fontWeight: 600,
                fontSize: 14,
                cursor: logoutLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {logoutLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <LogOut size={18} />
              )}
              <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {selectedAppointmentId && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#fff', width: '100%', maxWidth: '480px', margin: '20px',
                borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={20} color="#10b981" /> Payment Summary
                </h3>
                <button onClick={() => { setSelectedAppointmentId(null); setPaymentSummary(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <X size={20} color="#94a3b8" />
                </button>
              </div>

              {loadingSummary ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                </div>
              ) : paymentSummary ? (
                <div>
                  <div style={{ fontSize: 14, color: '#475569', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>Patient:</strong> {paymentSummary.patient_name}</div>
                    <div><strong>Doctor:</strong> {paymentSummary.doctor_name}</div>
                    <div><strong>Booking Source:</strong> {paymentSummary.booking_source}</div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <span>Fixed Consultation Price:</span>
                    <strong>${paymentSummary.fixed_price} ({paymentSummary.fixed_price_status})</strong>
                  </div>

                  {paymentSummary.additions && paymentSummary.additions.length > 0 && (
                    <div style={{ margin: '12px 0' }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 6 }}>Additions & Services:</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#f8fafc', padding: 10, borderRadius: 8 }}>
                        {paymentSummary.additions.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span>{item.item_name}</span>
                            <strong>${item.price}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Additions Total:</span>
                      <strong>${paymentSummary.totals?.additions_total}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Already Paid Online:</span>
                      <strong>${paymentSummary.totals?.already_paid_online}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
                      <span>Required Cash Now:</span>
                      <span>${paymentSummary.totals?.required_cash_now}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePayment}
                    disabled={submittingPayment}
                    style={{
                      width: '100%', padding: '12px', background: '#10b981', color: '#fff',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {submittingPayment ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />} Complete Payment
                  </button>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#ef4444' }}>Could not load payment details.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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