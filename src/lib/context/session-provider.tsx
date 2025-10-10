"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getApiClient } from "../api/client";
import { getAccessToken, setAuthTokens, clearAuthTokens } from "../api/auth";
import { User, Tokens } from "kairos-api-client-ts";

export interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SessionActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

type SessionContextType = SessionState & SessionActions;

const SessionContext = createContext<SessionContextType | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<SessionState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const token = getAccessToken(); // Use getAccessToken

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // getApiClient() provides the client with interceptors.
      // If the token is expired, the interceptor will try to refresh it.
      // If refresh fails, an error will be thrown and caught below.
      const apiClient = getApiClient();
      const userResponse =
        await apiClient.users.getCurrentUserApiV1UsersMeGet();

      setState({
        user: userResponse.data,
        token: getAccessToken(), // Get the (potentially refreshed) token
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // This catch block will run if the initial token is invalid AND refreshing fails.
      console.error("Session initialization failed:", error);
      clearAuthTokens();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired. Please log in again.",
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const apiClient = getApiClient();
      const authResponse = await apiClient.auth.loginApiV1AuthTokenPost(
        credentials.email,
        credentials.password,
        "password"
      );

      const { access_token, refresh_token } = authResponse.data as Tokens;

      if (!access_token || !refresh_token) {
        throw new Error("Login response did not include tokens.");
      }

      // Store both tokens using our new function
      setAuthTokens(access_token, refresh_token);

      // Get user details (will use the new access token via the interceptor)
      const userResponse =
        await apiClient.users.getCurrentUserApiV1UsersMeGet();

      setState({
        user: userResponse.data,
        token: access_token, // Store the access token in the session state
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = "Login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    clearAuthTokens(); // Use the new function to clear both tokens
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!state.isAuthenticated) return;

      const apiClient = getApiClient();
      const userResponse =
        await apiClient.users.getCurrentUserApiV1UsersMeGet();

      setState((prev) => ({
        ...prev,
        user: userResponse.data,
        token: getAccessToken(), // Update token in case it was refreshed
        error: null,
      }));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to refresh user data",
      }));
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const value: SessionContextType = {
    ...state,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
