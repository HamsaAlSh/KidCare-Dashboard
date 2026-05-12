import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
  // استخدام useContext لمعرفة حالة المستخدم الحالية
  const { user } = useContext(AuthContext);

  return (
    <div className="app">
      {/* إذا لم يكن هناك مستخدم مسجل، اعرض صفحة تسجيل الدخول */}
      {!user ? (
        <LoginPage />
      ) : (
        // هنا سنعرض الداشبورد لاحقاً بناءً على الرتبة
        <div style={{ padding: '20px' }}>
          <h1>Welcome, {user.name}</h1>
          <p>Role: {user.role}</p>
          <button onClick={() => window.location.reload()}>Logout (Reload for now)</button>
        </div>
      )}
    </div>
  );
}

export default App;