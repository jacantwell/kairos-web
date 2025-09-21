"use-client";

import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { LoadingCard } from "../ui/loading";
import { MapPinPlusInside, CircleX } from "lucide-react";
interface ActiveJourneyBannerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ActiveJourneyBanner({
  isAddingPoint,
  setIsAddingPoint,
}: ActiveJourneyBannerProps) {
  const { activeJourney, isJourneysLoading, isMarkersLoading } = useJourneys();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const startDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Started today";
    if (diffDays === 1) return "Started yesterday";
    if (diffDays > 0) return `Started ${diffDays} days ago`;
    return `Starts in ${Math.abs(diffDays)} days`;
  };

  if (isJourneysLoading) {
    return <LoadingCard />;
  } else if (!isJourneysLoading && !activeJourney) {
    return (
      <div className="bg-gradient-to-r from-primary-green-500 to-primary-green-600 text-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0"></div>
            <h1>No active journey</h1>
          </div>
        </div>
      </div>
    );
  } else if (activeJourney) {
    return (
      <div className="bg-primary-green-500 text-white rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Active badge and title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-green-100 text-sm font-medium uppercase tracking-wide">
                    Active Journey
                  </span>
                </div>
                <div className="h-4 w-px bg-green-300"></div>
                <span className="text-green-100 text-sm">
                  {getDaysAgo(activeJourney.created_at || "")}
                </span>
              </div>

              {/* Journey name */}
              <h2 className="text-xl font-bold text-white mb-2 truncate">
                {activeJourney.name}
              </h2>

              {/* Journey details */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-green-100">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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
                  <span className="text-sm">
                    Started {formatDate(activeJourney.created_at || "")}
                  </span>
                </div>
              </div>

              {/* Description */}
              {activeJourney.description && (
                <p className="mt-3 text-green-50 text-sm leading-relaxed line-clamp-2">
                  {activeJourney.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() => setIsAddingPoint(!isAddingPoint)}
                  className={`flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium ${
                    isAddingPoint
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-primary-green-500 text-white hover:bg-primary-green-600"
                  }`}
                >
                  {isMarkersLoading ? (
                    <div className="p-1">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent border-b-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : isAddingPoint ? (
                    <div className="flex items-center">
                      <CircleX />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MapPinPlusInside />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator (optional - could show journey progress) */}
        <div className="h-1 bg-gradient-to-r from-green-300 via-green-200 to-green-300 opacity-50"></div>
      </div>
    );
  }
}
