"use client";

import { useState, useEffect } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";

export function useJourneys() {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [isJourneysLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  const { user } = useSession();

  const loadJourneys = async () => {
    if (!user?._id) {
      setActiveJourney(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get user's journeys and find the active one
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      setJourneys(response.data)

      if (journeys) {
        const activeTrip = journeys.find((journey: Journey) => journey.active);
        setActiveJourney(activeTrip || null);
      } else {
        setActiveJourney(null);
      }
    } catch (err: any) {
      console.error("Failed to load journeys:", err);
      setError(err.message || "Failed to load journeys");
      setActiveJourney(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load active journey when user changes
  useEffect(() => {
    loadJourneys();
  }, [user?._id]);

  // Function to refresh the active journey (useful when journeys change)
  const refreshActiveJourney = () => {
    loadJourneys();
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
    journeys,
    isJourneysLoading,
    error,
    loadJourneys,
    refreshActiveJourney,
    setAsActive,
    clearActive,
  };
}