import { ProcessedMarker } from "./utils/journey-routes";
import { useState } from "react";
import { Marker, Coordinates } from "kairos-api-client-ts";
import { MarkerMarkerTypeEnum } from "kairos-api-client-ts";
import { Marker as MapMarker } from "react-map-gl/mapbox";
import { useCallback } from "react";
import { MapLayerMouseEvent, MapLayerTouchEvent } from "react-map-gl/maplibre";
import Map, {
  NavigationControl,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";
import {
  FormInput,
  FormLabel,
  FormTextarea,
  FormSelect,
  FormField,
} from "@/lib/components/ui/form";

interface UpdateUserMarkerModalProps {
  marker: ProcessedMarker;
  onConfirm: (id: string, updatedMarker: Marker) => void;
}

export function UpdateUserMarkerModal({
  marker,
  onConfirm,
}: UpdateUserMarkerModalProps) {
  const [formData, setFormData] = useState({
    ...marker,
    estimated_time:
      marker.estimated_time?.trim() || marker.timestamp?.trim() || "",
    timestamp: marker.timestamp?.trim() || marker.estimated_time?.trim() || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeModal } = useModal();

  const [cursor, setCursor] = useState<string>("auto");
  const [newPosition, setNewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isPickingPosition, setIsPickingPosition] = useState(false);
  const [currentViewState, setCurrentViewState] = useState<ViewState>({
    longitude: marker.coordinates.coordinates[0],
    latitude: marker.coordinates.coordinates[1],
    zoom: 2,
    bearing: 0,
    pitch: 0,
    padding: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  const [longitude, latitude] = newPosition
    ? [newPosition.lng, newPosition.lat]
    : marker.coordinates.coordinates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    try {
      const updatedMarker: Marker = {
        name: formData.name.trim(),
        journey_id: marker.journey_id,
        notes: formData.notes?.trim(),
        coordinates: {
          type: "Point",
          coordinates: [longitude, latitude],
        } as Coordinates,
        marker_type: formData.marker_type as MarkerMarkerTypeEnum,
        estimated_time:
          formData.marker_type === "plan" ? formData.estimated_time : undefined,
        timestamp:
          formData.marker_type === "past" ? formData.timestamp : undefined,
      };

      onConfirm(marker._id || "", updatedMarker);
      closeModal();
    } catch (error) {
      console.error("Error updating point:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle map click for adding points
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
      if (!isPickingPosition) return;
      const { lng, lat } = event.lngLat;
      setNewPosition({ lat, lng });
    },
    [isPickingPosition]
  );

  // Mouse cursor
  const handleMouseMove = useCallback(() => {
    setCursor(isPickingPosition ? "crosshair" : "auto");
  }, [isPickingPosition]);

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

  return (
    <Modal isOpen={true}>
      {/* --- Position Picker Overlay --- */}
      {isPickingPosition && (
        <div className="absolute inset-0 z-50 flex flex-col">
          {/* Banner */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Select new position
              </div>
            </div>
          </div>

          {/* Map takes full space */}
          <div className="flex-1">
            <Map
              {...currentViewState}
              onMove={(evt: ViewStateChangeEvent) =>
                setCurrentViewState(evt.viewState)
              }
              mapStyle="mapbox://styles/mapbox/outdoors-v12"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              onClick={handleMapClick}
              onMouseMove={handleMouseMove}
              cursor={cursor}
            >
              {newPosition && (
                <MapMarker
                  longitude={newPosition.lng}
                  latitude={newPosition.lat}
                  anchor="center"
                >
                  <div className="relative">
                    {/* Pin body */}
                    <div
                      className={`
              flex items-center justify-center text-white font-bold text-xs
              transition-all duration-200`}
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "white",
                        border: "3px solid green",
                        borderRadius: "50% 50% 50% 0",
                        transform: "rotate(-45deg)",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Inner content */}
                      <div
                        style={{
                          transform: "rotate(45deg)",
                          color: "green",
                          fontSize: "12px",
                        }}
                      >
                        {marker.marker_type === "past"
                          ? "●"
                          : marker.segmentType === "transition"
                          ? "→"
                          : "○"}
                      </div>
                    </div>
                  </div>{" "}
                </MapMarker>
              )}
              <NavigationControl position="top-right" />
            </Map>
          </div>

          {/* Confirm / Cancel buttons */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-3">
            <button
              onClick={() => setIsPickingPosition(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg shadow"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsPickingPosition(false)}
              className="px-4 py-2 bg-primary-green-500 text-white rounded-lg shadow"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* --- Modal Content --- */}
      <Modal.Header onClose={closeModal}>Update Journey Point</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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

          {/* Type */}
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
              {pointTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </FormSelect>
          </FormField>

          {/* Time fields */}
          {formData.marker_type === "plan" && (
            <FormField>
              <FormLabel htmlFor="estimated_time" required>
                Estimated Arrival
              </FormLabel>
              <FormInput
                id="estimated_time"
                type="Date"
                name="estimated_time"
                value={formData.estimated_time || ""}
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
                value={formData.timestamp || ""}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </FormField>
          )}

          {/* Notes */}
          <FormField>
            <FormLabel htmlFor="notes">Notes</FormLabel>
            <FormTextarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Optional notes"
              disabled={isSubmitting}
            />
          </FormField>

          {/* Location */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm">
                <strong>Location:</strong>
              </p>
              <button
                type="button"
                onClick={() => setIsPickingPosition(true)}
                className="text-xs text-blue-500 underline"
              >
                Change Position
              </button>
            </div>
            <p className="text-sm font-mono">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            {newPosition && (
              <p className="text-xs text-green-600">✓ New position selected</p>
            )}
          </div>

          {/* Actions */}
          <Modal.Footer>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Point"}
            </button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
}
