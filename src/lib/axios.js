import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8000', 
  withCredentials: true, // MANDATORY: Allows the browser to send/receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Check if the error is 401 and not already a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // 3. Call your refresh endpoint
          await axios.post(
            'http://localhost:8000/login/refresh', 
            { refresh_token: refreshToken },
            { withCredentials: true }
          );

          // 4. Retry original request
          return api(originalRequest);
        } catch (refreshError) {

          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Do NOT use window.location.href here to avoid the infinite loop.
        // Let the ProtectedRoute or AuthContext handle the redirection.
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;