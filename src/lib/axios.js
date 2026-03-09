import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL , // Use environment variable or fallback to localhost
  withCredentials: true, // MANDATORY: Allows the browser to send/receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevents interceptor from reloading the page when a user types a wrong password or fails registration
    if ((originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) && originalRequest.method === 'post') {
        return Promise.reject(error);
    }

    const errorMessage = error.response?.data?.detail || "";

    const publicPages = ['/login', '/register'];
    const isPublicPage = typeof window !== 'undefined' && publicPages.includes(window.location.pathname);

    // 2. Instantly handle revoked sessions (Do NOT try to refresh)
    if (error.response?.status === 401 && errorMessage.includes("revoked")) {
      console.warn("Session revoked by another device. Logging out.");
      
      if (typeof window !== 'undefined') {
          localStorage.removeItem('refresh_token');
          // SAFETY CHECK: Only redirect if NOT already on a public page
          if (!isPublicPage) {
              window.location.href = '/login';
          }
      }
      return Promise.reject(error);
    }

    // General token expiration handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (refreshToken) {
        try {
          await api.post(
            '/login/refresh',
            { refresh_token: refreshToken },
            { withCredentials: true }
          );

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
              localStorage.removeItem('refresh_token');
              //Only redirect if NOT already on a public page
              if (!isPublicPage) {
                  window.location.href = '/login';
              }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // If there is no refresh token, they aren't on a public page, send them to login
        if (typeof window !== 'undefined' && !isPublicPage) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;