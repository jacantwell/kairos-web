import { getApiClient } from "./client";

const ACCESS_TOKEN_KEY = "kairos_access_token";
const REFRESH_TOKEN_KEY = "kairos_refresh_token";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setAuthTokens = (
  accessToken: string,
  refreshToken: string
): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  
  // You might not need the client-side clearAuth anymore, but it doesn't hurt.
  const client = getApiClient();
  if (client.clearAuth) {
    client.clearAuth();
  }
};