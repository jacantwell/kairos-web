import { ProcessedMarker } from "./utils/journey-routes";
import { Marker } from "kairos-api-client-ts";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";

interface UserMarkerModalProps {
  marker: ProcessedMarker;
  onUpdate: (id: string, updatedMarker: Marker) => void;
  onDelete: (markerId: string) => void;
}

export function UserMarkerModal({
  marker,
  onUpdate,
  onDelete,
}: UserMarkerModalProps) {
  const { closeModal } = useModal();
  const handleDelete = () => {
    if (marker._id) {
      onDelete(marker._id);
    }
  };

  const handleUpdate = () => {
    onUpdate(marker._id!, marker);
  };

  return (
    <Modal isOpen={true}>
      <Modal.Header onClose={closeModal}>{marker.name}</Modal.Header>
      <Modal.Body>
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

        <Modal.Footer>
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
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}
