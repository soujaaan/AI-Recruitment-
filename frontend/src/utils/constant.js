const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE_URL = apiBaseUrl;
export const USER_API_END_POINT = `${apiBaseUrl}/user`;
export const JOB_API_END_POINT = `${apiBaseUrl}/job`;
export const APPLICATION_API_END_POINT = `${apiBaseUrl}/application`;
export const COMPANY_API_END_POINT = `${apiBaseUrl}/api/v1/company`;
export const AI_API_END_POINT = `${apiBaseUrl}/ai`;
export const ADMIN_API_END_POINT = `${apiBaseUrl}/api/admin`;
