import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api/hooks/use-api";
import { Marker } from "kairos-api-client-ts";
import { journeyMarkersQueryKey } from "../queries/markers";

// Mutation for ADDING a marker to a journey
export function useAddMarkerMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ journeyId, marker }: { journeyId: string; marker: Marker }) => {
      return api.journeys.addMarkerToJourneyApiV1JourneysJourneyIdMarkersPost(journeyId, marker);
    },
    // After the mutation succeeds, invalidate the markers query for that journey.
    // This tells TanStack Query to refetch the data automatically.
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journeyMarkersQueryKey(variables.journeyId) });
    },
  });
}

// Mutation for DELETING a marker
export function useDeleteMarkerMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ journeyId, markerId }: { journeyId: string; markerId: string }) => {
      return api.journeys.deleteJourneyMarkerApiV1JourneysJourneyIdMarkersMarkerIdDelete(journeyId, markerId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: journeyMarkersQueryKey(variables.journeyId) });
    },
  });
}