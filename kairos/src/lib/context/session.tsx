"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getApiClient, createServerApiClient } from "../api/client";
import { getAuthToken, setAuthToken, clearAuthToken } from "../api/auth";
import { User } from "@jacantwell/kairos-api-client-ts";

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
      const token = getAuthToken();

      if (!token) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
        return;
      }

      // Validate token and get user info
      const apiClient = getApiClient();
      const userResponse =
        await apiClient.users.getCurrentUserApiV1UsersMeGet();

      setState({
        user: userResponse.data,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Token might be invalid/expired
      console.error("Session initialization failed:", error);
      clearAuthToken();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: "Session expired",
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
        "password",
      );

      if (!authResponse.data.access_token) {
        throw new Error("No token received");
      }

      // Store token
      setAuthToken(authResponse.data.access_token);

      // Get user details
      const userResponse =
        await apiClient.users.getCurrentUserApiV1UsersMeGet();

      setState({
        user: userResponse.data,
        token: authResponse.data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Login failed",
      }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Clear state
      clearAuthToken();
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
        error: null,
      }));
    } catch (error: any) {
      console.error("Failed to refresh user:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to refresh user data",
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
