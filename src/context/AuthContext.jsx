import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('admin_user') || sessionStorage.getItem('reception_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (phoneNumber, password, role) => {
    const endpoint = role === 'admin' 
      ? 'https://kidcare.sy/api/loginAdmin' 
      : 'https://kidcare.sy/api/loginReceptionist';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        const userWithRole = {
          ...data.user,
          role: role
        };
        
        if (role === 'admin') {
          sessionStorage.setItem('admin_token', data.Token);
          sessionStorage.setItem('admin_user', JSON.stringify(userWithRole));
        } else {
          sessionStorage.setItem('reception_token', data.Token);
          sessionStorage.setItem('reception_user', JSON.stringify(userWithRole));
        }
        
        setUser(userWithRole);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Network error or server down' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('reception_token');
    sessionStorage.removeItem('reception_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ لازم يكون موجود في آخر الملف:
export const useAuth = () => useContext(AuthContext);