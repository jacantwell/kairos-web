"use client";

import { AuthGuard } from "@/lib/components/auth";
import { Navigation } from "@/lib/components/navigation";
import { JourneyMap } from "@/lib/components/journey/map";
import { ActiveJourneyBanner } from "@/lib/components/journey/active-journey-banner";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { useState } from "react";

export default function HomePage() {
  const [journeyPoints, setJourneyPoints] = useState<JourneyPoint[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const { activeJourney, isJourneysLoading, error } = useJourneys();

  const handleAddPoint = (point: JourneyPoint) => {
    setJourneyPoints(prev => [...prev, point]);
    setIsAddingPoint(false);
    // TODO: Send to backend API
    console.log("New point added:", point);
  };

  const handleDeletePoint = (id: string) => {
    setJourneyPoints(prev => prev.filter(point => point.id !== id));
    // TODO: Send delete request to backend API
    console.log("Point deleted:", id);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation title="Map" />

        <main className="max-w-7xl mx-auto py-1 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Failed to load journey data: {error}
                </div>
              </div>
            )}

            {/* Active Journey Banner */}
            <div className="py-2">
              <ActiveJourneyBanner isAddingPoint={isAddingPoint} setIsAddingPoint={setIsAddingPoint} />
            </div>

            {/* Map Component */}
            <JourneyMap
              journeyPoints={journeyPoints}
              isAddingPoint={isAddingPoint}
              onAddPoint={handleAddPoint}
              onDeletePoint={handleDeletePoint}
            />
            
            {/* Journey Points List */}
            {journeyPoints.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Journey Points</h3>
                <div className="space-y-2">
                  {journeyPoints.map((point) => (
                    <div key={point.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{point.name}</p>
                        <p className="text-sm text-gray-500">{point.description}</p>
                        <p className="text-xs text-gray-400">
                          {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePoint(point.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete point"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Active Journey Message */}
            {!isJourneysLoading && !activeJourney && !error && (
              <div className="mt-6 bg-white rounded-lg shadow p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Journey</h3>
                <p className="text-gray-500 mb-4">
                  Create a journey to start planning your bikepacking adventure.
                </p>
                <a 
                  href="/journeys"
                  className="inline-flex items-center px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
                >
                  View Journeys
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

// Types
export interface JourneyPoint {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'waypoint' | 'camp' | 'food' | 'water' | 'repair' | 'scenic';
  dateAdded: Date;
}