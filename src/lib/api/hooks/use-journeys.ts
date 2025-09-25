"use client";

import { useUserJourneys } from "./use-user-journeys";
import { useActiveJourney } from "./use-active-journey";
import { useJourneyMarkers } from "./use-journey-markers";
import { useNearbyJourneys } from "./use-nearby-journeys";
import { useNearbyJourneyMarkers } from "./use-nearby-journey-markers";

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

  const { activeJourney, activeJourneyId, setAsActive, clearActive } =
    useActiveJourney({ journeys });

  const {
    markers: activeJourneyMarkers,
    isLoading: isMarkersLoading,
    error: markersError,
    loadMarkers: loadActiveJourneyMarkers,
    addMarker: addMarkerToActiveJourney,
    updateMarker: updateMarkerOfActiveJourney,
    deleteMarker: deleteMarkerFromActiveJourney,
  } = useJourneyMarkers(activeJourneyId);

  const {
    nearbyJourneys: activeJourneyNearbyJourneys,
    nearbyJourneyIds,
    isLoading: isNearbyLoading,
    error: nearbyError,
    loadNearbyJourneys: loadActiveJourneyNearbyJourneys,
  } = useNearbyJourneys(activeJourneyId);

  const {
    nearbyJourneyMarkers,
    isLoading: isNearbyMarkersLoading,
    error: nearbyMarkersError,
    loadNearbyJourneyMarkers: loadActiveJourneyNearbyMarkers,
  } = useNearbyJourneyMarkers(nearbyJourneyIds);

  // Combine loading states and errors
  const isLoading =
    isJourneysLoading ||
    isMarkersLoading ||
    isNearbyLoading ||
    isNearbyMarkersLoading;
  const error =
    journeysError || markersError || nearbyError || nearbyMarkersError;

  return {
    // Journey data
    journeys,
    activeJourney,
    activeJourneyMarkers,
    activeJourneyNearbyJourneys,
    nearbyJourneyMarkers,

    // Loading states
    isLoading,
    isJourneysLoading,
    isMarkersLoading,
    isNearbyLoading,
    isNearbyMarkersLoading,

    // Errors
    error,
    journeysError,
    markersError,
    nearbyError,
    nearbyMarkersError,

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
    updateMarkerOfActiveJourney,
    deleteMarkerFromActiveJourney,

    // Nearby journey operations
    refreshActiveJourneyNearbyJourneys: loadActiveJourneyNearbyJourneys,
    refreshActiveJourneyNearbyMarkers: loadActiveJourneyNearbyMarkers,
  };
}