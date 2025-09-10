"use client";

import { useState, useEffect, useCallback } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";

export function useUserJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { user } = useSession();

  const loadJourneys = useCallback(async () => {
    if (!user?._id) {
      setJourneys([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading journeys for user:", user._id);
      
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      
      if (response.status === 200 && response.data) {
        const fetchedJourneys = response.data;
        setJourneys(fetchedJourneys);
        return fetchedJourneys;
      } else {
        setJourneys([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to load journeys:", err);
      setError("Failed to load journeys");
      setJourneys([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, api.users]);

  // Load journeys when user changes
  useEffect(() => {
    if (user?._id) {
      loadJourneys();
    } else {
      setJourneys([]);
      setError(null);
    }
  }, [user?._id, loadJourneys]);

  // CRUD operations
  const addJourney = useCallback((newJourney: Journey) => {
    setJourneys((prev) => [newJourney, ...prev]);
  }, []);

  const removeJourney = useCallback((journeyId: string) => {
    setJourneys((prev) => prev.filter((j) => j._id !== journeyId));
  }, []);

  const updateJourney = useCallback((updatedJourney: Journey) => {
    setJourneys((prev) =>
      prev.map((j) => (j._id === updatedJourney._id ? updatedJourney : j))
    );
  }, []);

  return {
    journeys,
    isLoading,
    error,
    loadJourneys,
    addJourney,
    removeJourney,
    updateJourney,
  };
}