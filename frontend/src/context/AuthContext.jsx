import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sasa_user')); }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('sasa_token', data.token);
    localStorage.setItem('sasa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await registerApi({ name, email, password });
    localStorage.setItem('sasa_token', data.token);
    localStorage.setItem('sasa_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sasa_token');
    localStorage.removeItem('sasa_user');
    setUser(null);
  }, []);

  // Called after profile update to refresh in-memory user
  const refreshUser = useCallback((updatedUser) => {
    localStorage.setItem('sasa_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, refreshUser,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
