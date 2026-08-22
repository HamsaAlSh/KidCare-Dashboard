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

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllDoctorsPages = async () => {
      try {
        const firstPageRes = await api.get('/doctors?page=1', { signal: controller.signal });
        const firstPageData = firstPageRes.data?.data || [];
        const lastPage = firstPageRes.data?.pagination?.last_page || 1;

        let allDoctors = [...firstPageData];

        if (lastPage > 1) {
          const pagePromises = [];
          for (let page = 2; page <= lastPage; page++) {
            pagePromises.push(api.get(`/doctors?page=${page}`, { signal: controller.signal }));
          }
          const extraResponses = await Promise.all(pagePromises);
          extraResponses.forEach(res => {
            allDoctors = [...allDoctors, ...(res.data?.data || [])];
          });
        }

        const formatted = allDoctors.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.full_name}`,
        }));

        setDoctorsList(formatted);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching doctors:', error);
        }
      }
    };

    fetchAllDoctorsPages();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctorsList[0].id);
    }
  }, [doctorsList, selectedDoctorId, setSelectedDoctorId]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStatistics = async () => {
      setLoading(true);
      const doctorId = selectedDoctorId || doctorsList[0]?.id;

      if (!doctorId) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.allSettled([
          api.get('/reports/children-age-distribution', { signal: controller.signal }),
          api.get(`/reports/${doctorId}/weekly-stats`, { signal: controller.signal }),
          api.get('/reports/weekly-summary', { signal: controller.signal }),
          api.get('/reports/monthly-budget', { signal: controller.signal }),
          api.get('/reports/top-three-departments-share', { signal: controller.signal }),
          api.get('/reports/appointments-per-weekday', { signal: controller.signal }),
        ]);

        const [ageRes, docStatsRes, summaryRes, budgetRes, deptsRes, weeklyRes] = results;

        if (ageRes.status === 'fulfilled' && ageRes.value.data?.status === 'success') {
          setAgeDistribution(ageRes.value.data.data?.map(item => ({
            age: item.age_range,
            count: item.children_count
          })) || []);
        }

        if (docStatsRes.status === 'fulfilled' && docStatsRes.value.data?.status === 'success') {
          setWeeklyStats(docStatsRes.value.data.data);
        } else {
          setWeeklyStats(null);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.status === 'success') {
          setWeeklySummary(summaryRes.value.data.data);
        }

        if (budgetRes.status === 'fulfilled' && budgetRes.value.data?.status === 'success') {
          setMonthlyBudget(budgetRes.value.data.data || []);
        }

        if (deptsRes.status === 'fulfilled' && deptsRes.value.data?.status === 'success') {
          setDepartmentsShare(deptsRes.value.data.data || []);
        }

        if (weeklyRes.status === 'fulfilled' && weeklyRes.value.data?.status === 'success') {
          setWeeklyAppointmentsData(weeklyRes.value.data.data || []);
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching statistics:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (doctorsList.length > 0) {
      fetchStatistics();
    }

    return () => controller.abort();
  }, [doctorsList]);

  useEffect(() => {
    if (!selectedDoctorId || doctorsList.length === 0) return;

    const doctorExists = doctorsList.some(doc => doc.id === selectedDoctorId);
    if (!doctorExists) return;

    const controller = new AbortController();

    const fetchDoctorStats = async () => {
      try {
        const response = await api.get(`/reports/${selectedDoctorId}/weekly-stats`, { signal: controller.signal });
        if (response.data?.status === 'success') {
          setWeeklyStats(response.data.data);
        }
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
          setWeeklyStats(null);
        }
      }
    };

    fetchDoctorStats();
    return () => controller.abort();
  }, [selectedDoctorId, doctorsList]);

  const doctorOptions = doctorsList.map(doc => ({
    value: doc.id,
    label: doc.name
  }));

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
      { subject: 'Appointments', A: Math.round(Math.min(((weeklyStats.weekly_appointments || 0) / 50) * 100, 100)), fullMark: 100 },
      { subject: 'Patients', A: Math.round(Math.min(((weeklyStats.weekly_patients || 0) / 30) * 100, 100)), fullMark: 100 },
      { subject: 'Hours', A: Math.round(Math.min(((weeklyStats.weekly_working_hours || 0) / 40) * 100, 100)), fullMark: 100 },
      { subject: 'Experience', A: Math.round(Math.min(((weeklyStats.experience_years || 0) / 15) * 100, 100)), fullMark: 100 },
    ];
  };

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>Loading statistics...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
    
      <motion.div className="manager-insights-grid" variants={itemVariants}>
        
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