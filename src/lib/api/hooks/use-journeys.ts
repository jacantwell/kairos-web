"use client";

import { useState, useEffect, useCallback } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";

export function useJourneys() {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isJourneysLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { user } = useSession();

  const loadJourneys = useCallback(async () => {
    if (!user?._id) {
      setActiveJourney(null);
      setJourneys([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response =
        await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      const fetchedJourneys = response.data || [];
      setJourneys(fetchedJourneys);
      const activeTrip = fetchedJourneys.find(
        (journey: Journey) => journey.active
      );
      setActiveJourney(activeTrip || null);
    } catch (err) {
      console.error("Failed to load journeys:", err);
      setError("Failed to load journeys");
      setActiveJourney(null);
      setJourneys([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, api.users]);

  useEffect(() => {
    if (user?._id) {
      loadJourneys();
    } else {
      setJourneys([]);
      setActiveJourney(null);
      setError(null);
    }
  }, [user?._id, loadJourneys]);

  // Function to refresh the journeys (useful when journeys change)
  const refreshJourneys = () => {
    return loadJourneys();
  };

  // Function to set a journey as active (optimistic update)
  const setAsActive = (journey: Journey) => {
    // Update local state optimistically
    setActiveJourney(journey);
    setJourneys((prev) =>
      prev.map((j) =>
        j._id === journey._id ? { ...j, active: true } : { ...j, active: false }
      )
    );
  };

  // Function to clear active journey (when it becomes inactive)
  const clearActive = () => {
    setActiveJourney(null);
    setJourneys((prev) => prev.map((j) => ({ ...j, active: false })));
  };

  // Function to add a new journey to the local state
  const addJourney = (newJourney: Journey) => {
    setJourneys((prev) => [newJourney, ...prev]);
    // If the new journey is active, set it as the active journey
    if (newJourney.active) {
      setActiveJourney(newJourney);
    }
  };

  // Function to remove a journey from local state
  const removeJourney = (journeyId: string) => {
    console.log("Removing journey from local state:", journeyId);
    setJourneys((prev) => {
      const updated = prev.filter((j) => j._id !== journeyId);
      console.log("Journeys after removal:", updated.length, "items");
      return updated;
    });
    // If the removed journey was active, clear the active journey
    if (activeJourney?._id === journeyId) {
      console.log("Removed journey was active, clearing active journey");
      setActiveJourney(null);
    }
  };

  // Function to update a journey in local state
  const updateJourney = (updatedJourney: Journey) => {
    setJourneys((prev) =>
      prev.map((j) => (j._id === updatedJourney._id ? updatedJourney : j))
    );

    // Update active journey if it's the one being updated
    if (activeJourney?._id === updatedJourney._id) {
      setActiveJourney(updatedJourney);
    }
  };

  return {
    activeJourney,
    journeys,
    isJourneysLoading,
    error,
    loadJourneys,
    refreshJourneys, // Renamed for clarity
    setAsActive,
    clearActive,
    addJourney,
    removeJourney,
    updateJourney,
  };
}
