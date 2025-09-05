"use client";

import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = (redirectTo: string = "/login") => {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
};
