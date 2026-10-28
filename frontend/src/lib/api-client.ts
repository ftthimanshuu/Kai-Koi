import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * Standard API error structure following RFC 9457 Problem Details
 * (as specified in SPECIFICATION.md §10)
 */
export interface ApiErrorProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Global token getter function that will be injected by the auth store in Phase 1
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(provider: () => Promise<string | null>) {
  getAuthToken = provider;
}

/**
 * Centralized Axios instance for Kai Koi API (/api/v1)
 */
export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request Interceptor:
 * Attaches Firebase ID token as 'Authorization: Bearer <token>' to every outgoing request.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (getAuthToken) {
      try {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Failed to retrieve auth token for request', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Standardizes error rejection so callers always receive a structured ApiErrorProblem.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorProblem>) => {
    const problem: ApiErrorProblem = error.response?.data || {
      title: error.message || 'Network Error',
      status: error.response?.status || 500,
      code: 'UNKNOWN_ERROR',
      detail: 'An unexpected error occurred while communicating with the server.',
    };
    return Promise.reject(problem);
  }
);
