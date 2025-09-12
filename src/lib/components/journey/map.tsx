// kairos/src/lib/components/journey/journey-map.tsx
import { useState, useEffect, useCallback } from "react";
import Map, {
  NavigationControl,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { AddPointModal } from "./add-point-modal";
import { MapLayerMouseEvent, MapLayerTouchEvent } from "react-map-gl/maplibre";
import { Marker as MarkerType } from "kairos-api-client-ts";
import { NearbyJourneyMarkers, useNearbyJourneyMarkers } from "@/lib/api/hooks/use-nearby-journey-markers";

import { processJourneyRoutes, ProcessedMarker } from "./utils/journey-routes";
import { JourneyRoutesLayer } from "./journey-routes-layer";
import { EnhancedMarker } from "./journey-marker";

interface JourneyMapProps {
  journeyMarkers: MarkerType[];
  nearbyJourneyMarkers: NearbyJourneyMarkers[];
  isAddingPoint: boolean;
  onAddPoint: (point: MarkerType) => void;
  onDeletePoint: (id: string) => void;
}

export function JourneyMap({
  journeyMarkers,
  nearbyJourneyMarkers,
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

  const [cursor, setCursor] = useState<string>("auto");
  const [pendingPoint, setPendingPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Selected marker (use ProcessedMarker now)
  const [selectedPoint, setSelectedPoint] = useState<ProcessedMarker | null>(
    null
  );

  const nearbyMarkers = nearbyJourneyMarkers.flatMap((njm) => njm.markers);
  const combinedMarkers = [
    ...journeyMarkers,
    ...nearbyMarkers.filter(
      (nm) =>
        !journeyMarkers.some(
          (jm) => jm._id === nm._id
        )
    ),
  ];
  // Process markers into journey routes
  const routes = processJourneyRoutes(combinedMarkers);

  // Auto fit bounds when routes change
  const fitBounds = useCallback(() => {
    if (!routes || routes.length === 0) return;

    const allCoords = routes.flatMap((r) => r.coordinates);
    if (allCoords.length === 0) return;

    const lngs = allCoords.map((c) => c[0]);
    const lats = allCoords.map((c) => c[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const maxDiff = Math.max(
      Math.abs(maxLng - minLng),
      Math.abs(maxLat - minLat)
    );

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
      zoom,
    }));
  }, [routes]);

  // Handle map click for adding points
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent | MapLayerTouchEvent) => {
      if (!isAddingPoint) return;
      const { lng, lat } = event.lngLat;
      setPendingPoint({ lat, lng });
    },
    [isAddingPoint]
  );

  // Mouse cursor
  const handleMouseMove = useCallback(() => {
    setCursor(isAddingPoint ? "crosshair" : "auto");
  }, [isAddingPoint]);

  // Button handler for fitting bounds
  const handleFitBounds = () => {
    fitBounds();
  };

  return (
    <>
      <div className="relative h-96 w-full overflow-hidden rounded-lg md:h-[600px]">
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
          <NavigationControl position="top-right" />

          {/* Fit bounds button */}
          <div className="absolute left-2 top-2 space-y-2">
            <button
              onClick={fitBounds}
              className="rounded bg-white p-2 shadow dark:bg-slate-700"
              title="Fit map to journeys"
              disabled={routes.length === 0}
            >
              ⤢
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

          {/* Route lines */}
          <JourneyRoutesLayer routes={routes} />

          {/* Enhanced Markers */}
          {routes.map((route) =>
            route.markers.map((marker) => (
              <EnhancedMarker
                key={marker._id || `${route.journeyId}-${marker.order}`}
                marker={marker}
                journeyColor={route.color}
                isSelected={selectedPoint?._id === marker._id}
                onMarkerClick={setSelectedPoint}
              />
            ))
          )}
        </Map>
      </div>

      {/* Add Point Modal */}
      {pendingPoint && (
        <AddPointModal
          coordinates={[pendingPoint.lng, pendingPoint.lat]}
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
              <button onClick={() => setSelectedPoint(null)}>✕</button>
            </div>

            <div className="space-y-3">
              <p className="capitalize">Type: {selectedPoint.marker_type}</p>
              {selectedPoint.notes && <p>{selectedPoint.notes}</p>}
              {selectedPoint.timestamp && (
                <p>{`Date:  ${selectedPoint.timestamp}`}</p>
              )}
              {selectedPoint.estimated_time && (
                <p>{`ETA: ${selectedPoint.estimated_time}`}</p>
              )}
              <p className="text-sm font-mono">
                {selectedPoint.coordinates.coordinates[1].toFixed(6)},{" "}
                {selectedPoint.coordinates.coordinates[0].toFixed(6)}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedPoint(null)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onDeletePoint(selectedPoint._id || "");
                  setSelectedPoint(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg"
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
