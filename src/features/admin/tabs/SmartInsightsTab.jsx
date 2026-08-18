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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // جلب الأطباء
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

        const formattedDoctors = allDoctors.map(doc => ({
          id: doc.id,
          name: `Dr. ${doc.full_name}`,
          patients: doc.patients_count || 0,
          appointments: doc.appointments_count || 0,
          experience: doc.experience_years || 0,
          workingHours: doc.weekly_working_hours || 0,
          status: doc.status || 'active',
        }));

        setDoctorsData(formattedDoctors);

        // جلب الأقسام
        const deptsResponse = await api.get('/departments');
        const depts = deptsResponse.data?.data || [];
        const formattedDepts = depts.map(dept => ({
          id: dept.id,
          name: dept.name,
          patients: dept.patients_count || 0,
          capacity: dept.capacity || 100,
        }));
        setDepartmentsData(formattedDepts);

        // جلب الإحصائيات
        const [ageRes, budgetRes, weeklyRes] = await Promise.all([
          api.get('/reports/children-age-distribution'),
          api.get('/reports/monthly-budget'),
          api.get('/reports/appointments-per-weekday'),
        ]);

        if (ageRes.data.status === 'success') {
          setAgeDistribution(ageRes.data.data?.map(item => ({
            range: item.age_range,
            count: item.children_count
          })) || []);
        }

        if (budgetRes.data.status === 'success') {
          setRevenueData((budgetRes.data.data || []).map(item => ({
            month: item.month_name?.slice(0, 3) || '',
            revenue: item.income_details?.total_income || 0,
            expenses: item.expense_details?.total_expense || 0,
          })));
        }

        if (weeklyRes.data.status === 'success') {
          const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
          const weeklyData = weeklyRes.data.data || [];
          const arr = days.map(day => {
            const found = weeklyData.find(d => d.day_name?.slice(0, 3) === day);
            return found ? found.appointments_count : 0;
          });
          setWeeklyAppointments(arr);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
        <div className="loading-spinner">Loading insights...</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants}>
      </motion.div>

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