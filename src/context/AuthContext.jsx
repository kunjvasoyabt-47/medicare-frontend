import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data); // Stores { full_name, email, pid, is_admin }
    } catch (err) {
        console.error("Auth check failed", err);
      setUser(null);
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

const logout = async () => {
  try {
    const token = localStorage.getItem('refresh_token');
    await api.post('/auth/logout', { refresh_token: token });
    
  } catch (err) {
    console.error("Logout failed on server, cleaning up locally...", err);
  } finally {
    localStorage.removeItem('refresh_token');
    setUser(null);

    window.location.href = '/login'; 
  }
};

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout }}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-md"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);