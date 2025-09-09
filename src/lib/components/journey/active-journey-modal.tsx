// kairos/src/lib/components/journey/active-journey-modal.tsx
import { useState } from "react";
import { Journey } from "kairos-api-client-ts";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { ActiveJourneyCard } from "./active-journey-card";

interface ActiveJourneyModalProps {
  onCancel: () => void;
  onConfirm: (journeyId: string) => Promise<void>;
}

export function ActiveJourneyModal({ onCancel, onConfirm }: ActiveJourneyModalProps) {
  const { journeys } = useJourneys();
  const [selected, setSelected] = useState<Journey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const filteredJourneys = journeys.filter(journey => {
  //   // if (filter === 'active') return journey.active;
  //   // if (filter === 'inactive') return !journey.active;
  //   // return !journey.completed    // TODO
  //   return true;
  // });

  const handleConfirm = async () => {
    if (!selected?._id) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selected._id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select your active journey
          </h3>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {journeys.length > 0 ? (
          <div className="grid gap-4">
            {journeys.map((journey) => (
              <ActiveJourneyCard
                key={journey._id}
                journey={journey}
                selected={selected?._id === journey._id}
                onSelect={setSelected}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No journeys found.</p>
        )}

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !selected}
            className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
