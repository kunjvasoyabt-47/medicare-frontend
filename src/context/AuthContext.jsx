import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../lib/axios";
import { API_ROUTES } from "../lib/routes";
import SystemLoader from "../components/SystemLoader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDischarged, setIsDischarged] = useState(false);
  const [isDischargeStatusLoading, setIsDischargeStatusLoading] =
    useState(false);

  const fetchDischargeStatus = useCallback(async (authUser) => {
    if (!authUser || authUser.is_admin) {
      setIsDischarged(false);
      setIsDischargeStatusLoading(false);
      return;
    }

    setIsDischargeStatusLoading(true);
    try {
      const dashboardRes = await api.get(API_ROUTES.patient.dashboard);
      setIsDischarged(Boolean(dashboardRes?.data?.stats?.is_discharged));
    } catch (err) {
      console.error("Failed to fetch discharge status", err);
      setIsDischarged(false);
    } finally {
      setIsDischargeStatusLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get(API_ROUTES.auth.me);
      setUser(res.data);
      await fetchDischargeStatus(res.data);
      return res.data;
    } catch (err) {
      console.error("Auth check failed", err);
      setUser(null);
      setIsDischarged(false);
      setIsDischargeStatusLoading(false);
      localStorage.removeItem("refresh_token");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDischargeStatus]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      const token = localStorage.getItem("refresh_token");
      await api.post(API_ROUTES.auth.logout, { refresh_token: token });
    } catch (err) {
      console.error("Logout failed on server, cleaning up locally...", err);
    } finally {
      localStorage.removeItem("refresh_token");
      setUser(null);
      setIsDischarged(false);
      setIsDischargeStatusLoading(false);

      window.location.href = API_ROUTES.auth.login;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        checkAuth,
        logout,
        isDischarged,
        isDischargeStatusLoading,
      }}
    >
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
