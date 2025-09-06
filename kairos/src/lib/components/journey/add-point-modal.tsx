// kairos/src/lib/components/journey/add-point-modal.tsx
import { useState } from "react";
import { JourneyPoint } from "@/app/home/page";

interface AddPointModalProps {
  latitude: number;
  longitude: number;
  onConfirm: (point: JourneyPoint) => void;
  onCancel: () => void;
}

export function AddPointModal({
  latitude,
  longitude,
  onConfirm,
  onCancel,
}: AddPointModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "waypoint" as JourneyPoint['type'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newPoint: JourneyPoint = {
        id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        description: formData.description.trim(),
        latitude,
        longitude,
        type: formData.type,
        dateAdded: new Date(),
      };

      onConfirm(newPoint);
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
    { value: 'waypoint', label: 'Waypoint', icon: '📍' },
    { value: 'camp', label: 'Campsite', icon: '🏕️' },
    { value: 'food', label: 'Food/Restaurant', icon: '🍽️' },
    { value: 'water', label: 'Water Source', icon: '💧' },
    { value: 'repair', label: 'Bike Repair', icon: '🔧' },
    { value: 'scenic', label: 'Scenic View', icon: '📷' },
  ];

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
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="Optional description or notes"
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