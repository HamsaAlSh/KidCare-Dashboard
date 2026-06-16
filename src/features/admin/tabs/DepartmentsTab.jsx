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

// Inline departments data (same as original)
const staticDepartmentsData = [
  { id: 1, name: 'Pediatrics', head: 'Dr. Mohammed Ali', doctors: 12, patients: 450, capacity: 500, occupancy: 90, color: '#4FC3F7' },
  { id: 2, name: 'Dentistry', head: 'Dr. Fatima Hassan', doctors: 8, patients: 280, capacity: 300, occupancy: 93, color: '#EF5350' },
  { id: 3, name: 'Psychiatry', head: 'Dr. Layla Omar', doctors: 6, patients: 150, capacity: 200, occupancy: 75, color: '#AB47BC' },
  { id: 5, name: 'Vaccination', head: 'Dr. Ahmed Khalid', doctors: 7, patients: 220, capacity: 280, occupancy: 79, color: '#66BB6A' },
];

// Inline DonutChart (same as original)
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const DonutChart = ({ percentage, color, label }) => (
  <div className="donut-chart-container">
    <ResponsiveContainer width={140} height={140}>
      <PieChart>
        <Pie
          data={[{ value: percentage }, { value: 100 - percentage }]}
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={60}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          animationDuration={1500}
        >
          <Cell fill={color} />
          <Cell fill="rgba(79,195,247,0.1)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="donut-label">
      <span className="donut-percentage">{percentage}%</span>
      <span className="donut-text">{label}</span>
    </div>
  </div>
);

const DepartmentsTab = () => (
  <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
    <motion.div className="departments-grid" variants={itemVariants}>
      {staticDepartmentsData.map((dept, index) => (
        <motion.div key={dept.id} className="department-card" variants={itemVariants}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
          whileHover={{ y: -5, boxShadow: `0 15px 40px ${dept.color}20` }}
        >
          <div className="dept-header" style={{ borderBottom: `3px solid ${dept.color}` }}>
            <div className="dept-icon" style={{ background: `${dept.color}20`, color: dept.color }}>
              <i className="fa-solid fa-hospital"></i>
            </div>
            <div className="dept-info">
              <h4>{dept.name}</h4>
              <p>Head: {dept.head}</p>
            </div>
          </div>
          <div className="dept-stats">
            <div className="dept-stat"><i className="fa-solid fa-user-doctor"></i><span>{dept.doctors} Doctors</span></div>
            <div className="dept-stat"><i className="fa-solid fa-users"></i><span>{dept.patients} Patients</span></div>
            <div className="dept-stat"><i className="fa-solid fa-bed"></i><span>{dept.capacity} Capacity</span></div>
          </div>
          <div className="dept-occupancy">
            <div className="occupancy-header"><span>Occupancy</span><span style={{ color: dept.color }}>{dept.occupancy}%</span></div>
            <div className="progress-bar-kidcare">
              <motion.div className="progress-fill" style={{ background: dept.color }}
                initial={{ width: 0 }} animate={{ width: `${dept.occupancy}%` }} transition={{ duration: 1.2, delay: 0.3 }}
              />
            </div>
          </div>
          <DonutChart percentage={dept.occupancy} color={dept.color} label="Full" />
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);

export default DepartmentsTab;