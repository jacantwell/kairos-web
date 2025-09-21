import { ProcessedMarker } from "./utils/journey-routes";
import { useState } from "react";
import { UpdateUserMarkerModal } from "./update-user-marker-modal.tsx";
import { Marker } from "kairos-api-client-ts";
interface UserMarkerModalProps {
  marker: ProcessedMarker;
  onClose: () => void;
  onUpdate: (id: string, updatedMarker: Marker) => void;
  onDelete: (markerId: string) => void;
}

export function UserMarkerModal({
  marker,
  onClose,
  onUpdate,
  onDelete,
}: UserMarkerModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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

  return isUpdating ? (
    <UpdateUserMarkerModal
      marker={marker}
      onCancel={() => setIsUpdating(false)}
      onConfirm={(id, updatedMarker) => {
        if (marker._id) {
          onUpdate(marker._id, updatedMarker);
        }
        setIsUpdating(false);
        onClose();
      }}
    />
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{marker.name}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          <p className="capitalize">Type: {marker.marker_type}</p>
          {marker.notes && <p>{marker.notes}</p>}
          {marker.timestamp && <p>{`Date: ${marker.timestamp}`}</p>}
          {marker.estimated_time && <p>{`ETA: ${marker.estimated_time}`}</p>}
          <p className="text-sm font-mono">
            {marker.coordinates.coordinates[1].toFixed(6)},{" "}
            {marker.coordinates.coordinates[0].toFixed(6)}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpdate}
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
