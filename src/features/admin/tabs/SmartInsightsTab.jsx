import React from 'react';
import { motion } from 'framer-motion';
import SmartInsights from "../components/SmartInsights";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SmartInsightsTab = ({ doctorsData, departmentsData }) => {
  return (
    <motion.div className="page-content" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="page-header" variants={itemVariants}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
          <i className="fa-solid fa-lightbulb" style={{ color: '#4FC3F7', marginRight: '12px' }}></i>
          Smart Insights
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '16px', marginTop: '8px' }}>
         
        </p>
      </motion.div>

      <SmartInsights 
        isOpen={true}
        onClose={() => {}}
        doctorsData={doctorsData}
        departmentsData={departmentsData}
        inlineMode={true}
      />
    </motion.div>
  );
};

export default SmartInsightsTab;