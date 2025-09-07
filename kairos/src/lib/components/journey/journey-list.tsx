// kairos/src/lib/components/journey/journey-list.tsx
import { useState } from "react";
import { Journey } from "kairos-api-client-ts";
import { JourneyCard } from "./journey-card";

interface JourneyListProps {
  journeys: Journey[];
  isLoading: boolean;
  onDelete: (journeyId: string) => Promise<void>;
  onToggleActive: (journeyId: string, active: boolean) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function JourneyList({ 
  journeys, 
  isLoading, 
  onDelete, 
  onToggleActive,
  onRefresh 
}: JourneyListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'name'>('created');

  // Filter journeys
  const filteredJourneys = journeys.filter(journey => {
    if (filter === 'active') return journey.active;
    if (filter === 'inactive') return !journey.active;
    return true;
  });

  // Sort journeys
  const sortedJourneys = [...filteredJourneys].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    // Sort by created date (newest first)
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-primary-green-500" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-600">Loading journeys...</span>
        </div>
      </div>
    );
  }

  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys yet</h3>
          <p className="text-gray-500 mb-4">
            Start planning your next bikepacking adventure by creating your first journey.
          </p>
          <button
            onClick={onRefresh}
            className="text-primary-green-600 hover:text-primary-green-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({journeys.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === 'active' 
                    ? 'bg-primary-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({journeys.filter(j => j.active).length > 0 ? '1' : '0'})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === 'inactive' 
                    ? 'bg-primary-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive ({journeys.filter(j => !j.active).length})
              </button>
            </div>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created' | 'name')}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500"
            >
              <option value="created">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Journey cards */}
      {sortedJourneys.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedJourneys.map((journey) => (
            <JourneyCard
              key={journey._id}
              journey={journey}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No journeys match the current filter.</p>
        </div>
      )}
    </div>
  );
}