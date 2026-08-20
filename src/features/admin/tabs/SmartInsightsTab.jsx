import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';
import SmartInsights from "../components/SmartInsights";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SmartInsightsTab = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchAllData = async (signal) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      
      const firstDocRes = await api.get('/doctors?page=1', { signal });
      const firstPageDocs = firstDocRes.data?.data || [];
      const lastPage = firstDocRes.data?.pagination?.last_page || 1;

      let allDoctors = [...firstPageDocs];

      
      if (lastPage > 1) {
        const pagePromises = [];
        for (let page = 2; page <= lastPage; page++) {
          pagePromises.push(api.get(`/doctors?page=${page}`, { signal }));
        }
        const extraResponses = await Promise.all(pagePromises);
        extraResponses.forEach(res => {
          allDoctors = [...allDoctors, ...(res.data?.data || [])];
        });
      }

      const formattedDoctors = allDoctors.map(doc => ({
        id: doc.id,
        name: `Dr. ${doc.full_name}`,
        patients: doc.patients_count || 0,
        appointments: doc.appointments_count || 0,
        experience: doc.experience_years || 0,
        workingHours: doc.weekly_working_hours || 0,
        status: doc.status || 'active',
      }));

      
      const [deptsResponse, ageRes, budgetRes, weeklyRes] = await Promise.all([
        api.get('/departments', { signal }),
        api.get('/reports/children-age-distribution', { signal }),
        api.get('/reports/monthly-budget', { signal }),
        api.get('/reports/appointments-per-weekday', { signal }),
      ]);

      const depts = deptsResponse.data?.data || [];
      const formattedDepts = depts.map(dept => ({
        id: dept.id,
        name: dept.name,
        patients: dept.patients_count || 0,
        capacity: dept.capacity || 100,
      }));

      setDoctorsData(formattedDoctors);
      setDepartmentsData(formattedDepts);

      if (ageRes.data?.status === 'success') {
        setAgeDistribution(ageRes.data.data?.map(item => ({
          range: item.age_range,
          count: item.children_count
        })) || []);
      }

      if (budgetRes.data?.status === 'success') {
        setRevenueData((budgetRes.data.data || []).map(item => ({
          month: item.month_name?.slice(0, 3) || '',
          revenue: item.income_details?.total_income || 0,
          expenses: item.expense_details?.total_expense || 0,
        })));
      }

      if (weeklyRes.data?.status === 'success') {
        const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const weeklyData = weeklyRes.data.data || [];
        const arr = days.map(day => {
          const found = weeklyData.find(d => d.day_name?.slice(0, 3) === day);
          return found ? found.appointments_count : 0;
        });
        setWeeklyAppointments(arr);
      }

    } catch (error) {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error('Error fetching insights data:', error);
        setErrorMsg('Failed to load insights data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAllData(controller.signal);

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
          <p>Loading insights...</p>
        </div>
      </motion.div>
    );
  }

  if (errorMsg) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="error-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ef5350', marginBottom: '15px' }}>{errorMsg}</p>
          <button className="btn-primary" onClick={() => fetchAllData()}>
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants} />

      <SmartInsights 
        isOpen={true}
        onClose={() => {}}
        doctorsData={doctorsData}
        departmentsData={departmentsData}
        ageDistribution={ageDistribution}
        revenueData={revenueData}
        weeklyAppointments={weeklyAppointments}
        inlineMode={true}
      />
    </motion.div>
  );
};

export default SmartInsightsTab;