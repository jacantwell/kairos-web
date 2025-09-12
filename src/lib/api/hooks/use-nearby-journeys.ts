"use client";

import { useState, useEffect, useCallback } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";

export function useNearbyJourneys(journeyId: string | null) {
  const [nearbyJourneys, setNearbyJourneys] = useState<Journey[]>([]);
  const [nearbyJourneyIds, setNearbyJourneyIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const loadNearbyJourneys = useCallback(async (jId: string | null = journeyId) => {
    if (!jId) {
      console.log("useNearbyJourneys - No journey ID, clearing nearby journeys");
      setNearbyJourneys([]);
      setNearbyJourneyIds([]);
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(jId);
      
      if (response.status === 200 && response.data) {
        const fetchedData = response.data;
        
        // Check if the API returns strings (journey IDs) or Journey objects
        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          if (typeof fetchedData[0] === 'string') {
            // API returns array of journey ID strings
            setNearbyJourneyIds(fetchedData as string[]);
            setNearbyJourneys([]); // We don't have full journey objects
            return fetchedData as string[];
          } else {
            // API returns array of Journey objects
            const journeyObjects = fetchedData as Journey[];
            setNearbyJourneys(journeyObjects);
            setNearbyJourneyIds(journeyObjects.map(j => j._id || '').filter(id => !!id));
            return journeyObjects;
          }
        } else {
          console.log("useNearbyJourneys - Empty response");
          setNearbyJourneys([]);
          setNearbyJourneyIds([]);
          return [];
        }
      } else {
        console.log("useNearbyJourneys - No nearby journeys found or invalid response");
        setNearbyJourneys([]);
        setNearbyJourneyIds([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to load nearby journeys:", err);
      setError("Error loading nearby journeys");
      setNearbyJourneys([]);
      setNearbyJourneyIds([]);
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
      setNearbyJourneyIds([]);
      setError(null);
    }
  }, [journeyId, loadNearbyJourneys]);

  return {
    nearbyJourneys,
    nearbyJourneyIds, // Export the IDs directly
    isLoading,
    error,
    loadNearbyJourneys,
  };
}