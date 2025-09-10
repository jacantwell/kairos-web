
"use client";

import { useState, useEffect, useCallback } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";

export function useNearbyJourneys(journeyId: string | null) {
  const [nearbyJourneys, setNearbyJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const loadNearbyJourneys = useCallback(async (jId: string | null = journeyId) => {
    if (!jId) {
      setNearbyJourneys([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Loading nearby journeys for:", jId);
      
      const response = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(jId);
      
      if (response.status === 200 && response.data) {
        const fetchedNearbyJourneys = response.data;
        setNearbyJourneys(fetchedNearbyJourneys);
        console.log("Loaded", fetchedNearbyJourneys.length, "nearby journeys");
        return fetchedNearbyJourneys;
      } else {
        setNearbyJourneys([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to load nearby journeys:", err);
      setError("Error loading nearby journeys");
      setNearbyJourneys([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, api.journeys]);

  // Load nearby journeys when journey ID changes
  useEffect(() => {
    if (journeyId) {
      loadNearbyJourneys(journeyId);
    } else {
      setNearbyJourneys([]);
      setError(null);
    }
  }, [journeyId, loadNearbyJourneys]);

  return {
    nearbyJourneys,
    isLoading,
    error,
    loadNearbyJourneys,
  };
}