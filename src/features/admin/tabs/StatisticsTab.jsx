import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Select from 'react-select';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// ✅ API Instance برا الـ Component
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

// Inline chart components
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

const StatisticsTab = ({ selectedDoctorId, setSelectedDoctorId, doctorsData: propDoctors }) => {
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorsList, setDoctorsList] = useState([]);

  // ✅ جلب الأطباء من API
    // ✅ جلب كل الأطباء من كل الصفحات
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
          
          console.log(`📄 Page ${currentPage - 1}: ${data.length} doctors (total so far: ${allDoctors.length}, lastPage: ${lastPage})`);
        } while (currentPage <= lastPage);
        
        console.log('✅ Total doctors fetched:', allDoctors.length);
        
        const formatted = allDoctors.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.full_name}`,
        }));
        
        setDoctorsList(formatted);
      } catch (error) {
        console.error('❌ Error:', error);
        if (propDoctors && propDoctors.length > 0) {
          setDoctorsList(propDoctors);
        }
      }
    };

    fetchAllDoctorsPages();
  }, []);

  // ✅ Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [ageRes, statsRes] = await Promise.all([
          api.get('/reports/children-age-distribution'),
          api.get(`/reports/${selectedDoctorId || 1}/weekly-stats`),
        ]);

        console.log('📥 Age distribution:', ageRes.data);
        console.log('📥 Weekly stats:', statsRes.data);

        if (ageRes.data.status === 'success') {
          const ageData = ageRes.data.data?.map(item => ({
            age: item.age_range,
            count: item.children_count
          })) || [];
          setAgeDistribution(ageData);
        }

        if (statsRes.data.status === 'success') {
          setWeeklyStats(statsRes.data.data);
        }

      } catch (error) {
        console.error('❌ Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedDoctorId]);

  // ✅ Fetch weekly stats when doctor changes
  useEffect(() => {
    if (!selectedDoctorId) return;
    
    const fetchDoctorStats = async () => {
      try {
        const response = await api.get(`/reports/${selectedDoctorId}/weekly-stats`);
        if (response.data.status === 'success') {
          setWeeklyStats(response.data.data);
        }
      } catch (error) {
        console.error('❌ Error fetching doctor stats:', error);
      }
    };

    fetchDoctorStats();
  }, [selectedDoctorId]);

  // ✅ تحويل الأطباء لـ format تبع react-select
  const doctorOptions = doctorsList.map(doc => ({
    value: doc.id,
    label: doc.name
  }));

  // ✅ الـ selected option
  const selectedOption = doctorOptions.find(opt => opt.value === selectedDoctorId) || doctorOptions[0];

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading statistics...</div>
      </motion.div>
    );
  }

  // ✅ Transform weekly stats for radar chart
  const getDoctorPerformance = () => {
    if (!weeklyStats) return [];
    
    return [
      { 
        subject: 'Appointments', 
        A: Math.min((weeklyStats.weekly_appointments / 50) * 100, 100), 
        fullMark: 100 
      },
      { 
        subject: 'Patients', 
        A: Math.min((weeklyStats.weekly_patients / 30) * 100, 100), 
        fullMark: 100 
      },
      { 
        subject: 'Hours', 
        A: Math.min((weeklyStats.weekly_working_hours / 40) * 100, 100), 
        fullMark: 100 
      },
      { 
        subject: 'Experience', 
        A: Math.min((weeklyStats.experience_years / 15) * 100, 100), 
        fullMark: 100 
      },
    ];
  };

  // Static data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 180000, expenses: 120000 },
    { month: 'Feb', revenue: 195000, expenses: 125000 },
    { month: 'Mar', revenue: 220000, expenses: 130000 },
    { month: 'Apr', revenue: 210000, expenses: 128000 },
    { month: 'May', revenue: 250000, expenses: 135000 },
    { month: 'Jun', revenue: 235000, expenses: 132000 },
  ];

  const departmentDistribution = [
    { name: 'Pediatrics', value: 450, color: '#4FC3F7' },
    { name: 'Dentistry', value: 280, color: '#EF5350' },
    { name: 'Psychiatry', value: 150, color: '#AB47BC' },
    { name: 'Vaccination', value: 220, color: '#66BB6A' },
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

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      {/* Manager Insight Cards */}
      <motion.div className="manager-insights-grid" variants={itemVariants}>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E8F5E9', color: '#66BB6A' }}>
            <i className="fa-solid fa-door-open"></i>
          </div>
          <div className="insight-content">
            <h4>Weekly Appointments</h4>
            <p className="insight-value">{weeklyStats?.weekly_appointments || 0}</p>
            <small>This week's total</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#E1F5FE', color: '#4FC3F7' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="insight-content">
            <h4>Weekly Patients</h4>
            <p className="insight-value">{weeklyStats?.weekly_patients || 0}</p>
            <small>Unique patients this week</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FFF3E0', color: '#FF9800' }}>
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="insight-content">
            <h4>Working Hours</h4>
            <p className="insight-value">{weeklyStats?.weekly_working_hours || 0}h</p>
            <small>This week's total</small>
          </div>
        </motion.div>
        <motion.div className="insight-card" whileHover={{ y: -3 }}>
          <div className="insight-icon" style={{ background: '#FCE4EC', color: '#EC407A' }}>
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="insight-content">
            <h4>Experience</h4>
            <p className="insight-value">{weeklyStats?.experience_years || 0} yrs</p>
            <small>Years of experience</small>
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
            
            {/* ✅ react-select بدل الـ select العادي */}
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
                  '&:hover': {
                    borderColor: '#4FC3F7',
                  },
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
                  '&:active': {
                    backgroundColor: '#4FC3F7',
                  },
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
                Appointments: {weeklyStats.weekly_appointments} | 
                Patients: {weeklyStats.weekly_patients}
              </p>
              <small>
                Week: {weeklyStats.week_range?.start_saturday} to {weeklyStats.week_range?.end_thursday}
              </small>
            </div>
          )}
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
};

export default StatisticsTab;