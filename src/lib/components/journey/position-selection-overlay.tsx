import { Marker } from 'react-map-gl/mapbox';

interface PositionSelectionOverlayProps {
  isSelecting: boolean;
  pendingPosition?: { lat: number; lng: number } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PositionSelectionOverlay({
  isSelecting,
  pendingPosition,
  onConfirm,
  onCancel,
}: PositionSelectionOverlayProps) {
  if (!isSelecting && !pendingPosition) return null;

  return (
    <>
      {/* Mode indicator */}
      {isSelecting && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Click on the map to set new position
              <button
                onClick={onCancel}
                className="ml-2 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary marker for pending position */}
      {pendingPosition && (
        <Marker
          longitude={pendingPosition.lng}
          latitude={pendingPosition.lat}
          anchor="bottom"
        >
          <div className="relative">
            {/* Pulsing temporary marker */}
            <div className="relative">
              <div
                className="flex items-center justify-center text-white font-bold text-xs animate-pulse"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#3B82F6',
                  border: '3px solid white',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ transform: 'rotate(45deg)', fontSize: '12px' }}>
                  📍
                </div>
              </div>
              
              {/* Pulse animation */}
              <div
                className="absolute top-0 left-0 animate-ping"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  opacity: 0.4,
                }}
              />
            </div>
          </div>
        </Marker>
      )}

      {/* Confirmation dialog for pending position */}
      {pendingPosition && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Use this position?
            </span>
            <div className="flex gap-2">
              <button
                onClick={onConfirm}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}