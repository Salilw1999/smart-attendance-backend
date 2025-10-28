import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post(
        '/api/auth/login',
        { username, password },
        { withCredentials: true }
      );

      const userData = response.data.user || response.data;
      setUser(userData);

      return { success: true };
    } catch (error) {
      setUser(null);
      return { success: false, error: "Invalid username or password" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
