"use client";

import { AuthGuard } from "@/lib/components/auth";
import { JourneyList } from "@/lib/components/journey/journey-list";
import { CreateJourneyModal } from "@/lib/components/journey/create-journey-modal";
import { useState } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";
import { Journey } from "kairos-api-client-ts";
import { Navigation } from "@/lib/components/navigation";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { ActiveJourneyModal } from "@/lib/components/journey/active-journey-modal";

export default function JourneysPage() {
  const {
    journeys,
    activeJourney,
    isJourneysLoading,
    refreshJourneys,
    addJourney,
    removeJourney,
    updateJourney,
    error: journeysError,
  } = useJourneys();

  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActiveModalOpen, setIsActiveModalOpen] = useState(false);
  const api = useApi();
  const { user } = useSession();

  const handleSetActiveJourney = async (journeyId: string) => {
    try {
      setError(null);

      // Optimistically set active
      journeys.forEach((j) => {
        updateJourney({ ...j, active: j._id === journeyId });
      });

      // If there is already an active journey, deactivate it
      if (activeJourney) {
        await api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(activeJourney?._id || '')
      }

      // Set the selected journey as active
      const response = await api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(
        journeyId
      );

      if (response.status !== 200) {
        setError("Failed to set active journey");
        refreshJourneys();
        return;
      }

      console.log("Set active journey:", journeyId);
      setIsActiveModalOpen(false);
    } catch (err) {
      console.error("Failed to set active journey:", err);
      setError("Failed to set active journey");
      refreshJourneys();
    }
  };

  const handleCreateJourney = async (journeyData: {
    name: string;
    description: string;
  }) => {
    if (!user?._id) return;

    try {
      setError(null);

      const newJourney: Journey = {
        name: journeyData.name,
        description: journeyData.description,
        user_id: user._id,
        active: false, // New journeys are inactive by default
        created_at: new Date().toISOString(),
      };

      const response = await api.journeys.createJourneyApiV1JourneysPost(
        newJourney
      );

      if (response.data) {
        // Add the new journey to local state immediately
        addJourney(response.data);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create journey:", err);
      setError("Failed to create journey");
    }
  };

  const handleDeleteJourney = async (journeyId: string) => {
    try {
      setError(null);

      // Optimistically remove the journey from local state first
      removeJourney(journeyId);

      const response =
        await api.journeys.deleteJourneyApiV1JourneysJourneyIdDelete(journeyId);

      if (response.status !== 200) {
        setError("Failed to delete journey");
        // Refresh journeys to revert the optimistic update
        refreshJourneys();
        return;
      }

      console.log("Journey deleted successfully:", journeyId);
    } catch (err) {
      console.error("Failed to delete journey:", err);
      setError("Failed to delete journey");
      // Refresh journeys to revert the optimistic update and get current state from server
      refreshJourneys();
    }
  };

  const handleToggleActive = async (journeyId: string, active: boolean) => {
    try {
      setError(null);

      // Find the journey to update
      const journeyToUpdate = journeys.find((j) => j._id === journeyId);
      if (!journeyToUpdate) return;

      // Create updated journey
      const updatedJourney = { ...journeyToUpdate, active };

      // Update local state optimistically
      updateJourney(updatedJourney);

      // TODO: When you implement the backend update endpoint, add the API call here
      const response =
        await api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(
          journeyId
        );

        if (response.status !== 200) {
          setError("Failed to update journey");
          refreshJourneys();
          return;
        }

      console.log("Toggle active:", journeyId, active);
    } catch (err) {
      console.error("Failed to toggle journey active status:", err);
      setError("Failed to update journey");
      // Refresh journeys to revert optimistic update
      refreshJourneys();
    }
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await refreshJourneys();
    } catch (err) {
      console.error("Failed to refresh journeys:", err);
      setError("Failed to refresh journeys");
    }
  };

  // Combine local error with journeys hook error
  const displayError = error || journeysError;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          title="My Journeys"
          actions={
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
              >
                Create Journey
              </button>
              <button
                onClick={() => setIsActiveModalOpen(true)}
                className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
              >
                Active journey
              </button>
            </div>
          }
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {displayError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {displayError}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <JourneyList
              journeys={journeys}
              isLoading={isJourneysLoading}
              onDelete={handleDeleteJourney}
              onToggleActive={handleToggleActive}
              onRefresh={handleRefresh}
            />
          </div>
        </main>

        {isCreateModalOpen && (
          <CreateJourneyModal
            onConfirm={handleCreateJourney}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
        {isActiveModalOpen && (
          <ActiveJourneyModal
            onConfirm={handleSetActiveJourney}
            onCancel={() => setIsActiveModalOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
