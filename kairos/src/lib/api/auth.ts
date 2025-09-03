import { getApiClient } from "./client";
const ACCESS_TOKEN_KEY = "kairos_access_token";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);

  // Update existing client
  const client = getApiClient();
  client.updateToken(token);
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);

  // Clear client auth
  const client = getApiClient();
  client.clearAuth();
};
