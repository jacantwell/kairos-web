import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  AuthenticationApi,
  UsersApi,
  JourneysApi,
  DefaultApi,
  Configuration,
  Tokens,
} from "kairos-api-client-ts";
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://7zpmbpgf7d.execute-api.eu-west-2.amazonaws.com";

const axiosInstance = axios.create();

// A flag to prevent multiple concurrent token refresh requests
let isRefreshing = false;
// A queue for requests that failed with 401, to be retried after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor, this injects the access token into every outgoing request.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor, this handles 401 errors by attempting to refresh the token.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If the error is not 401, or there's no original request, reject it.
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Prevent infinite loops if the refresh request itself fails with 401.
    if (originalRequest.url?.includes("/auth/refresh")) {
      console.error("Refresh token is invalid. Logging out.");
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle concurrent requests that fail with 401.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = "Bearer " + token;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      // Use a clean Axios instance for the refresh call to avoid a recursive interceptor loop.
      const refreshClient = axios.create({ baseURL: API_BASE_URL });
      const formData = new FormData();
      formData.append("refresh_token", refreshToken);

      const { data } = await refreshClient.post<Tokens>(
        `/api/v1/auth/refresh`,
        formData
      );

      const { access_token: newAccessToken, refresh_token: newRefreshToken } =
        data;
      setAuthTokens(newAccessToken, newRefreshToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError: any) {
      processQueue(refreshError, null);
      console.error("Failed to refresh token", refreshError);
      clearAuthTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

const config = new Configuration({ basePath: API_BASE_URL });

// Create a unified client object that holds all the API instances.
// Each instance uses the same Axios client with our interceptors.
class ApiClient {
  public auth: AuthenticationApi;
  public users: UsersApi;
  public journeys: JourneysApi;
  public default: DefaultApi;
  public clearAuth: () => void;

  constructor() {
    this.auth = new AuthenticationApi(config, undefined, axiosInstance);
    this.users = new UsersApi(config, undefined, axiosInstance);
    this.journeys = new JourneysApi(config, undefined, axiosInstance);
    this.default = new DefaultApi(config, undefined, axiosInstance);
    this.clearAuth = () => {};
  }
}

let clientInstance: ApiClient | null = null;

export const getApiClient = (): ApiClient => {
  // Client-side: use a singleton pattern to reuse the instance.
  if (!clientInstance) {
    clientInstance = new ApiClient();
  }
  return clientInstance;
};
