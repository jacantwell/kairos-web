"use client";

import { AuthGuard } from "@/lib/components/auth";
import { JourneyList } from "@/lib/components/journey/journey-list";
import { CreateJourneyModal } from "@/lib/components/journey/create-journey-modal";
import { ActiveJourneyModal } from "@/lib/components/journey/active-journey-modal";
import { Navigation } from "@/lib/components/navigation";
import { useSession } from "@/lib/context/session";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { useApi } from "@/lib/api/hooks/use-api";
import { useState } from "react";
import { Journey } from "kairos-api-client-ts";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useSession();
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
        active: false,
        created_at: new Date().toISOString(),
      };

      const response = await api.journeys.createJourneyApiV1JourneysPost(
        newJourney
      );

      if (response.data) {
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
      removeJourney(journeyId);

      const response =
        await api.journeys.deleteJourneyApiV1JourneysJourneyIdDelete(journeyId);

      if (response.status !== 200) {
        setError("Failed to delete journey");
        refreshJourneys();
        return;
      }

      console.log("Journey deleted successfully:", journeyId);
    } catch (err) {
      console.error("Failed to delete journey:", err);
      setError("Failed to delete journey");
      refreshJourneys();
    }
  };

  const handleToggleActive = async (journeyId: string, active: boolean) => {
    try {
      setError(null);

      const journeyToUpdate = journeys.find((j) => j._id === journeyId);
      if (!journeyToUpdate) return;

      const updatedJourney = { ...journeyToUpdate, active };
      updateJourney(updatedJourney);

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

  const displayError = error || journeysError;

  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return "Recently joined";
    return `Joined ${new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })}`;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          title="My Profile"
          actions={
            <div className="hidden md:flex space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors text-sm font-medium"
              >
                Create Journey
              </button>
              <button
                onClick={() => setIsActiveModalOpen(true)}
                className="px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors text-sm font-medium"
              >
                Active Journey
              </button>
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          }
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* User Info Section */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 bg-primary-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-green-600">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* User Details */}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user?.name}
                      </h1>
                      <p className="text-gray-600 mt-1">{user?.email}</p>
                      
                      {/* User Stats */}
                      <div className="flex items-center space-x-6 mt-3">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            {journeys.length}
                          </span>
                          <span className="text-gray-500 ml-1">
                            Journey{journeys.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {activeJourney && (
                          <div className="text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Active Journey
                            </span>
                          </div>
                        )}

                        {user?.is_verified && (
                          <div className="text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings Button - Mobile */}
                  <div className="md:hidden">
                    <Link
                      href="/settings"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Settings"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Additional Info */}
                {(user?.country || user?.phonenumber || user?.instagram) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      {user?.country && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {user.country}
                        </div>
                      )}
                      
                      {user?.phonenumber && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {user.phonenumber}
                        </div>
                      )}
                      
                      {user?.instagram && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.648.001 12.017.001zM8.449 20.252c-3.299-2.143-5.474-5.859-5.474-10.064 0-1.069.138-2.107.395-3.086.333.725.735 1.574 1.218 2.534.394.782.851 1.623 1.367 2.518-.473.718-.918 1.392-1.313 2.021-.395.629-.737 1.201-1.009 1.714.577 1.866 1.607 3.532 2.816 4.363zm4.018-2.417c-.686.299-1.35.457-1.968.457-.618 0-1.282-.158-1.968-.457.686-1.466 1.35-3.185 1.968-5.115.618 1.93 1.282 3.649 1.968 5.115zm5.458-6.778c-.473-.718-.918-1.392-1.313-2.021-.395-.629-.737-1.201-1.009-1.714-.577-1.866-1.607-3.532-2.816-4.363 3.299 2.143 5.474 5.859 5.474 10.064 0 1.069-.138 2.107-.395 3.086-.333-.725-.735-1.574-1.218-2.534-.394-.782-.851-1.623-1.367-2.518z"/>
                          </svg>
                          @{user.instagram}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="md:hidden mb-6 flex space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors text-sm font-medium"
              >
                Create Journey
              </button>
              <button
                onClick={() => setIsActiveModalOpen(true)}
                className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors text-sm font-medium"
              >
                Active Journey
              </button>
            </div>

            {/* Error Display */}
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

            {/* Journeys Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Journeys</h2>
              </div>
              
              <div className="p-6">
                <JourneyList
                  journeys={journeys}
                  isLoading={isJourneysLoading}
                  onDelete={handleDeleteJourney}
                  onToggleActive={handleToggleActive}
                  onRefresh={handleRefresh}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
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