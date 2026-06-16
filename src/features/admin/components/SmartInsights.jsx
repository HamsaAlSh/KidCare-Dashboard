import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const generateInsights = (doctorsData, departmentsData) => {
  const insights = [];
  
  // 1. Department capacity insights
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

  // 2. Best doctor insight
  if (doctorsData.length > 0) {
    const bestDoctor = doctorsData.reduce((best, doc) => 
      (doc.patients > best.patients ? doc : best), doctorsData[0]);
    
    insights.push({
      id: `doctor-top-${bestDoctor.id}`,
      type: 'success',
      icon: 'fa-trophy',
      color: '#66BB6A',
      title: `Top Performer: ${bestDoctor.name}`,
      message: `${bestDoctor.patients} patients served. Rating: ${bestDoctor.rating}/5`,
      recommendation: 'Consider promotion or mentorship role for new doctors.',
      doctor: bestDoctor.name,
      priority: 'low'
    });
  }

  // 3. Age distribution insight (from StatisticsTab data)
  const ageGroups = [
    { range: '0-1', count: 320 },
    { range: '1-2', count: 280 },
    { range: '2-3', count: 220 },
  ];
  
  const totalYoung = ageGroups.reduce((sum, g) => sum + g.count, 0);
  const youngPercent = (totalYoung / (totalYoung + 448)) * 100; // 448 is rest
  
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

  // 4. Doctor shortage insight
  const activeDoctors = doctorsData.filter(d => d.status === 'active').length;
  const totalPatients = doctorsData.reduce((sum, d) => sum + d.patients, 0);
  const avgPatientsPerDoctor = totalPatients / (activeDoctors || 1);
  
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

  return insights;
};

const SmartInsights = ({ isOpen, onClose, doctorsData, departmentsData, onInsightRead, inlineMode = false }) => {
  const [insights, setInsights] = useState(() => {
    const saved = localStorage.getItem('kidcare_insights');
    return saved ? JSON.parse(saved) : [];
  });

  // يولد insights جديدة لما تتغير البيانات
  useEffect(() => {
    const newInsights = generateInsights(doctorsData, departmentsData);
    
    setInsights(prev => {
      const merged = newInsights.map(newInsight => {
        const existing = prev.find(p => p.id === newInsight.id);
        return existing ? { ...newInsight, read: existing.read, dismissed: existing.dismissed } : newInsight;
      }).filter(i => !i.dismissed);
      
      localStorage.setItem('kidcare_insights', JSON.stringify(merged));
      return merged;
    });
  }, [doctorsData, departmentsData]);

  // يسمع التغييرات من localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kidcare_insights') {
        const saved = e.newValue ? JSON.parse(e.newValue) : [];
        setInsights(saved.filter(i => !i.dismissed));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsRead = (id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, read: true } : i);
      localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      // أرسل حدث للكل يعرف
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kidcare_insights',
        newValue: JSON.stringify(updated)
      }));
      return updated;
    });
    onInsightRead?.();
  };

  const dismissInsight = (id) => {
    setInsights(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, dismissed: true } : i).filter(i => !i.dismissed);
      localStorage.setItem('kidcare_insights', JSON.stringify(updated));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'kidcare_insights',
        newValue: JSON.stringify(updated)
      }));
      return updated;
    });
    onInsightRead?.();
  };

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