import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api/hooks/use-api";
import { Journey } from "kairos-api-client-ts";

// Query for fetching nearby journeys for a specific journey
export const nearbyJourneysQueryKey = (journeyId: string) => ["journeys", "nearby", journeyId];

export function useNearbyJourneysQuery(journeyId: string | null) {
  const api = useApi();

  return useQuery({
    queryKey: nearbyJourneysQueryKey(journeyId!),
    queryFn: async () => {
      const response = await api.journeys.getNearbyJourneysApiV1JourneysJourneyIdJourneysNearbyGet(journeyId!);
      if (response.status !== 200 || !response.data) {
        // Handle error?
        return [];
      }
      return response.data; // Returns either Journey[] or string[]
    },
    enabled: !!journeyId,
  });
}

// REPEATED CODE >:(
// export const userJourneysQueryKey = (userId: string) => ["journeys", userId]

// export function useUserJourneysQuery(userId: string | null) {
//   const api = useApi()

//   return useQuery({
//     queryKey: userJourneysQueryKey(userId!),
//     queryFn: async () => {
//       const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(userId!);
//       if (response.status !== 200 || !response.data) {
//         // handle error?
//         return []
//       }
//       return response.data;
//     },
//     enabled: !!userId,
//   });
// }