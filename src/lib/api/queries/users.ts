import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api/hooks/use-api"; 
import { useSession } from "@/lib/context/session-provider";
import { Journey } from "kairos-api-client-ts";

// A unique key to identify this query.
// Format: [scope, entity, parameters]
export const userJourneysQueryKey = (userId: string) => ["journeys", "user", userId];

export function useUserJourneysQuery() {
  const api = useApi();
  const { user } = useSession();
  const userId = user?._id;

  return useQuery({
    // The query key is an array. When userId changes, React Query will refetch.
    queryKey: userJourneysQueryKey(userId!),
    
    queryFn: async () => {
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(userId!);
      if (response.status !== 200 || !response.data) {
        throw new Error("Failed to fetch user journeys");
      }
      return response.data as Journey[];
    },
    
    // The `enabled` option prevents the query from running if there's no userId.
    enabled: !!userId,
  });
}