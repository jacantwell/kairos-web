// kairos/src/lib/hooks/use-active-journey.ts
"use client";

import { useState, useEffect } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";

export function useActiveJourney() {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  const { user } = useSession();

  const loadActiveJourney = async () => {
    if (!user?._id) {
      setActiveJourney(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get user's journeys and find the active one
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      console.log(response)
      if (response.data && Array.isArray(response.data)) {
        const activeTrip = response.data.find((journey: Journey) => journey.active);
        setActiveJourney(activeTrip || null);
      } else {
        setActiveJourney(null);
      }
    } catch (err: any) {
      console.error("Failed to load active journey:", err);
      setError(err.message || "Failed to load active journey");
      setActiveJourney(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load active journey when user changes
  useEffect(() => {
    loadActiveJourney();
  }, [user?._id]);

  // Function to refresh the active journey (useful when journeys change)
  const refreshActiveJourney = () => {
    loadActiveJourney();
  };

  // Function to set a journey as active (optimistic update)
  const setAsActive = (journey: Journey) => {
    setActiveJourney(journey);
  };

  // Function to clear active journey (when it becomes inactive)
  const clearActive = () => {
    setActiveJourney(null);
  };

  return {
    activeJourney,
    isLoading,
    error,
    refreshActiveJourney,
    setAsActive,
    clearActive,
  };
}