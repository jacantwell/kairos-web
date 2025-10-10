import { useState } from "react";
import { Marker, Coordinates } from "kairos-api-client-ts";
import { MarkerMarkerTypeEnum } from "kairos-api-client-ts";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";

interface AddPointModalProps {
  coordinates: number[];
  onConfirm: (point: Marker) => void;
}

export function AddPointModal({ coordinates, onConfirm }: AddPointModalProps) {
  const { activeJourney } = useJourneys();
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    type: "plan",
    name: "",
    notes: "",
    estimateTime: "",
    timestamp: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      const newPoint: Marker = {
        name: formData.name.trim(),
        journey_id: activeJourney?._id || "",
        notes: formData.notes.trim(),
        coordinates: { type: "Point", coordinates } as Coordinates,
        marker_type: formData.type as MarkerMarkerTypeEnum,
        estimated_time:
          formData.type === "plan" ? formData.estimateTime.trim() : undefined,
        timestamp:
          formData.type === "past" ? formData.timestamp.trim() : undefined,
      };

      onConfirm(newPoint);
      closeModal();
    } catch (error) {
      console.error("Error creating point:", error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pointTypeOptions = [
    { value: "plan", label: "Plan" },
    { value: "past", label: "Past" },
  ];

  const [longitude, latitude] = coordinates; // Note: GeoJSON format is [lng, lat]

  return (
    <Modal isOpen={true}>
      <Modal.Header onClose={closeModal}>Add Journey Point</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Point Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500"
              placeholder="Enter a name for this point"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Point Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500"
              disabled={isSubmitting}
            >
              {pointTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.type === "plan" && (
            <div>
              <label
                htmlFor="estimateTime"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ETA
              </label>
              <input
                type="Date"
                id="estimateTime"
                name="estimateTime"
                value={formData.estimateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500"
                disabled={isSubmitting}
              />
            </div>
          )}
          {formData.type === "past" && (
            <div>
              <label
                htmlFor="timestamp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date
              </label>
              <input
                type="Date"
                id="timestamp"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green-500 focus:border-primary-green-500"
              placeholder="Optional notes"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Location:</strong>
            </p>
            <p className="text-sm font-mono text-gray-700">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          <Modal.Footer>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600"
            >
              Confirm
            </button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
