import { useQuery, useQueries } from "@tanstack/react-query";
import { useApi } from "@/lib/api/hooks/use-api";
import { Marker } from "kairos-api-client-ts";

// Query for fetching markers for a SINGLE journey
export const journeyMarkersQueryKey = (journeyId: string) => ["markers", "journey", journeyId];

export function useJourneyMarkersQuery(journeyId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: journeyMarkersQueryKey(journeyId!),
    queryFn: async () => {
      const response = await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(journeyId!);
      if (response.status !== 200 || !response.data) {
        return [];
      }
      return response.data;
    },
    enabled: !!journeyId,
  });
}

// Query for fetching markers for MULTIPLE journeys in parallel
export function useNearbyJourneyMarkersQuery(journeyIds: string[]) {
  const api = useApi();

  // `useQueries` is perfect for fetching a dynamic number of resources.
  return useQueries({
    queries: (journeyIds ?? []).map((id) => ({
      queryKey: journeyMarkersQueryKey(id),
      queryFn: async () => {
        const response = await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(id);
        if (response.status !== 200 || !response.data) {
          // It's often better to return empty than throw, so one failure doesn't kill all results.
          console.warn(`Failed to fetch markers for journey ${id}`);
          return []; 
        }
        return response.data;
      },
    })),
  });
}