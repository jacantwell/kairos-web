// kairos/src/lib/components/journey/add-point-modal.tsx
import { useState } from "react";
import { Marker, Coordinates } from "kairos-api-client-ts";
import { MarkerMarkerTypeEnum } from "kairos-api-client-ts";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { MapPinPen } from "lucide-react";
interface AddPointModalProps {
  coordinates: number[]
  onConfirm: (point: Marker) => void;
  onCancel: () => void;
}

export function AddPointModal({
  coordinates,
  onConfirm,
  onCancel,
}: AddPointModalProps) {
  const { activeJourney } = useJourneys();

  const [formData, setFormData] = useState({
    type: "plan",
    name: "",
    notes: "",
    estimateTime: "",
    arrival: Date.now().toString().slice(0, 10), // YYYY-MM-DD
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    // setIsSubmitting(true);

    try {
      const newPoint: Marker = {
        name: formData.name.trim(),
        journey_id: activeJourney?._id || "",
        notes: formData.notes.trim(),
        coordinates: {type: "Point", coordinates} as Coordinates,
        marker_type: formData.type as MarkerMarkerTypeEnum,
        estimated_time: formData.type === 'plan' ? formData.estimateTime.trim() : undefined,
        timestamp: formData.type === 'past' ? new Date(formData.arrival).toDateString() : undefined,
      };

      onConfirm(newPoint);
      onCancel()  // Closes the modal
    } catch (error) {
      console.error('Error creating point:', error);
      // Handle error - you might want to show an error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const pointTypeOptions = [
    { value: 'plan', label: 'Plan', },
    { value: 'past', label: 'Past' },
  ];

  const [latitude, longitude] = coordinates; // Note: GeoJSON format is [lng, lat]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Add Journey Point</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Point Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Enter a name for this point"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Point Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              disabled={isSubmitting}
            >
              {pointTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {(formData.type === 'plan') && (
            <div>
              <label htmlFor="estimateTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ETA
              </label>
              <input
                type="Date"
                id="estimateTime"
                name="estimateTime"
                value={formData.estimateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="e.g., 2 hours, 30 mins"
                disabled={isSubmitting}
              />
            </div>
          )}
          {(formData.type === 'past') && (
            <div>
              <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                id="arrival"
                name="arrival"
                value={formData.arrival}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Optional notes"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Location:</strong>
            </p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                  Adding...
                </>
              ) : (
                'Add Point'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}