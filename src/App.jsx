import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';

function App() {
 
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app">
      {}
      {!user ? (
        <LoginPage />
      ) : (
        
        <div className="main-container">
          {user.role === 'admin' ? (
          
            <AdminDashboard />
          ) : (
            
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Public Sans' }}>
              <h1>Welcome, {user.name}</h1>
              <p>Role: {user.role}</p>
              <p>Reception Dashboard is coming soon...</p>
              <button 
                onClick={logout} 
                style={{
                  padding: '10px 20px', 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;