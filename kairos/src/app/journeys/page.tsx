// kairos/src/app/journeys/page.tsx
"use client";

import { AuthGuard } from "@/lib/components/auth";
import { UserMenu } from "@/lib/components/user-menu";
import { JourneyList } from "@/lib/components/journey/journey-list";
import { CreateJourneyModal } from "@/lib/components/journey/create-journey-modal";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api/hooks/use-api";
import { useSession } from "@/lib/context/session";
import { Journey } from "kairos-api-client-ts";
import { Navigation } from "@/lib/components/navigation";

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const api = useApi();
  const { user } = useSession();

  // Load user's journeys
  const loadJourneys = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.users.getUserJourneysApiV1UsersUserIdJourneysGet(user._id);
      
      // The API returns journeys in response.data
      if (response.data) {
        setJourneys(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      console.error("Failed to load journeys:", err);
      setError(err.message || "Failed to load journeys");
    } finally {
      setIsLoading(false);
    }
  };

  // Load journeys when component mounts or user changes
  useEffect(() => {
    loadJourneys();
  }, [user?._id]);

  const handleCreateJourney = async (journeyData: { name: string; description: string }) => {
    if (!user?._id) return;

    try {
      const newJourney: Journey = {
        name: journeyData.name,
        description: journeyData.description,
        user_id: user._id,
        active: true,
        created_at: new Date().toISOString(),
      };

      const response = await api.journeys.createJourneyApiV1JourneysPost(newJourney);
      
      if (response.data) {
        setJourneys(prev => [response.data, ...prev]);
        setIsCreateModalOpen(false);
      }
    } catch (err: any) {
      console.error("Failed to create journey:", err);
      setError(err.message || "Failed to create journey");
    }
  };

  const handleDeleteJourney = async (journeyId: string) => {
    // Note: The API doesn't seem to have a delete endpoint yet
    // This would need to be implemented on the backend
    console.log("Delete journey:", journeyId);
    // For now, just remove from local state
    setJourneys(prev => prev.filter(j => j._id !== journeyId));
  };

  const handleToggleActive = async (journeyId: string, active: boolean) => {
    // Note: The API doesn't seem to have an update endpoint yet
    // This would need to be implemented on the backend
    console.log("Toggle active:", journeyId, active);
    
    // For now, just update local state
    setJourneys(prev => prev.map(j => 
      j._id === journeyId ? { ...j, active } : j
    ));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          title="My Journeys" 
          actions={
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
            >
              Create Journey
            </button>
          }
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <JourneyList 
              journeys={journeys}
              isLoading={isLoading}
              onDelete={handleDeleteJourney}
              onToggleActive={handleToggleActive}
              onRefresh={loadJourneys}
            />
          </div>
        </main>

        {isCreateModalOpen && (
          <CreateJourneyModal
            onConfirm={handleCreateJourney}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}