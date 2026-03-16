export const API_ROUTES = {
  auth: {
    login: "/login",
    register: "/register",
    refresh: "/login/refresh",
    me: "/auth/me",
    logout: "/auth/logout",
  },
  admin: {
    dashboard: "/admin/dashboard",
    patients: "/admin/patients",
    patientById: (patientId) => `/admin/patients/${patientId}`,
    dischargeHistory: "/admin/discharge-history",
    dischargeDocuments: (dischargeId) => `/admin/discharge/${dischargeId}/documents`,
    dischargePdfs: (dischargeId) => `/admin/discharge/${dischargeId}/pdfs`,
  },
  patient: {
    dashboard: "/patient/dashboard",
    profile: "/patient/profile",
    dischargeHistory: "/patient/discharge-history",
    dischargeDocuments: (dischargeId) => `/patient/discharge/${dischargeId}/documents`,
    dischargePdfs: (dischargeId) => `/patient/discharge/${dischargeId}/pdfs`,
    patientFriendlyReport: (patientId) => `/api/patient-friendly-report/convert-pdf/${patientId}`,
    generateInsuranceReadyDoc: (patientId) => `/api/patient/${patientId}/generate-ird`,
  },
  discharge: {
    status: (dischargeId) => `/api/discharge/${dischargeId}/status`,
    process: "/api/discharge/process",
    retry: (dischargeId) => `/api/discharge/${dischargeId}/retry`,
    remove: (dischargeId) => `/api/discharge/${dischargeId}`,
  },
};
