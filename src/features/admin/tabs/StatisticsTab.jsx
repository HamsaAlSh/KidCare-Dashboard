import React from 'react';
import { motion } from 'framer-motion';

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

// Inline data (same as original)
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

const departmentCapacity = [
  { name: 'Pediatrics', current: 450, max: 500, available: 50, extraAppointments: 25 },
  { name: 'Dentistry', current: 280, max: 300, available: 20, extraAppointments: 10 },
  { name: 'Psychiatry', current: 150, max: 200, available: 50, extraAppointments: 20 },
  { name: 'Vaccination', current: 220, max: 280, available: 60, extraAppointments: 15 },
];

const ageDistribution = [
  { age: '0-1', count: 320 },
  { age: '1-2', count: 280 },
  { age: '2-3', count: 220 },
  { age: '3-4', count: 180 },
  { age: '4-5', count: 150 },
  { age: '5-6', count: 98 },
];

// Inline chart components (same as original)
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

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

const StatisticsTab = ({ selectedDoctorId, setSelectedDoctorId, doctorsData }) => (
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

        {/* Doctor Performance based on real data only */}
        {(() => {
          const selectedDoctor = doctorsData.find(d => d.id === selectedDoctorId);
          const dynamicPerformance = [
            { subject: 'Patients', A: Math.min((selectedDoctor.patients / 200) * 100, 100), fullMark: 100 },
            { subject: 'Experience', A: Math.min((selectedDoctor.experience / 15) * 100, 100), fullMark: 100 },
            { subject: 'Availability', A: selectedDoctor.status === 'active' ? 90 : selectedDoctor.status === 'busy' ? 60 : 30, fullMark: 100 },
          ];
          return <CreativeRadarChart data={dynamicPerformance} />;
        })()}

        <div className="selected-doctor-info">
          <p>
            <strong>{doctorsData.find(d => d.id === selectedDoctorId).name}</strong> | 
            Patients: {doctorsData.find(d => d.id === selectedDoctorId).patients} | 
            Status: {doctorsData.find(d => d.id === selectedDoctorId).status} | 
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

export default StatisticsTab;