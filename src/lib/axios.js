import axios from 'axios';
import { API_ROUTES } from './routes';
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveTokensFromPayload,
} from './tokenStorage';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseURL = import.meta.env.PROD ? '/api' : (configuredBaseUrl || '/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    // Prevents interceptor from reloading the page when a user types a wrong password or fails registration
    if ((originalRequest.url?.includes(API_ROUTES.auth.login) || originalRequest.url?.includes(API_ROUTES.auth.register)) && originalRequest.method === 'post') {
        return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes(API_ROUTES.auth.refresh);

    const errorMessage = error.response?.data?.detail || "";

    const publicPages = [API_ROUTES.auth.login, API_ROUTES.auth.register];
    const isPublicPage = typeof window !== 'undefined' && publicPages.includes(window.location.pathname);

    // 2. Instantly handle revoked sessions (Do NOT try to refresh)
    if (error.response?.status === 401 && errorMessage.includes("revoked")) {
      console.warn("Session revoked by another device. Logging out.");
      
      if (typeof window !== 'undefined') {
          clearAuthTokens();
          // SAFETY CHECK: Only redirect if NOT already on a public page
          if (!isPublicPage) {
              window.location.href = API_ROUTES.auth.login;
          }
      }
      return Promise.reject(error);
    }

    // General token expiration handling
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const refreshRes = await api.post(
            API_ROUTES.auth.refresh,
            { refresh_token: refreshToken }
          );

          saveTokensFromPayload(refreshRes?.data);

          const latestAccessToken = getAccessToken();
          if (latestAccessToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${latestAccessToken}`;
          }

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          if (typeof window !== 'undefined') {
              clearAuthTokens();
              //Only redirect if NOT already on a public page
              if (!isPublicPage) {
                  window.location.href = API_ROUTES.auth.login;
              }
          }
          return Promise.reject(refreshError);
        }
      } else {
        // If there is no refresh token, they aren't on a public page, send them to login
        if (typeof window !== 'undefined' && !isPublicPage) {
            clearAuthTokens();
            window.location.href = API_ROUTES.auth.login;
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;