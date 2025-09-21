"use client";

import { useState, useEffect, useCallback } from "react";
import { Marker } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";

export function useJourneyMarkers(journeyId: string | null) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const loadMarkers = useCallback(
    async (jId: string | null = journeyId) => {
      if (!jId) {
        setMarkers([]);
        return [];
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log("Loading markers for journey:", jId);

        const response =
          await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(
            jId
          );

        if (response.status === 200 && response.data) {
          const fetchedMarkers = response.data;
          setMarkers(fetchedMarkers);
          console.log("Loaded", fetchedMarkers.length, "markers");
          return fetchedMarkers;
        } else {
          console.warn("No markers found or invalid response");
          setMarkers([]);
          return [];
        }
      } catch (err) {
        console.error("Failed to load journey markers:", err);
        setError("Error loading journey markers");
        setMarkers([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [journeyId, api.journeys]
  );

  // Load markers when journey ID changes
  useEffect(() => {
    if (journeyId) {
      loadMarkers(journeyId);
    } else {
      setMarkers([]);
      setError(null);
    }
  }, [journeyId, loadMarkers]);

  const addMarker = useCallback(
    async (marker: Marker) => {
      if (!journeyId) throw new Error("No journey ID provided");

      const response =
        await api.journeys.addMarkerToJourneyApiV1JourneysJourneyIdMarkersPost(
          journeyId,
          marker
        );

      if (response.status === 200) {
        // Refresh markers to get updated list with proper IDs
        return loadMarkers();
      } else {
        throw new Error(`Failed to add marker: ${response.status}`);
      }
    },
    [journeyId, api.journeys, loadMarkers]
  );

  const deleteMarker = useCallback(
    async (markerId: string) => {
      if (!journeyId || !markerId)
        throw new Error("Missing journey ID or marker ID");

      await api.journeys.deleteJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdDelete(
        journeyId,
        markerId
      );
      return loadMarkers();
    },
    [journeyId, loadMarkers]
  );

  return {
    markers,
    isLoading,
    error,
    loadMarkers,
    addMarker,
    deleteMarker,
  };
}
