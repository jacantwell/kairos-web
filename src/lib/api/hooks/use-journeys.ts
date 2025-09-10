"use client";

import { useUserJourneys } from "./use-user-journeys";
import { useActiveJourney } from "./use-active-journey";
import { useJourneyMarkers } from "./use-journey-markers";
import { useNearbyJourneys } from "./use-nearby-journeys";

export function useJourneys() {
  const {
    journeys,
    isLoading: isJourneysLoading,
    error: journeysError,
    loadJourneys,
    addJourney,
    removeJourney,
    updateJourney,
  } = useUserJourneys();

  const {
    activeJourney,
    activeJourneyId,
    setAsActive,
    clearActive,
  } = useActiveJourney({ journeys });

  const {
    markers: activeJourneyMarkers,
    isLoading: isMarkersLoading,
    error: markersError,
    loadMarkers: loadActiveJourneyMarkers,
    addMarker: addMarkerToActiveJourney,
    deleteMarker: deleteMarkerFromActiveJourney,
  } = useJourneyMarkers(activeJourneyId);

  const {
    nearbyJourneys: activeJourneyNearbyJourneys,
    isLoading: isNearbyLoading,
    error: nearbyError,
    loadNearbyJourneys: loadActiveJourneyNearbyJourneys,
  } = useNearbyJourneys(activeJourneyId);

  // Combine loading states and errors
  const isLoading = isJourneysLoading || isMarkersLoading || isNearbyLoading;
  const error = journeysError || markersError || nearbyError;

  return {
    // Journey data
    journeys,
    activeJourney,
    activeJourneyMarkers,
    activeJourneyNearbyJourneys,

    // Loading states
    isLoading,
    isJourneysLoading,
    isMarkersLoading,
    isNearbyLoading,

    // Errors
    error,
    journeysError,
    markersError,
    nearbyError,

    // Journey operations
    loadJourneys,
    refreshJourneys: loadJourneys,
    addJourney,
    removeJourney,
    updateJourney,
    setAsActive,
    clearActive,

    // Marker operations
    refreshActiveJourneyMarkers: loadActiveJourneyMarkers,
    addMarkerToActiveJourney,
    deleteMarkerFromActiveJourney,

    // Nearby journey operations
    refreshActiveJourneyNearbyJourneys: loadActiveJourneyNearbyJourneys,
  };
}