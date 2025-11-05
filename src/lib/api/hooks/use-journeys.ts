"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/context/session-provider";
import { useUserJourneys as useUserJourneysQuery, useUserActiveJourney } from "./user-queries";
import {
  useJourneyMarkers as useJourneyMarkersQuery,
  useNearbyJourneys as useNearbyJourneysQuery,
  useCreateJourney,
  useDeleteJourney,
  useToggleJourneyActive,
  useSetJourneyCompleted,
  useAddMarkerToJourney,
  useUpdateJourneyMarker,
  useDeleteJourneyMarker,
  useNearbyJourneysMarkers,
} from "./journeys-queries";

export function useJourneys() {
  const { user } = useSession();

  // Fetch user's journeys
  const journeysQuery = useUserJourneysQuery(user?._id);

  // Fetch user's active journey
  const activeJourneyQuery = useUserActiveJourney(user?._id);

  // Fetch active journey markers
  const activeJourneyMarkersQuery = useJourneyMarkersQuery(activeJourneyQuery.data?._id);

  // Fetch nearby journeys for active journey
  const nearbyJourneysQuery = useNearbyJourneysQuery(activeJourneyQuery.data?._id);

  // Extract nearby journey IDs
  const nearbyJourneyIds = useMemo(
    () => nearbyJourneysQuery.data?.map((j: any) => j._id) ?? [],
    [nearbyJourneysQuery.data]
  );

  // Fetch all markers for nearby journeys in a single query
  const nearbyMarkersQuery = useNearbyJourneysMarkers(
    activeJourneyQuery.data?._id
  );

  const nearbyMarkersData = nearbyMarkersQuery.data ?? [];

  // Journey mutations
  const createJourney = useCreateJourney();
  const deleteJourney = useDeleteJourney();
  const toggleActive = useToggleJourneyActive();
  const setCompleted = useSetJourneyCompleted();

  // Marker mutations
  const addMarker = useAddMarkerToJourney();
  const updateMarker = useUpdateJourneyMarker();
  const deleteMarker = useDeleteJourneyMarker();

  return {
    // Journey queries
    journeysQuery,
    
    // Active journey query
    activeJourneyQuery,
    activeJourneyMarkersQuery,
    
    // Marker queries
    useJourneyMarkersQuery,
    
    // Nearby journey queries
    nearbyJourneysQuery,
    nearbyJourneyIds,
    nearbyMarkersQuery,
    nearbyMarkersData,
    
    // Journey mutations
    createJourney,
    deleteJourney,
    toggleActive,
    setCompleted,
    
    // Marker mutations
    addMarker,
    updateMarker,
    deleteMarker,
  };
}