import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fras_token');
    if (!token) { setLoading(false); return; }
    client.get('/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('fras_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/login', { email, password });
    localStorage.setItem('fras_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await client.post('/logout');
    localStorage.removeItem('fras_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
