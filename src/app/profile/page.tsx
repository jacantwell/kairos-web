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
import { Phone, MapPin } from "lucide-react";

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
        await api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(
          activeJourney?._id || ""
        );
      }

      // Set the selected journey as active
      const response =
        await api.journeys.toggleActiveJourneyApiV1JourneysJourneyIdActivePatch(
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
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
                            Journey{journeys.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {activeJourney && (
                          <div className="text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Active Journey
                            </span>
                          </div>
                        )}

                        {user?.is_verified && (
                          <div className="text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
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
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
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
                            <MapPin className="w-4 h-4 mr-2" />
                          {user.country}
                        </div>
                      )}

                      {user?.phonenumber && (
                        <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                          {user.phonenumber}
                        </div>
                      )}

                      {user?.instagram && (
                        <div className="flex items-center text-gray-600">
                          <svg
                            role="img"
                            className="w-4 h-4 mr-2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#4a5565"
                          >
                            <title>Instagram</title>
                            <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                          </svg>
                          <a
                            href={`https://instagram.com/${user.instagram.replace(
                              /^@/,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            @{user.instagram.replace(/^@/, "")}
                          </a>
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
                <h2 className="text-lg font-semibold text-gray-900">
                  My Journeys
                </h2>
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
