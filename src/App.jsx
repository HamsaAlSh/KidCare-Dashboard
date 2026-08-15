import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
import ReceptionDashboard from './features/reception/pages/ReceptionDashboard.jsx';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app">
      {!user ? (
        <LoginPage />
      ) : (
        <div className="main-container">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : user.role === 'reception' ? (
            
            <ReceptionDashboard />
          ) : (
            
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Public Sans' }}>
              <h1>Welcome, {user.name}</h1>
              <p>Role: {user.role}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;