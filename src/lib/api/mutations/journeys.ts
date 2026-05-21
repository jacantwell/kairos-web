import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api/hooks/use-api";
import { Journey } from "kairos-api-client-ts";
import { userJourneysQueryKey } from "../queries/users";

// Mutation for CREATING a new journey
export function useCreateJourneyMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newJourney: Journey) => {
      return api.journeys.createJourneyApiV1JourneysPost(newJourney);
    },
    // When the mutation is successful, we invalidate the user's journeys query.
    // This tells TanStack Query to automatically refetch the list of journeys.
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userJourneysQueryKey(variables.user_id) });
    },
  });
}

// Mutation for DELETING a journey
export function useDeleteJourneyMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journeyId, userId }: { journeyId: string; userId: string }) => {
      return api.journeys.deleteJourneyApiV1JourneysJourneyIdDelete(journeyId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userJourneysQueryKey(variables.userId) });
    },
  });
}

// Mutation for TOGGLING a journey's active state
export function useToggleActiveJourneyMutation() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ journeyId, userId }: { journeyId: string; userId: string }) => {
      return api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(journeyId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userJourneysQueryKey(variables.userId) });
    },
  });
}