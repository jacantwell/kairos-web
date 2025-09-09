// kairos/src/lib/components/journey/journey-map.tsx
import { useState, useEffect, useCallback } from "react";
import Map, {
  NavigationControl,
  Marker,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { AddPointModal } from "./add-point-modal";
import { MapLayerMouseEvent, MapLayerTouchEvent } from "react-map-gl/maplibre";
import { Marker as MarkerType } from "kairos-api-client-ts";

interface JourneyMapProps {
  journeyMarkers: MarkerType[];
  isAddingPoint: boolean;
  onAddPoint: (point: MarkerType) => void;
  onDeletePoint: (id: string) => void;
}

export function JourneyMap({
  journeyMarkers,
  isAddingPoint,
  onAddPoint,
  onDeletePoint,
}: JourneyMapProps) {
  const [currentViewState, setCurrentViewState] = useState<ViewState>({
    longitude: 0,
    latitude: 30,
    zoom: 2,
    bearing: 0,
    pitch: 0,
    padding: { top: 40, bottom: 40, left: 40, right: 40 },
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cursor, setCursor] = useState<string>("auto");
  const [pendingPoint, setPendingPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MarkerType | null>(null);

  // Effect to handle dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Auto fit bounds when journey points change
  const fitBounds = useCallback(() => {
    if (!journeyMarkers || journeyMarkers.length === 0) return;

    if (journeyMarkers.length === 1) {
      // Single point - center on it
      setCurrentViewState((prev) => ({
        ...prev,
        longitude: journeyMarkers[0].coordinates.coordinates[1],
        latitude: journeyMarkers[0].coordinates.coordinates[0],
        zoom: 10,
      }));
      return;
    }

    // Multiple points - fit bounds
    const lngs = journeyMarkers.map((p) => p.coordinates.coordinates[1]);
    const lats = journeyMarkers.map((p) => p.coordinates.coordinates[0]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    const lngDiff = Math.abs(maxLng - minLng);
    const latDiff = Math.abs(maxLat - minLat);
    const maxDiff = Math.max(lngDiff, latDiff);

    let zoom = 1;
    if (maxDiff > 0) {
      zoom = Math.min(
        15,
        Math.max(1, Math.floor(8 - Math.log(maxDiff) / Math.log(2)))
      );
    }

    setCurrentViewState((prev) => ({
      ...prev,
      longitude: centerLng,
      latitude: centerLat,
      zoom: zoom,
    }));
  }, [journeyMarkers]);

  // Handle map click for adding points
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
      if (!isAddingPoint) return;

      const { lng, lat } = event.lngLat;
      setPendingPoint({ lat, lng });
    },
    [isAddingPoint]
  );

  // Handle mouse move over map
  const handleMouseMove = useCallback(() => {
    setCursor(isAddingPoint ? "crosshair" : "auto");
  }, [isAddingPoint]);

  // Button handler for fitting bounds
  const handleFitBounds = () => {
    fitBounds();
  };

  // Map style based on dark/light mode
  const mapStyle = isDarkMode
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/outdoors-v12";

  // Get marker color based on point type
  const getMarkerColor = (type: MarkerType["marker_type"]) => {
    const colors = {
      plan: "#3B82F6", // blue
      past: "#059669", // green
    };
    return colors[type] || colors.plan;
  };

  return (
    <>
      <div className="relative h-96 w-full overflow-hidden rounded-lg md:h-[600px]">
        <Map
          {...currentViewState}
          onMove={(evt: ViewStateChangeEvent) =>
            setCurrentViewState(evt.viewState)
          }
          mapStyle={mapStyle}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          cursor={cursor}
        >
          <NavigationControl position="top-right" />

          {/* Custom control for fit bounds */}
          <div className="absolute left-2 top-2 space-y-2">
            <button
              onClick={handleFitBounds}
              className="rounded bg-white p-2 shadow dark:bg-slate-700"
              title="Fit map to journey"
              disabled={journeyMarkers.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
            </button>
          </div>

          {/* Mode indicator */}
          {isAddingPoint && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
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
                  Click on the map to add a point
                </div>
              </div>
            </div>
          )}

          {/* Journey point markers */}
          {journeyMarkers.map((point, index) => {
            // Key that handles cases where _id might be undefined
            const markerKey =
              point._id ||
              `marker-${index}-${point.name}-${point.coordinates.coordinates[0]}-${point.coordinates.coordinates[1]}`;

            return (
              <Marker
                key={markerKey}
                longitude={point.coordinates.coordinates[1]}
                latitude={point.coordinates.coordinates[0]}
                anchor="bottom"
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedPoint(point)}
                  title={point.name}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{
                      backgroundColor: getMarkerColor(point.marker_type),
                    }}
                  />
                </div>
              </Marker>
            );
          })}
        </Map>
      </div>

      {/* Add Point Modal */}
      {pendingPoint && (
        <AddPointModal
          coordinates={[pendingPoint.lng, pendingPoint.lat]} // Note: GeoJSON format is [lng, lat]
          onConfirm={onAddPoint}
          onCancel={() => setPendingPoint(null)}
        />
      )}

      {/* Point Details Modal */}
      {selectedPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedPoint.name}</h3>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Type:</span>
                <p className="font-medium capitalize">
                  {selectedPoint.marker_type}
                </p>
              </div>

              {selectedPoint.notes && (
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p>{selectedPoint.notes}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500">Location:</span>
                <p className="text-sm font-mono">
                  {selectedPoint.coordinates.coordinates[0].toFixed(6)},{" "}
                  {selectedPoint.coordinates.coordinates[1].toFixed(6)}
                </p>
              </div>

              {/* <div>
                <span className="text-sm text-gray-500">Added:</span>
                <p className="text-sm">{selectedPoint.created_at?.toLocaleDateString()}</p>
              </div> */}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPoint(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onDeletePoint(selectedPoint._id || "");
                  setSelectedPoint(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
