// kairos/src/app/home/page.tsx - Updated with Navigation
"use client";

import { AuthGuard } from "@/lib/components/auth";
import { Navigation } from "@/lib/components/navigation";
import { JourneyMap } from "@/lib/components/journey/map";
import { ActiveJourneyBanner } from "@/lib/components/journey/active-journey-banner";
import { useActiveJourney } from "@/lib/api/hooks/use-active-journey";
import { useState } from "react";

export default function HomePage() {
  const [journeyPoints, setJourneyPoints] = useState<JourneyPoint[]>([]);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const { activeJourney, isLoading } = useActiveJourney()

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

  const navigationActions = (
    <button
      onClick={() => setIsAddingPoint(!isAddingPoint)}
      className={`px-4 py-2 rounded-lg transition-colors ${
        isAddingPoint
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-primary-green-500 text-white hover:bg-primary-green-600'
      }`}
    >
      {isAddingPoint ? 'Cancel Adding' : 'Add Point'}
    </button>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation title="Map" actions={navigationActions} />

        <main className="max-w-7xl mx-auto py-1 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="py-2" >
              <ActiveJourneyBanner journey={activeJourney} isLoading = {isLoading} />
            </div>
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