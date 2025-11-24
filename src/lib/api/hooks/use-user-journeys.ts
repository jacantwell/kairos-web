"use client";

import { Journey } from "kairos-api-client-ts";
import { useSession } from "@/lib/context/session-provider";
import { useUserJourneys as useUserJourneysQuery } from "./user-queries";
import {
  useCreateJourney,
  useDeleteJourney,
  useToggleJourneyActive,
  useSetJourneyCompleted,
} from "./journeys-queries";

export function useUserJourneys() {
  const { user } = useSession();
  
  // Return the full query object - gives access to all TanStack Query features
  const journeysQuery = useUserJourneysQuery(user?._id);

  // Return mutation objects directly - consumers can use mutate/mutateAsync as needed
  const createJourney = useCreateJourney();
  const deleteJourney = useDeleteJourney();
  const toggleActive = useToggleJourneyActive();
  const setCompleted = useSetJourneyCompleted();

  return {
    // Query state - consumers access journeysQuery.data, journeysQuery.isLoading, etc.
    journeysQuery,
    
    // Mutations - consumers call createJourney.mutate() or createJourney.mutateAsync()
    createJourney,
    deleteJourney,
    toggleActive,
    setCompleted,
  };
}