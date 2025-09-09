"use client";

import { useState, useEffect, useCallback } from "react";
import { Journey } from "kairos-api-client-ts";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";
import { Marker } from "kairos-api-client-ts";

export function useJourneys() {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [activeJourneyMarkers, setActiveJourneyMarkers] = useState<Marker[]>([]);
  const [activeJourneyNearbyJourneys, setActiveJourneyNearbyJourneys] = useState<Journey[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isJourneysLoading, setIsJourneysLoading] = useState(false);
  const [isMarkersLoading, setIsMarkersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { user } = useSession();

  const loadActiveJourneyMarkers = useCallback(async (journeyId: string) => {
    if (!journeyId) {
      setActiveJourneyMarkers([]);
      return [];
    }

    try {
      setIsMarkersLoading(true);
      console.log("Loading markers for journey:", journeyId);
      
      const response = await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(journeyId);
      
      if (response.status === 200 && response.data) {
        const markers = response.data;
        setActiveJourneyMarkers(markers);
        console.log("Loaded", markers.length, "markers");
        return markers;
      } else {
        console.warn("No markers found or invalid response");
        setActiveJourneyMarkers([]);
        return [];
      }
    } catch (err) {
      console.error("Failed to load journey markers:", err);
      setError("Error loading journey markers");
      setActiveJourneyMarkers([]);
      return [];
    } finally {
      setIsMarkersLoading(false);
    }
  }, [api.journeys]);

  const loadActiveJourneyNearbyJourneys = useCallback(async (journeyId: string) => {
    if (!journeyId) {
      setActiveJourneyNearbyJourneys([]);
      return;
    }

    try {
      console.log("Loading nearby journeys for:", journeyId);
      
      const response = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(journeyId);
      
      if (response.status === 200 && response.data) {
        setActiveJourneyNearbyJourneys(response.data);
        console.log("Loaded", response.data.length, "nearby journeys");
      } else {
        setActiveJourneyNearbyJourneys([]);
      }
    } catch (err) {
      console.error("Failed to load nearby journeys:", err);
      setError("Error loading nearby journeys");
      setActiveJourneyNearbyJourneys([]);
    }
  }, [api.journeys]);

  const loadJourneys = useCallback(async () => {
    if (!user?._id) {
      setActiveJourney(null);
      setActiveJourneyMarkers([]);
      setActiveJourneyNearbyJourneys([]);
      setJourneys([]);
      return;
    }

    try {
      setIsJourneysLoading(true);
      setError(null);
      console.log("Loading journeys for user:", user._id);
      
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      
      if (response.status === 200 && response.data) {
        const fetchedJourneys = response.data;
        setJourneys(fetchedJourneys);
        
        // Find the active journey
        const activeTrip = fetchedJourneys.find((journey: Journey) => journey.active);
        setActiveJourney(activeTrip || null);
        
        // Load markers and nearby journeys for the active journey
        if (activeTrip?._id) {
          console.log("Found active journey, loading associated data");
          await Promise.all([
            loadActiveJourneyMarkers(activeTrip._id),
            loadActiveJourneyNearbyJourneys(activeTrip._id)
          ]);
        } else {
          // Clear markers and nearby journeys if no active journey
          setActiveJourneyMarkers([]);
          setActiveJourneyNearbyJourneys([]);
        }
      } else {
        setJourneys([]);
        setActiveJourney(null);
        setActiveJourneyMarkers([]);
        setActiveJourneyNearbyJourneys([]);
      }
    } catch (err) {
      console.error("Failed to load journeys:", err);
      setError("Failed to load journeys");
      setActiveJourney(null);
      setActiveJourneyMarkers([]);
      setActiveJourneyNearbyJourneys([]);
      setJourneys([]);
    } finally {
      setIsJourneysLoading(false);
    }
  }, [user?._id, api.users, loadActiveJourneyMarkers, loadActiveJourneyNearbyJourneys]);

  // Load journeys when user changes
  useEffect(() => {
    if (user?._id) {
      console.log("User ID changed, loading journeys for user:", user._id);
      loadJourneys();
    } else {
      setJourneys([]);
      setActiveJourney(null);
      setActiveJourneyMarkers([]);
      setActiveJourneyNearbyJourneys([]);
      setError(null);
    }
  }, [user?._id, loadJourneys]);

  // Function to refresh the journeys (useful when journeys change)
  const refreshJourneys = useCallback(() => {
    return loadJourneys();
  }, [loadJourneys]);

  const refreshActiveJourneyMarkers = useCallback(async () => {
    if (!activeJourney?._id) {
      setActiveJourneyMarkers([]);
      return [];
    }
    return loadActiveJourneyMarkers(activeJourney._id);
  }, [activeJourney?._id, loadActiveJourneyMarkers]);

  // Function to set a journey as active (optimistic update)
  const setAsActive = useCallback(async (journey: Journey) => {
    // Update local state optimistically
    setActiveJourney(journey);
    setJourneys((prev) =>
      prev.map((j) =>
        j._id === journey._id ? { ...j, active: true } : { ...j, active: false }
      )
    );
    
    // Load associated data for the new active journey
    if (journey._id) {
      await Promise.all([
        loadActiveJourneyMarkers(journey._id),
        loadActiveJourneyNearbyJourneys(journey._id)
      ]);
    }
  }, [loadActiveJourneyMarkers, loadActiveJourneyNearbyJourneys]);

  // Function to clear active journey (when it becomes inactive)
  const clearActive = useCallback(() => {
    setActiveJourney(null);
    setActiveJourneyMarkers([]);
    setActiveJourneyNearbyJourneys([]);
    setJourneys((prev) => prev.map((j) => ({ ...j, active: false })));
  }, []);

  // Function to add a new journey to the local state
  const addJourney = useCallback(async (newJourney: Journey) => {
    setJourneys((prev) => [newJourney, ...prev]);
    
    // If the new journey is active, set it as the active journey and load its data
    if (newJourney.active) {
      setActiveJourney(newJourney);
      if (newJourney._id) {
        await Promise.all([
          loadActiveJourneyMarkers(newJourney._id),
          loadActiveJourneyNearbyJourneys(newJourney._id)
        ]);
      }
    }
  }, [loadActiveJourneyMarkers, loadActiveJourneyNearbyJourneys]);

  // Function to remove a journey from local state
  const removeJourney = useCallback((journeyId: string) => {
    console.log("Removing journey from local state:", journeyId);
    setJourneys((prev) => {
      const updated = prev.filter((j) => j._id !== journeyId);
      console.log("Journeys after removal:", updated.length, "items");
      return updated;
    });
    
    // If the removed journey was active, clear the active journey and its data
    if (activeJourney?._id === journeyId) {
      console.log("Removed journey was active, clearing active journey");
      setActiveJourney(null);
      setActiveJourneyMarkers([]);
      setActiveJourneyNearbyJourneys([]);
    }
  }, [activeJourney?._id]);

  // Function to update a journey in local state
  const updateJourney = useCallback(async (updatedJourney: Journey) => {
    setJourneys((prev) =>
      prev.map((j) => (j._id === updatedJourney._id ? updatedJourney : j))
    );

    // Update active journey if it's the one being updated
    if (activeJourney?._id === updatedJourney._id) {
      setActiveJourney(updatedJourney);
      
      // If the journey is no longer active, clear markers and nearby journeys
      if (!updatedJourney.active) {
        setActiveJourneyMarkers([]);
        setActiveJourneyNearbyJourneys([]);
      }
    }
    
    // If this journey became the new active one, load its data
    if (updatedJourney.active && activeJourney?._id !== updatedJourney._id) {
      setActiveJourney(updatedJourney);
      if (updatedJourney._id) {
        await Promise.all([
          loadActiveJourneyMarkers(updatedJourney._id),
          loadActiveJourneyNearbyJourneys(updatedJourney._id)
        ]);
      }
    }
  }, [activeJourney?._id, loadActiveJourneyMarkers, loadActiveJourneyNearbyJourneys]);

  return {
    activeJourney,
    journeys,
    activeJourneyMarkers,
    activeJourneyNearbyJourneys,
    isJourneysLoading,
    isMarkersLoading,
    isLoading: isJourneysLoading || isMarkersLoading, // Combined loading state
    error,
    loadJourneys,
    refreshJourneys,
    refreshActiveJourneyMarkers,
    setAsActive,
    clearActive,
    addJourney,
    removeJourney,
    updateJourney,
  };
}