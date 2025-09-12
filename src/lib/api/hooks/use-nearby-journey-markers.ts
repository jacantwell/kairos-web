"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Marker } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";

export interface NearbyJourneyMarkers {
  journeyId: string;
  markers: Marker[];
}

export function useNearbyJourneyMarkers(nearbyJourneysIds: string[]) {
  const [nearbyJourneyMarkers, setNearbyJourneyMarkers] = useState<
    NearbyJourneyMarkers[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  // Fix: Properly handle undefined/null arrays and filter out empty strings
  const stableIds = useMemo(() => {
    if (!nearbyJourneysIds || !Array.isArray(nearbyJourneysIds)) {
      return [];
    }
    return nearbyJourneysIds.filter(id => id && id.trim() !== "");
  }, [nearbyJourneysIds?.join(",")]);

  const loadNearbyJourneyMarkers = useCallback(
    async (ids: string[] = stableIds) => {
      if (!ids || ids.length === 0) {
        setNearbyJourneyMarkers([]);
        return [];
      }

      setIsLoading(true);
      setError(null);
      console.log("Loading markers for nearby journeys:", ids);

      try {
        const markersPromises = ids.map((journeyId) =>
          api.journeys
            .getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(journeyId)
            .then((response) => ({
              journeyId,
              response,
            }))
            .catch((err) => {
              console.error(`Failed to fetch markers for journey ${journeyId}:`, err);
              return {
                journeyId,
                response: { status: 500, data: null },
              };
            })
        );

        const results = await Promise.all(markersPromises);
        console.log("Fetched markers results:", results);
        
        const fetchedMarkers: NearbyJourneyMarkers[] = results
          .filter((result) => result.response.status === 200 && result.response.data)
          .map((result) => ({
            journeyId: result.journeyId,
            markers: result.response.data || [],
          }));

        setNearbyJourneyMarkers(fetchedMarkers);
        console.log("Loaded markers for", fetchedMarkers.length, "nearby journeys");
        return fetchedMarkers;
      } catch (err) {
        console.error("Failed to load nearby journey markers:", err);
        setError("Error loading nearby journey markers");
        setNearbyJourneyMarkers([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [stableIds, api.journeys]
  );

  useEffect(() => {
    if (stableIds.length > 0) {
      console.log("Effect triggered - loading markers for IDs:", stableIds);
      loadNearbyJourneyMarkers();
    } else {
      console.log("No stable IDs, clearing markers");
      setNearbyJourneyMarkers([]);
    }
  }, [loadNearbyJourneyMarkers]);

  return {
    nearbyJourneyMarkers,
    isLoading,
    error,
    loadNearbyJourneyMarkers,
  };
}