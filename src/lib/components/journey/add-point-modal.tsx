import { useState } from "react";
import { Marker, Coordinates } from "kairos-api-client-ts";
import { MarkerMarkerTypeEnum } from "kairos-api-client-ts";
import { useJourneys } from "@/lib/api/hooks/use-journeys";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";
import {
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/lib/components/ui/form";

interface AddPointModalProps {
  coordinates: number[];
  onConfirm: (point: Marker) => void;
}

export function AddPointModal({ coordinates, onConfirm }: AddPointModalProps) {
  const { activeJourneyQuery } = useJourneys();
  const { closeModal } = useModal();
  const [formData, setFormData] = useState({
    marker_type: "plan",
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
        journey_id: activeJourneyQuery.data?._id || "",
        notes: formData.notes.trim(),
        coordinates: { type: "Point", coordinates } as Coordinates,
        marker_type: formData.marker_type as MarkerMarkerTypeEnum,
        estimated_time:
          formData.marker_type === "plan" ? formData.estimateTime.trim() : undefined,
        timestamp:
          formData.marker_type === "past" ? formData.timestamp.trim() : undefined,
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
          <FormField>
            <FormLabel htmlFor="name" required>
              Point Name
            </FormLabel>
            <FormInput
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter a name for this point"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField>
            <FormLabel htmlFor="marker_type" required>
              Point Type
            </FormLabel>
            <FormSelect
              id="marker_type"
              name="marker_type"
              value={formData.marker_type}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              {" "}
              {pointTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          </FormField>

          {formData.marker_type === "plan" && (
            <FormField>
              <FormLabel htmlFor="estimateTime" required>
                Estimated Arrival
              </FormLabel>
              <FormInput
                id="estimatedTime"
                type="Date"
                name="estimateTime"
                value={formData.estimateTime}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </FormField>
          )}
          {formData.marker_type === "past" && (
            <FormField>
              <FormLabel htmlFor="timestamp" required>
                Date
              </FormLabel>
              <FormInput
                id="timestamp"
                type="Date"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </FormField>
          )}

          <FormField>
            <FormLabel htmlFor="notes">Notes</FormLabel>
            <FormTextarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Optional notes"
              disabled={isSubmitting}
            />
          </FormField>

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
              disabled={isSubmitting || !formData.name.trim() || !(formData.marker_type === "plan" ? formData.estimateTime.trim() : formData.marker_type === "past" ? formData.timestamp.trim() : true)}
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 disabled:opacity-50"
            >
              Confirm
            </button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
