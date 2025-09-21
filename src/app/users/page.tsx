"use client";

import { AuthGuard } from "@/lib/components/auth";
import { Navigation } from "@/lib/components/navigation";
import { JourneyMap } from "@/lib/components/journey/map";
import { useApi } from "@/lib/api/hooks/use-api";
import { useState, useEffect } from "react";
import { User, Journey, Marker } from "kairos-api-client-ts";
import { LoadingScreen, LoadingSpinner } from "@/lib/components/ui/loading";
import { MapPin, Phone, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


function UserProfile() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const api = useApi();

  const [user, setUser] = useState<User | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeyMarkers, setJourneyMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingJourney, setIsLoadingJourney] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        const userResponse = await api.users.getUserByIdApiV1UsersUserIdGet(userId);
        if (userResponse.status !== 200 || !userResponse.data) {
          throw new Error("User not found");
        }
        setUser(userResponse.data);

        // Active journey
        setIsLoadingJourney(true);
        try {
          const journeyResponse =
            await api.users.getActiveJourneyApiV1UsersUserIdJourneysActiveGet(userId);

          if (journeyResponse.status === 200 && journeyResponse.data) {
            setActiveJourney(journeyResponse.data);

            if (journeyResponse.data._id) {
              const markersResponse =
                await api.journeys.getJourneyMarkersApiV1JourneysJourneyIdMarkersGet(
                  journeyResponse.data._id
                );
              if (markersResponse.status === 200 && markersResponse.data) {
                setJourneyMarkers(markersResponse.data);
              }
            }
          }
        } catch {
          // no active journey
        } finally {
          setIsLoadingJourney(false);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user profile. The user might not exist or be private.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, api]);

  // Show loading screen while fetching initial data
  if (isLoading) {
    return (
      <AuthGuard>
        <LoadingScreen message="Loading user profile..." />
      </AuthGuard>
    );
  }

  // Show error if user fetch failed
  if (error || !user) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Profile Not Found
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <main className="max-w-4xl mx-auto py-4 px-4 sm:py-6 sm:px-6">
          {/* User Info Section */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 sm:p-6">
              <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-primary-green-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* User Details */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {user.name}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
                    Bikepacker
                  </p>

                  {/* User Badges */}
                  <div className="flex items-center space-x-3 mt-2 sm:mt-3">
                    {activeJourney && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                        On Journey
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(user.country || user.phonenumber || user.instagram) && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                    {user.country && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.country}</span>
                      </div>
                    )}

                    {user.phonenumber && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.phonenumber}</span>
                      </div>
                    )}

                    {user.instagram && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          role="img"
                          className="w-4 h-4 mr-2 flex-shrink-0"
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
                          className="truncate hover:text-primary-green-600 transition-colors"
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

          {/* Active Journey Section */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Journey
                </h2>
                {isLoadingJourney && <LoadingSpinner size="sm" />}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {activeJourney ? (
                <div className="space-y-4">
                  {/* Journey Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {activeJourney.name}
                    </h3>
                    {activeJourney.description && (
                      <p className="text-gray-600 mt-1">
                        {activeJourney.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {journeyMarkers.length} point
                        {journeyMarkers.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(
                          activeJourney.created_at || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Journey Map */}
                  {journeyMarkers.length > 0 && (
                    <div>
                      <JourneyMap
                        journeyMarkers={journeyMarkers}
                        nearbyJourneyMarkers={[]}
                        isAddingPoint={false}
                        onAddPoint={() => {}} // No-op for view-only
                        onDeletePoint={() => {}} // No-op for view-only
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
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
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No Active Journey
                  </h3>
                  <p className="text-xs text-gray-500">
                    {user.name} is not currently on a journey
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <UserProfile />
    </Suspense>
  );
}