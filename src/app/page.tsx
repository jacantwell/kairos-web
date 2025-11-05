"use client";

import { useSession } from "@/lib/context/session-provider";
import { LoadingScreen } from "@/lib/components/ui/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/home");
      } else {
        router.push("/welcome");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while session is being initialized or during redirect
  return <LoadingScreen />;
}
