import Link from "next/link";
import { ProcessedMarker } from "./utils/journey-routes";
import { User } from "kairos-api-client-ts";

interface NearbyMarkerModalProps {
  marker: ProcessedMarker;
  onClose: () => void;
  ownerInfo?: User | null;
  loading?: boolean;
}

export function NearbyMarkerModal({
  marker,
  onClose,
  ownerInfo,
  loading = false,
}: NearbyMarkerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
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
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  @{ownerInfo.name}
                </Link>
                {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  from "{ownerInfo.journey_name}"
                </p> */}
              </div>
            )}
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3">
          <p className="capitalize">Type: {marker.marker_type}</p>
          {marker.notes && <p>{marker.notes}</p>}
          {marker.timestamp && (
            <p>{`Date: ${marker.timestamp}`}</p>
          )}
          {marker.estimated_time && (
            <p>{`ETA: ${marker.estimated_time}`}</p>
          )}
          <p className="text-sm font-mono">
            {marker.coordinates.coordinates[1].toFixed(6)},{" "}
            {marker.coordinates.coordinates[0].toFixed(6)}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This point belongs to another user&#39;s journey
          </p>
        </div>
      </div>
    </div>
  );
}