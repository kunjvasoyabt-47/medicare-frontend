import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';
import { API_ROUTES } from '../lib/routes';
import SystemLoader from '../components/SystemLoader';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get(API_ROUTES.auth.me);
      setUser(res.data); 
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
    await api.post(API_ROUTES.auth.logout, { refresh_token: token });
    
  } catch (err) {
    console.error("Logout failed on server, cleaning up locally...", err);
  } finally {
    localStorage.removeItem('refresh_token');
    setUser(null);

    window.location.href = API_ROUTES.auth.login; 
  }
};

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkAuth, logout }}>
      {loading ? (
        <SystemLoader
          fullScreen
          label="Verifying Session"
          sublabel="Checking secure access to your Medicare workspace"
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);