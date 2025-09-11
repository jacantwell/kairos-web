"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/api/hooks/use-auth";
import { LoadingScreen } from "@/lib/components/ui/loading";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = <LoadingScreen />,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isLoading } = useAuth(redirectTo);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
