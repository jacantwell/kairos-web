import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./use-api";
import { Journey, Marker } from "kairos-api-client-ts";
import { usersKeys } from "./user-queries";

// --- Placeholder Types (based on API docs) ---
// The actual Journey type would likely come from your generated client
type CreateJourneyInput = Omit<Journey, "_id" | "user_id" | "created_at">;
type UpdateMarkerInput = { journeyId: string; markerId: string; data: Marker };

// --- Query Key Factory ---
// A best practice for keeping query keys consistent and organized.
export const journeysKeys = {
  all: ["journeys"] as const,
  lists: () => [...journeysKeys.all, "list"] as const,
  // Note: This key for the user's journey list would be used in your
  // refactored `useUserJourneys` hook, like so: ['journeys', 'list', userId]
  detail: (journeyId: string) => [...journeysKeys.all, "detail", journeyId] as const,
  markers: (journeyId: string) => [...journeysKeys.detail(journeyId), "markers"] as const,
  nearby: (journeyId: string) => [...journeysKeys.detail(journeyId), "nearby"] as const,
};

// --- QUERY HOOKS (for GET requests) ---

/**
 * Fetches a single journey by its ID.
 * Corresponds to: getJourneyApiV1JourneysJourneyIdGet
 */
export const useJourney = (journeyId: string | null | undefined) => {
  const api = useApi();
  return useQuery<Journey, Error>({
    queryKey: journeysKeys.detail(journeyId!),
    queryFn: async () => {
      const response = await api.journeys.getJourneyApiV1JourneysJourneyIdGet(journeyId!);
      return response.data;
    },
    // The query will not run until journeyId is a truthy value
    enabled: !!journeyId,
  });
};

/**
 * Fetches all markers for a specific journey.
 * Corresponds to: getJourneyMarkersApiV1JourneysJourneyIdMarkersGet
 */
export const useJourneyMarkers = (journeyId: string | null | undefined) => {
  const api = useApi();
  return useQuery<Marker[], Error>({
    queryKey: journeysKeys.markers(journeyId!),
    queryFn: async () => {
      const response = await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(journeyId!);
      return response.data;
    },
    enabled: !!journeyId,
  });
};

/**
 * Fetches journeys with markers near a given journey.
 * Corresponds to: getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet
 */
export const useNearbyJourneys = (journeyId: string | null | undefined) => {
  const api = useApi();
  // The API doc specifies 'any' as return type, adjust as needed.
  return useQuery<any, Error>({
    queryKey: journeysKeys.nearby(journeyId!),
    queryFn: async () => {
      const response = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(journeyId!);
      return response.data;
    },
    enabled: !!journeyId,
  });
};

/**
 * Fetches all markers from nearby journeys.
 * This combines the nearby journeys query with markers fetching.
 * Corresponds to: getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet
 * followed by fetching markers for each journey
 */
export const useNearbyJourneysMarkers = (journeyId: string | null | undefined) => {
  const api = useApi();
  return useQuery<Marker[], Error>({
    queryKey: [...journeysKeys.nearby(journeyId!), 'markers'],
    queryFn: async () => {
      // First get nearby journeys
      const nearbyJourneysResponse = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(journeyId!);
      const nearbyJourneys = nearbyJourneysResponse.data;
      
      if (!nearbyJourneys || nearbyJourneys.length === 0) {
        return [];
      }

      // Then fetch markers for all nearby journeys in parallel
      const markerPromises = nearbyJourneys.map((journey: any) =>
        api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(journey._id)
          .then(response => response.data)
          .catch(error => {
            console.error(`Failed to fetch markers for journey ${journey._id}:`, error);
            return []; // Return empty array on error for that journey
          })
      );

      const allMarkers = await Promise.all(markerPromises);
      
      // Flatten the array of arrays into a single array
      return allMarkers.flat();
    },
    enabled: !!journeyId,
  });
};


// --- MUTATION HOOKS (for POST, PUT, PATCH, DELETE) ---

/**
 * Creates a new journey.
 * Corresponds to: createJourneyApiV1JourneysPost
 */
export const useCreateJourney = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newJourney: CreateJourneyInput) =>
      api.journeys.createJourneyApiV1JourneysPost(newJourney as Journey),
    onSuccess: () => {
      // When a new journey is created, the list of all journeys is stale.
      // Invalidate the query for the user's journey list.
      // Assumes your useUserJourneys hook uses a key like ['journeys', 'list', userId]
      queryClient.invalidateQueries({ queryKey: journeysKeys.lists() });
    },
  });
};

/**
 * Deletes a journey.
 * Corresponds to: deleteJourneyApiV1JourneysJourneyIdDelete
 */
export const useDeleteJourney = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (journeyId: string) =>
      api.journeys.deleteJourneyApiV1JourneysJourneyIdDelete(journeyId),
    onSuccess: (data, journeyId) => {
      // Invalidate the main list and remove the specific journey detail query from the cache
      queryClient.invalidateQueries({ queryKey: journeysKeys.lists() });
      queryClient.removeQueries({ queryKey: journeysKeys.detail(journeyId) });
    },
  });
};

/**
 * Toggles the 'active' state of a journey.
 * Corresponds to: toggleActiveJourneyApiV1JourneysJourneyIdActivePatch
 */
export const useToggleJourneyActive = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (journeyId: string) =>
      api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(journeyId),
    onSuccess: (data, journeyId) => {
      // The journey's state has changed, so both the list and detail are stale.
      queryClient.invalidateQueries({ queryKey: journeysKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journeysKeys.detail(journeyId) });
      // This also invalidate the active journey query for the user, if applicable.
      queryClient.invalidateQueries({ queryKey: usersKeys.activeJourney(data.user_id) });
    },
  });
};

/**
 * Sets a journey as completed.
 * Corresponds to: setCompletedJourneyApiV1JourneysJourneyIdPatch
 */
export const useSetJourneyCompleted = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (journeyId: string) =>
      api.journeys.setCompletedJourneyApiV1JourneysJourneyIdPatch(journeyId),
    onSuccess: (data, journeyId) => {
      // The journey's state has changed, so both the list and detail are stale.
      queryClient.invalidateQueries({ queryKey: journeysKeys.lists() });
      queryClient.invalidateQueries({ queryKey: journeysKeys.detail(journeyId) });
    },
  });
};

/**
 * Adds a marker to a journey.
 * Corresponds to: addMarkerToJourneyApiV1JourneysJourneyIdMarkersPost
 */
export const useAddMarkerToJourney = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ journeyId, data }: { journeyId: string; data: Marker }) =>
      api.journeys.addMarkerToJourneyApiV1JourneysJourneyIdMarkersPost(journeyId, data),
    onSuccess: (data, variables) => {
      // The list of markers for this specific journey is now stale.
      queryClient.invalidateQueries({ queryKey: journeysKeys.markers(variables.journeyId) });
    },
  });
};

/**
 * Updates a journey marker.
 * Corresponds to: updateJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdPut
 */
export const useUpdateJourneyMarker = () => {
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ journeyId, markerId, data }: UpdateMarkerInput) =>
            api.journeys.updateJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdPut(journeyId, markerId, data),
        onSuccess: (data, variables) => {
            // The list of markers for this journey is now stale.
            queryClient.invalidateQueries({ queryKey: journeysKeys.markers(variables.journeyId) });
        }
    });
};

/**
 * Deletes a marker from a journey.
 * Corresponds to: deleteJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdDelete
 */
export const useDeleteJourneyMarker = () => {
    const api = useApi();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ journeyId, markerId }: { journeyId: string; markerId: string }) =>
            api.journeys.deleteJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdDelete(journeyId, markerId),
        onSuccess: (data, variables) => {
            // The list of markers for this journey is now stale.
            queryClient.invalidateQueries({ queryKey: journeysKeys.markers(variables.journeyId) });
        }
    });
};