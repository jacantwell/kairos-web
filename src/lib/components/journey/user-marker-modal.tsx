// src/lib/components/journey/user-marker-modal.tsx
import { ProcessedMarker } from "./utils/journey-routes";
import { useState } from "react";
import { UpdateUserMarkerModal } from "./update-user-marker-modal.tsx";
import { Marker } from "kairos-api-client-ts";
import { usePositionSelection

 } from "@/lib/api/hooks/use-position-selection";
interface UserMarkerModalProps {
  marker: ProcessedMarker;
  onClose: () => void;
  onUpdate: (id: string, updatedMarker: Marker) => void;
  onDelete: (markerId: string) => void;
  onMapClick?: (lng: number, lat: number) => void;
}

export function UserMarkerModal({
  marker,
  onClose,
  onUpdate,
  onDelete,
}: UserMarkerModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    isSelectingPosition,
    pendingPosition,
    startPositionSelection,
    cancelPositionSelection,
    confirmPosition,
  } = usePositionSelection();

  const handleDelete = () => {
    if (marker._id) {
      onDelete(marker._id);
    }
  };

  const handleUpdate = () => {
    if (marker._id) {
      setIsUpdating(true);
    }
  };

  const handleStartPositionSelection = () => {
    onClose();
    startPositionSelection();
  };

  const handleConfirmPosition = () => {
    const position = confirmPosition();
    return position;
  };

  const handleCancelAndClose = () => {
    setIsUpdating(false);
    cancelPositionSelection();
    onClose();
  };

  return isUpdating ? (
    <UpdateUserMarkerModal
      marker={marker}
      onCancel={handleCancelAndClose}
      onConfirm={(id, updatedMarker) => {
        if (marker._id) {
          onUpdate(marker._id, updatedMarker);
        }
        handleCancelAndClose();
      }}
      onStartPositionSelection={handleStartPositionSelection}
      newPosition={pendingPosition}
    />
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{marker.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <p className="capitalize">
            <span className="font-medium">Type:</span> {marker.marker_type}
          </p>
          {marker.notes && (
            <p>
              <span className="font-medium">Notes:</span> {marker.notes}
            </p>
          )}
          {marker.timestamp && (
            <p>
              <span className="font-medium">Date:</span> {marker.timestamp}
            </p>
          )}
          {marker.estimated_time && (
            <p>
              <span className="font-medium">ETA:</span> {marker.estimated_time}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">Location:</span>
            <br />
            <span className="font-mono text-gray-600">
              {marker.coordinates.coordinates[1].toFixed(6)},{" "}
              {marker.coordinates.coordinates[0].toFixed(6)}
            </span>
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 px-4 py-2 bg-primary-green-500 text-white rounded-lg hover:bg-primary-green-600 transition-colors"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}