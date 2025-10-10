import Link from "next/link";
import { ProcessedMarker } from "./utils/journey-routes";
import { Modal } from "@/lib/components/ui/modal";
import { useModal } from "@/lib/hooks/ui/use-modal";
import { useApi } from "@/lib/api/hooks/use-api";
import { useState, useEffect } from "react";
import { User } from "kairos-api-client-ts";

interface NearbyMarkerModalProps {
  marker: ProcessedMarker;
}

export function NearbyMarkerModal({ marker }: NearbyMarkerModalProps) {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<User | null>(null);
  const api = useApi();

  useEffect(() => {
    setLoading(true);
    api.users
      .getUserByIdApiV1UsersUserIdGet(marker.owner_id!)
      .then((response) => {
        if (response.status === 200 && response.data) {
          setOwnerInfo(response.data);
        } else {
          setOwnerInfo(null);
        }
      })
      .catch(() => setOwnerInfo(null))
      .finally(() => setLoading(false));
  }, [marker, api.users]);

  return (
    <Modal isOpen={true}>
      <Modal.Header onClose={closeModal}>
        <h3 className="text-lg font-semibold">{marker.name}</h3>

        {loading && (
          <div className="mt-1">
            <p className="text-sm text-gray-500">Loading user info...</p>
          </div>
        )}
        {ownerInfo && !loading && (
          <div className="mt-1">
            <Link
              href={`/users/?id=${ownerInfo._id}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              @{ownerInfo.name}
            </Link>
          </div>
        )}
      </Modal.Header>

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
          onClick={closeModal}
          className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Close
        </button>
        {ownerInfo && !loading && (
          <Link
            href={`/profile/${ownerInfo._id}`}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center"
          >
            View Profile
          </Link>
        )}
      </div>

      {/* Additional info for nearby markers */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          This point belongs to another user&#39;s journey
        </p>
      </div>
    </Modal>
  );
}
