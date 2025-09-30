import { Journey } from "kairos-api-client-ts";

interface ActiveJourneyCardProps {
  journey: Journey;
  selected: boolean;
  onSelect: (journey: Journey) => void;
}

export function ActiveJourneyCard({
  journey,
  selected,
  onSelect,
}: ActiveJourneyCardProps) {
  if (journey.active) {
    return (
      <div className="w-full text-left p-4 rounded-lg border transition-colors border-gray-200 hover:border-primary-green-300">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {journey.name}
        </h3>
        {journey.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {journey.description}
          </p>
        )}
        {/* Active icon */}
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              journey.active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <>
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
              Active
            </>
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <button
        type="button"
        onClick={() => onSelect(journey)}
        className={`w-full text-left p-4 rounded-lg border transition-colors ${
          selected
            ? "border-primary-green-500 bg-primary-green-50"
            : "border-gray-200 hover:border-primary-green-300"
        }`}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {journey.name}
        </h3>
        {journey.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {journey.description}
          </p>
        )}
      </button>
    );
  }
}
