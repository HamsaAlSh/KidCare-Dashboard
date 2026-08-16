import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import Select from 'react-select';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

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
      <Tooltip contentStyle={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
      <Area type="monotone" dataKey="revenue" stroke="#4FC3F7" strokeWidth={3} fill="url(#colorRevenue)" />
      <Area type="monotone" dataKey="expenses" stroke="#EF5350" strokeWidth={3} fill="url(#colorExpenses)" />
    </AreaChart>
  </ResponsiveContainer>
);

const CreativePieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" animationBegin={0} animationDuration={1500}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
    </PieChart>
  </ResponsiveContainer>
);

const CreativeBarChart = ({ data, dataKey = "appointments", color = "#4FC3F7" }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(79,195,247,0.1)" />
      <XAxis dataKey="day" stroke="#90A4AE" fontSize={12} />
      <YAxis stroke="#90A4AE" fontSize={12} />
      <Tooltip cursor={{ fill: 'rgba(79,195,247,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
      <Bar dataKey={dataKey} fill={color} radius={[12, 12, 0, 0]} animationDuration={1500}>
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

const StatisticsTab = ({ selectedDoctorId, setSelectedDoctorId }) => {
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState([]);
  const [departmentsShare, setDepartmentsShare] = useState([]);
  const [weeklyAppointmentsData, setWeeklyAppointmentsData] = useState([]);

  // جلب كل الأطباء
  useEffect(() => {
    const fetchAllDoctorsPages = async () => {
      try {
        let allDoctors = [];
        let currentPage = 1;
        let lastPage = 1;

        do {
          const response = await api.get(`/doctors?page=${currentPage}`);
          const data = response.data?.data || [];
          const pagination = response.data?.pagination || {};

          allDoctors = [...allDoctors, ...data];
          lastPage = pagination.last_page || 1;
          currentPage++;
        } while (currentPage <= lastPage);

        const formatted = allDoctors.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.full_name}`,
        }));

        setDoctorsList(formatted);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchAllDoctorsPages();
  }, []);

  // ✅ جديد - اختيار أول طبيب تلقائياً عند تحميل القائمة
  useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorsList[0].id);
    }
  }, [doctorsList, selectedDoctorId, setSelectedDoctorId]);

  // ✅ جلب الإحصائيات - كل API منفصل بـ try/catch
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);

      const doctorId = selectedDoctorId || doctorsList[0]?.id;

      if (!doctorId) {
        setLoading(false);
        return;
      }

      // 1. Age Distribution
      try {
        const response = await api.get('/reports/children-age-distribution');
        if (response.data?.status === 'success') {
          setAgeDistribution(response.data.data?.map(item => ({
            age: item.age_range,
            count: item.children_count
          })) || []);
        }
      } catch (e) { /* silent fail */ }

      // 2. Weekly Stats (Doctor)
      try {
        const response = await api.get(`/reports/${doctorId}/weekly-stats`);
        if (response.data?.status === 'success') {
          setWeeklyStats(response.data.data);
        }
      } catch (e) { 
        setWeeklyStats(null);
      }

      // 3. Weekly Summary
      try {
        const response = await api.get('/reports/weekly-summary');
        if (response.data?.status === 'success') {
          setWeeklySummary(response.data.data);
        }
      } catch (e) { /* silent fail */ }

      // 4. Monthly Budget
      try {
        const response = await api.get('/reports/monthly-budget');
        if (response.data?.status === 'success') {
          setMonthlyBudget(response.data.data || []);
        }
      } catch (e) { /* silent fail */ }

      // 5. Departments Share
      try {
        const response = await api.get('/reports/top-three-departments-share');
        if (response.data?.status === 'success') {
          setDepartmentsShare(response.data.data || []);
        }
      } catch (e) { /* silent fail */ }

      // 6. Weekly Appointments
      try {
        const response = await api.get('/reports/appointments-per-weekday');
        if (response.data?.status === 'success') {
          setWeeklyAppointmentsData(response.data.data || []);
        }
      } catch (e) { /* silent fail */ }

      setLoading(false);
    };

    if (doctorsList.length > 0) {
      fetchStatistics();
    }
  }, [selectedDoctorId, doctorsList]);

  // ✅ جلب إحصائيات طبيب محدد - مع التحقق من وجود الطبيب في القائمة
  useEffect(() => {
    if (!selectedDoctorId) return;

    // ✅ تأكد أن الطبيب موجود في doctorsList قبل إرسال الطلب
    const doctorExists = doctorsList.some(doc => doc.id === selectedDoctorId);
    if (!doctorExists) return;

    const fetchDoctorStats = async () => {
      try {
        const response = await api.get(`/reports/${selectedDoctorId}/weekly-stats`);
        if (response.data?.status === 'success') {
          setWeeklyStats(response.data.data);
        }
      } catch (e) {
        setWeeklyStats(null);
      }
    };

    fetchDoctorStats();
  }, [selectedDoctorId, doctorsList]);

  const doctorOptions = doctorsList.map(doc => ({
    value: doc.id,
    label: doc.name
  }));

  // ✅ تعديل: لا تستخدم doctorOptions[0] كـ fallback لتجنب undefined
  const selectedOption = doctorOptions.find(opt => opt.value === selectedDoctorId) || null;

  const monthlyRevenue = monthlyBudget.map(item => ({
    month: item.month_name?.slice(0, 3) || '',
    revenue: item.income_details?.total_income || 0,
    expenses: item.expense_details?.total_expense || 0,
  }));

  const departmentDistribution = departmentsShare.map(dept => ({
    name: dept.department_name,
    value: dept.appointments_count || 0,
    color: dept.department_id === 1 ? '#4FC3F7' : 
           dept.department_id === 2 ? '#EF5350' : '#AB47BC',
  }));

  const weeklyAppointments = weeklyAppointmentsData.map(day => ({
    day: day.day_name?.slice(0, 3) || '',
    appointments: day.appointments_count || 0,
  }));

  const getDoctorPerformance = () => {
    if (!weeklyStats) return [];

    return [
      { subject: 'Appointments', A: Math.min(((weeklyStats.weekly_appointments || 0) / 50) * 100, 100), fullMark: 100 },
      { subject: 'Patients', A: Math.min(((weeklyStats.weekly_patients || 0) / 30) * 100, 100), fullMark: 100 },
      { subject: 'Hours', A: Math.min(((weeklyStats.weekly_working_hours || 0) / 40) * 100, 100), fullMark: 100 },
      { subject: 'Experience', A: Math.min(((weeklyStats.experience_years || 0) / 15) * 100, 100), fullMark: 100 },
    ];
  };

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading statistics...</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      {/* ✅ Weekly Summary Cards */}
      <motion.div className="manager-insights-grid" variants={itemVariants}>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E8F5E9', color: '#66BB6A' }}>
            <i className="fa-solid fa-door-open"></i>
          </div>
          <div className="insight-content">
            <h4>Weekly Appointments</h4>
            <p className="insight-value">{weeklySummary?.total_confirmed_and_completed || 0}</p>
            <small>This week's total</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E1F5FE', color: '#4FC3F7' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="insight-content">
            <h4>Active Doctors</h4>
            <p className="insight-value">{weeklySummary?.active_doctors_this_week || 0}</p>
            <small>Working this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FFF3E0', color: '#FF9800' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="insight-content">
            <h4>Available Slots</h4>
            <p className="insight-value">{weeklySummary?.available_appointments_left || 0}</p>
            <small>Remaining this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FCE4EC', color: '#EC407A' }}>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className="insight-content">
            <h4>Busiest Day</h4>
            <p className="insight-value">{weeklySummary?.busiest_day_of_week?.day_name || '-'}</p>
            <small>{weeklySummary?.busiest_day_of_week?.appointments_count || 0} appointments</small>
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

            <Select
              value={selectedOption}
              onChange={(option) => setSelectedDoctorId(option?.value)}
              options={doctorOptions}
              placeholder="Select a doctor..."
              isSearchable={true}
              maxMenuHeight={300}
              menuPlacement="auto"
              className="doctor-select-react"
              classNamePrefix="doctor-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  border: '2px solid rgba(79, 195, 247, 0.2)',
                  padding: '2px 8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '250px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#4FC3F7' },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: state.isSelected ? '#4FC3F7' : state.isFocused ? '#E1F5FE' : '#fff',
                  color: state.isSelected ? '#fff' : '#1565C0',
                  cursor: 'pointer',
                  '&:active': { backgroundColor: '#4FC3F7' },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#1565C0',
                  fontWeight: '700',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#90A4AE',
                }),
              }}
            />
          </div>

          <CreativeRadarChart data={getDoctorPerformance()} />

          {weeklyStats && (
            <div className="selected-doctor-info">
              <p>
                <strong>{weeklyStats.doctor_name}</strong> | 
                Department: {weeklyStats.department_id} | 
                Appointments: {weeklyStats.weekly_appointments || 0} | 
                Patients: {weeklyStats.weekly_patients || 0}
              </p>
              <small>
                Week: {weeklyStats.week_range?.start_saturday} to {weeklyStats.week_range?.end_thursday}
              </small>
            </div>
          )}
        </motion.div>

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
};

export default StatisticsTab;