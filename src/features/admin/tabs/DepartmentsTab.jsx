import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer
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

const departmentColors = {
  'Pediatrics': '#4FC3F7',
  'Dentistry': '#EF5350',
  'Psychiatry': '#AB47BC',
  'Vaccination': '#66BB6A',
  'General': '#FFA726',
  'Cardiology': '#42A5F5',
  'Neurology': '#EC407A',
};

const getDepartmentColor = (name) => {
  return departmentColors[name] || '#4FC3F7';
};

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

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/daily-report');
        console.log('Departments data:', response.data);

        if (response.data.status === 'success') {
          setDepartments(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading departments...</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="departments-grid" variants={itemVariants}>
        {departments.map((dept, index) => {
          const color = getDepartmentColor(dept.department_name);
          const occupancy = parseFloat(dept.occupancy_percentage) || 0;

          return (
            <motion.div key={dept.department_id} className="department-card" variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: `0 15px 40px ${color}20` }}
            >
              <div className="dept-header" style={{ borderBottom: `3px solid ${color}` }}>
                <div className="dept-icon" style={{ background: `${color}20`, color: color }}>
                  <i className="fa-solid fa-hospital"></i>
                </div>
                <div className="dept-info">
                  <h4>{dept.department_name}</h4>
                </div>
              </div>
              <div className="dept-stats">
                <div className="dept-stat"><i className="fa-solid fa-user-doctor"></i><span>{dept.doctors} Doctors</span></div>
                <div className="dept-stat"><i className="fa-solid fa-users"></i><span>{dept.patients} Patients</span></div>
                <div className="dept-stat"><i className="fa-solid fa-bed"></i><span>{dept.max_available_slots} Slots</span></div>
              </div>
              <div className="dept-occupancy">
                <div className="occupancy-header"><span>Occupancy</span><span style={{ color: color }}>{dept.occupancy_percentage}</span></div>
                <div className="progress-bar-kidcare">
                  <motion.div className="progress-fill" style={{ background: color }}
                    initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </div>
              </div>
              <DonutChart percentage={occupancy} color={color} label="Full" />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default DepartmentsTab;