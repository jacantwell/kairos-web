"use client";

import { AuthGuard } from "@/lib/components/auth";
import { Navigation } from "@/lib/components/navigation";
import { JourneyMap } from "@/lib/components/journey/map";
import { ActiveJourneyBanner } from "@/lib/components/journey/active-journey-banner";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { useState } from "react";
import { Marker } from "kairos-api-client-ts";

export default function HomePage() {
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  const {
    activeJourney,
    activeJourneyMarkers,
    nearbyJourneyMarkers,
    addMarkerToActiveJourney,
    refreshActiveJourneyNearbyJourneys,
    updateMarkerOfActiveJourney,
    deleteMarkerFromActiveJourney,
    isLoading,
    error,
  } = useJourneys();

  console.log("nearbyJourneyMarkers", nearbyJourneyMarkers);

  const handleAddPoint = async (point: Marker) => {
    if (!activeJourney?._id) {
      console.error("No active journey to add point to");
      return;
    }

    setIsAddingPoint(true);

    try {
      console.log("Adding point to journey:", activeJourney._id, point);
      await addMarkerToActiveJourney(point);
      refreshActiveJourneyNearbyJourneys();
      console.log("Point added successfully");
    } catch (error) {
      console.error("Error adding point:", error);
      // Add toast notification here
    } finally {
      setIsAddingPoint(false);
    }
  };

  const handleDeletePoint = async (id: string) => {
    if (!activeJourney?._id || !id || id.startsWith("temp-")) {
      console.warn("Cannot delete point: invalid ID or no active journey");
      return;
    }

    if (!activeJourneyMarkers.find((marker) => marker._id === id)) {
      console.warn("Point ID not found in active journey markers:", id);
      return;
    }

    try {
      await deleteMarkerFromActiveJourney(id);
      refreshActiveJourneyNearbyJourneys();
    } catch (error) {
      console.error("Error deleting point:", error);
    }
  };

  const handleUpdatePoint = async (id: string, updatedMarker: Marker) => {
    if (!activeJourney?._id || !id || id.startsWith("temp-")) {
      console.warn("Cannot delete point: invalid ID or no active journey");
      return;
    }

    if (!activeJourneyMarkers.find((marker) => marker._id === id)) {
      console.warn("Point ID not found in active journey markers:", id);
      return;
    }

    try {
      await updateMarkerOfActiveJourney(id, updatedMarker);
      refreshActiveJourneyNearbyJourneys();
      console.log("Point deleted:", id);
    } catch (error) {
      console.error("Error deleting point:", error);
      // Add a toast notification
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-7xl mx-auto py-1 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                  Failed to load journey data: {error}
                </div>
              </div>
            )}

            {/* Active Journey Banner */}
            <div className="py-2">
              <ActiveJourneyBanner
                isAddingPoint={isAddingPoint}
                setIsAddingPoint={setIsAddingPoint}
              />
            </div>

            {/* Map Component */}
            {(activeJourney || isLoading) && (
              <JourneyMap
                journeyMarkers={activeJourneyMarkers}
                nearbyJourneyMarkers={nearbyJourneyMarkers}
                isAddingPoint={isAddingPoint}
                onAddPoint={handleAddPoint}
                onUpdatePoint={handleUpdatePoint}
                onDeletePoint={handleDeletePoint}
              />
            )}

            {/* Journey Points List */}
            {activeJourneyMarkers.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">
                  Your Journey Points ({activeJourneyMarkers.length})
                </h3>
                <div className="space-y-2">
                  {activeJourneyMarkers.map((point, index) => {
                    const listKey =
                      point._id || `point-${index}-${point.name}-${Date.now()}`;
                    const isTemporary =
                      !point._id || point._id.startsWith("temp-");

                    return (
                      <div
                        key={listKey}
                        className={`flex justify-between items-center p-3 rounded ${
                          isTemporary
                            ? "bg-yellow-50 border border-yellow-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{point.name}</p>
                            {isTemporary && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Saving...
                              </span>
                            )}
                          </div>
                          {point.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {point.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {point.coordinates.coordinates[1].toFixed(6)},{" "}
                            {point.coordinates.coordinates[0].toFixed(6)}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            Type: {point.marker_type}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePoint(point._id || "")}
                          className={`p-1 ml-4 transition-colors ${
                            isTemporary
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-red-500 hover:text-red-700"
                          }`}
                          title={
                            isTemporary
                              ? "Cannot delete unsaved point"
                              : "Delete point"
                          }
                          disabled={isTemporary}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Active Journey Message */}
            {!isLoading && !activeJourney && !error && (
              <div className="mt-6 bg-white rounded-lg shadow p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Journey
                </h3>
                <p className="text-gray-500 mb-4">
                  Create a journey to start planning your bikepacking adventure.
                </p>
                <a
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
                >
                  Manage Journeys
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
