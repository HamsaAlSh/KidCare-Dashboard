import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // التحديث هنا يضمن تخزين الكائن الكامل المستلم من LoginForm
    // userData سيعبر عن { name: '...', role: '...' }
    setUser(userData); 
  };

  const logout = () => {
    // تنظيف حالة المستخدم عند تسجيل الخروج
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};