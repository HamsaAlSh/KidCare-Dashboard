import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateInsights = (doctorsData = [], departmentsData = [], ageDistribution = [], revenueData = [], weeklyAppointments = []) => {
  const insights = [];
  
  if (departmentsData && departmentsData.length > 0) {
    departmentsData.forEach(dept => {
      const occupancyPercent = (dept.patients / dept.capacity) * 100;
      
      if (occupancyPercent >= 90) {
        insights.push({
          id: `dept-critical-${dept.id}`,
          type: 'critical',
          icon: 'fa-triangle-exclamation',
          color: '#EF5350',
          title: `${dept.name} at Critical Capacity`,
          message: `${Math.round(occupancyPercent)}% occupied. Immediate action needed.`,
          recommendation: `Hire ${Math.ceil((dept.patients - dept.capacity * 0.8) / 50)} more doctors or expand rooms.`,
          department: dept.name,
          priority: 'high'
        });
      } else if (occupancyPercent >= 75) {
        insights.push({
          id: `dept-warning-${dept.id}`,
          type: 'warning',
          icon: 'fa-circle-exclamation',
          color: '#FF9800',
          title: `${dept.name} Near Full Capacity`,
          message: `${Math.round(occupancyPercent)}% occupied. Plan ahead.`,
          recommendation: `Consider opening an extra room or hiring soon.`,
          department: dept.name,
          priority: 'medium'
        });
      }
    });
  }

  if (doctorsData && doctorsData.length > 0) {
    const bestDoctor = doctorsData.reduce((best, doc) => 
      (doc.patients > best.patients ? doc : best), doctorsData[0]);
    
    if (bestDoctor && bestDoctor.name) {
      insights.push({
        id: `doctor-top-${bestDoctor.id}`,
        type: 'success',
        icon: 'fa-trophy',
        color: '#66BB6A',
        title: `Top Performer: ${bestDoctor.name}`,
        message: `${bestDoctor.patients || 0} patients served. Rating: ${bestDoctor.rating || 0}/5`,
        recommendation: 'Consider promotion or mentorship role for new doctors.',
        doctor: bestDoctor.name,
        priority: 'low'
      });
    }
  }

  if (revenueData && revenueData.length > 0) {
    const latest = revenueData[revenueData.length - 1];
    const profit = latest.revenue - latest.expenses;
    const profitMargin = latest.revenue > 0 ? (profit / latest.revenue) * 100 : 0;
    
    if (profitMargin < 15) {
      insights.push({
        id: 'profit-margin-low',
        type: 'critical',
        icon: 'fa-chart-line',
        color: '#EF5350',
        title: 'Profit Margin Declining',
        message: `Current profit margin is ${profitMargin.toFixed(1)}%.`,
        recommendation: 'Review expenses and consider increasing service fees or reducing operational costs.',
        priority: 'high'
      });
    } else if (profitMargin > 40) {
      insights.push({
        id: 'profit-margin-high',
        type: 'success',
        icon: 'fa-sack-dollar',
        color: '#66BB6A',
        title: 'Excellent Profit Margin',
        message: `Current profit margin is ${profitMargin.toFixed(1)}%.`,
        recommendation: 'Consider investing in new equipment or expanding services.',
        priority: 'low'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    doctorsData.forEach(doc => {
      const avgScore = ((doc.appointments || 0) + (doc.patients || 0) + (doc.experience || 0) + (doc.rating || 0)) / 4;
      if (avgScore < 3 && (doc.patients || 0) > 0) {
        insights.push({
          id: `doctor-low-${doc.id}`,
          type: 'warning',
          icon: 'fa-user-doctor',
          color: '#FF9800',
          title: `${doc.name} Performance Below Average`,
          message: `Overall performance score: ${avgScore.toFixed(1)}/5 across appointments, patients, and ratings.`,
          recommendation: 'Schedule a performance review and provide additional training or support.',
          priority: 'medium'
        });
      }
    });
  }

  if (departmentsData && departmentsData.length > 1) {
    const largest = departmentsData.reduce((max, d) => (d.patients || 0) > (max.patients || 0) ? d : max);
    const smallest = departmentsData.reduce((min, d) => (d.patients || 0) < (min.patients || 0) ? d : min);
    const imbalance = (smallest.patients || 1) > 0 ? (largest.patients || 0) / (smallest.patients || 1) : 0;
    
    if (imbalance > 3 && (smallest.patients || 0) > 0) {
      insights.push({
        id: 'dept-imbalance',
        type: 'warning',
        icon: 'fa-scale-unbalanced',
        color: '#AB47BC',
        title: 'Severe Department Load Imbalance',
        message: `${largest.name} has ${Math.round(imbalance)}x more patients than ${smallest.name}.`,
        recommendation: 'Redistribute patients or reallocate doctors to balance workload.',
        priority: 'high'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    const totalHours = doctorsData.reduce((sum, d) => sum + (d.workingHours || 0), 0);
    const activeDoctors = doctorsData.filter(d => d.status === 'active').length;
    const avgHours = activeDoctors > 0 ? totalHours / activeDoctors : 0;
    
    if (avgHours > 50) {
      insights.push({
        id: 'overtime-warning',
        type: 'critical',
        icon: 'fa-clock',
        color: '#EF5350',
        title: 'Doctors Working Excessive Hours',
        message: `Average ${avgHours.toFixed(1)} hours per doctor this week.`,
        recommendation: 'Hire additional staff immediately to prevent burnout and maintain care quality.',
        priority: 'high'
      });
    } else if (avgHours > 0 && avgHours < 20) {
      insights.push({
        id: 'underutilized',
        type: 'info',
        icon: 'fa-chair',
        color: '#4FC3F7',
        title: 'Doctors Underutilized',
        message: `Average ${avgHours.toFixed(1)} hours per doctor only.`,
        recommendation: 'Consider increasing appointments or reducing staff to cut costs.',
        priority: 'low'
      });
    }
  }

  if (ageDistribution && ageDistribution.length > 0) {
    const totalAll = ageDistribution.reduce((sum, g) => sum + (g.count || 0), 0);
    
    if (totalAll > 0) {
      const youngGroups = ageDistribution.filter(g => {
        const maxAge = parseInt(g.range?.split('-')[1] || g.range?.split('+')[0] || 0);
        return maxAge <= 3;
      });
      const totalYoung = youngGroups.reduce((sum, g) => sum + (g.count || 0), 0);
      const youngPercent = (totalYoung / totalAll) * 100;
      
      if (youngPercent > 60) {
        insights.push({
          id: 'age-young-majority',
          type: 'info',
          icon: 'fa-baby',
          color: '#4FC3F7',
          title: 'Young Patients Majority',
          message: `${Math.round(youngPercent)}% of patients are under 3 years old.`,
          recommendation: 'Invest in infant-friendly equipment, toys, and waiting area.',
          priority: 'medium'
        });
      }
      
      const maxGroup = ageDistribution.reduce((max, g) => (g.count || 0) > (max.count || 0) ? g : max);
      if ((maxGroup.count || 0) > totalAll * 0.4) {
        insights.push({
          id: `age-spike-${maxGroup.range}`,
          type: 'info',
          icon: 'fa-child',
          color: '#4FC3F7',
          title: `High Demand: Ages ${maxGroup.range}`,
          message: `${Math.round((maxGroup.count / totalAll) * 100)}% of patients are in this age group.`,
          recommendation: `Ensure adequate specialized resources for ${maxGroup.range} year olds.`,
          priority: 'low'
        });
      }
    }
  }

  if (weeklyAppointments && weeklyAppointments.length === 7) {
    const totalWeekly = weeklyAppointments.reduce((a, b) => (a || 0) + (b || 0), 0);
    const avgDaily = totalWeekly / 7;
    
    const weekendTotal = (weeklyAppointments[0] || 0) + (weeklyAppointments[6] || 0);
    if (weekendTotal === 0 && totalWeekly > 0) {
      insights.push({
        id: 'weekend-gap',
        type: 'info',
        icon: 'fa-calendar-xmark',
        color: '#4FC3F7',
        title: 'No Weekend Appointments',
        message: 'Zero appointments scheduled on Friday and Saturday.',
        recommendation: 'Consider opening weekend slots to increase revenue and patient accessibility.',
        priority: 'low'
      });
    }
    
    const maxDay = Math.max(...weeklyAppointments.map(v => v || 0));
    const maxDayIndex = weeklyAppointments.indexOf(maxDay);
    const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    if (maxDay > avgDaily * 2 && avgDaily > 0) {
      insights.push({
        id: 'busy-day',
        type: 'warning',
        icon: 'fa-calendar-day',
        color: '#FF9800',
        title: `${dayNames[maxDayIndex]} is Overloaded`,
        message: `${maxDay} appointments on ${dayNames[maxDayIndex]} (${Math.round(maxDay / avgDaily)}x average).`,
        recommendation: 'Add extra staff this day or spread appointments to other days.',
        priority: 'medium'
      });
    }
  }

  if (doctorsData && doctorsData.length > 0) {
    const totalPatients = doctorsData.reduce((sum, d) => sum + (d.patients || 0), 0);
    const activeDoctors = doctorsData.filter(d => d.status === 'active').length;
    const avgPatientsPerDoctor = activeDoctors > 0 ? totalPatients / activeDoctors : 0;
    
    if (avgPatientsPerDoctor > 150) {
      insights.push({
        id: 'doctor-shortage',
        type: 'warning',
        icon: 'fa-user-doctor',
        color: '#AB47BC',
        title: 'Doctor Workload High',
        message: `Average ${Math.round(avgPatientsPerDoctor)} patients per doctor.`,
        recommendation: 'Hire more doctors to balance workload and improve care quality.',
        priority: 'high'
      });
    }
  }

  if (doctorsData && doctorsData.length > 2) {
    const avgExperience = doctorsData.reduce((sum, d) => sum + (d.experience || 0), 0) / doctorsData.length;
    if (avgExperience < 3) {
      insights.push({
        id: 'inexperienced-team',
        type: 'warning',
        icon: 'fa-graduation-cap',
        color: '#FF9800',
        title: 'Team Lacks Experience',
        message: `Average doctor experience is ${avgExperience.toFixed(1)} years only.`,
        recommendation: 'Hire senior doctors or arrange mentorship programs.',
        priority: 'medium'
      });
    }
  }

  return insights;
};

const SmartInsights = ({ 
  isOpen, 
  onClose, 
  doctorsData = [], 
  departmentsData = [], 
  ageDistribution = [],
  revenueData = [],
  weeklyAppointments = [],
  onInsightRead, 
  inlineMode = false 
}) => {
  const [insights, setInsights] = useState([]);
  const isProcessing = useRef(false);
  const prevDataRef = useRef({});

  const updateInsights = useCallback((newInsights) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    setInsights(prev => {
      const merged = newInsights.map(newInsight => {
        const existing = prev.find(p => p.id === newInsight.id);
        return existing ? { ...newInsight, read: existing.read, dismissed: existing.dismissed } : newInsight;
      }).filter(i => !i.dismissed);
      
      const prevString = JSON.stringify(prev);
      const mergedString = JSON.stringify(merged);
      if (prevString !== mergedString) {
        try {
          localStorage.setItem('kidcare_insights', JSON.stringify(merged));
        } catch (e) {
          console.error('localStorage error:', e);
        }
      }
      
      return merged;
    });

    setTimeout(() => {
      isProcessing.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (!doctorsData && !departmentsData) return;
    
    const newInsights = generateInsights(
      doctorsData, 
      departmentsData, 
      ageDistribution,
      revenueData,
      weeklyAppointments
    );

    const dataKey = JSON.stringify({ 
      d: doctorsData?.length, 
      de: departmentsData?.length,
      a: ageDistribution?.length,
      r: revenueData?.length,
      w: weeklyAppointments?.length 
    });
    
    if (prevDataRef.current.key === dataKey) return;
    prevDataRef.current.key = dataKey;

    updateInsights(newInsights);
  }, [doctorsData, departmentsData, ageDistribution, revenueData, weeklyAppointments, updateInsights]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kidcare_insights' && e.newValue) {
        try {
          const saved = JSON.parse(e.newValue);
          setInsights(saved.filter(i => !i.dismissed));
        } catch (err) {
          console.error('Parse error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsRead = useCallback((id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, read: true } : i);
      try {
        localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      } catch (e) {
        console.error('localStorage error:', e);
      }
      return updated;
    });
    onInsightRead?.();
  }, [onInsightRead]);

  const dismissInsight = useCallback((id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, dismissed: true } : i).filter(i => !i.dismissed);
      try {
        localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      } catch (e) {
        console.error('localStorage error:', e);
      }
      return updated;
    });
    onInsightRead?.();
  }, [onInsightRead]);

  const unreadCount = insights.filter(i => !i.read).length;

  const getPriorityBadge = (priority) => {
    const colors = {
      high: '#EF5350',
      medium: '#FF9800',
      low: '#66BB6A'
    };
    return colors[priority] || '#90A4AE';
  };

  if (!isOpen && !inlineMode) return null;

  const insightsContent = (
    <>
      <div className="insights-header">
        <div className="insights-title">
          <i className="fa-solid fa-lightbulb"></i>
          <h3>Smart Insights</h3>
          {unreadCount > 0 && (
            <span className="insights-badge">{unreadCount}</span>
          )}
        </div>
        {!inlineMode && (
          <button className="insights-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      <div className="insights-list">
        <AnimatePresence mode="popLayout">
          {insights.length === 0 ? (
            <motion.div 
              className="insights-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <i className="fa-solid fa-check-circle"></i>
              <p>No insights at the moment. Everything looks good!</p>
            </motion.div>
          ) : (
            insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                layout
                className={`insight-card ${insight.read ? 'read' : 'unread'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="insight-priority" style={{ background: getPriorityBadge(insight.priority) }}></div>
                
                <div className="insight-icon" style={{ background: `${insight.color}15`, color: insight.color }}>
                  <i className={`fa-solid ${insight.icon}`}></i>
                </div>
                
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p className="insight-message">{insight.message}</p>
                  <div className="insight-recommendation">
                    <i className="fa-solid fa-arrow-right"></i>
                    <span>{insight.recommendation}</span>
                  </div>
                </div>
                
                <div className="insight-actions">
                  {!insight.read && (
                    <motion.button
                      className="insight-btn read"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markAsRead(insight.id)}
                    >
                      <i className="fa-solid fa-check"></i>
                      Mark Read
                    </motion.button>
                  )}
                  <motion.button
                    className="insight-btn dismiss"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dismissInsight(insight.id)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                    Dismiss
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </>
  );

  if (inlineMode) {
    return (
      <div className="insights-inline">
        {insightsContent}
      </div>
    );
  }

  return (
    <motion.div
      className="insights-panel"
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {insightsContent}
    </motion.div>
  );
};

export default SmartInsights;