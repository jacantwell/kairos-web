import { useState, useCallback } from "react";
import Map, {
  NavigationControl,
  ViewState,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { AddPointModal } from "./add-point-modal";
import { UserMarkerModal } from "./user-marker-modal";
import { NearbyMarkerModal } from "./nearby-marker-modal";
import { MapLayerMouseEvent, MapLayerTouchEvent } from "react-map-gl/maplibre";
import { Marker as MarkerType } from "kairos-api-client-ts";
import { NearbyJourneyMarkers } from "@/lib/api/hooks/use-nearby-journey-markers";
import { useSession } from "@/lib/context/session-provider";
import { Marker } from "kairos-api-client-ts";
import { processJourneyRoutes, ProcessedMarker } from "./utils/journey-routes";
import { JourneyRoutesLayer } from "./journey-routes-layer";
import { EnhancedMarker } from "./journey-marker";
import { useModal } from "@/lib/hooks/ui/use-modal";
import { UpdateUserMarkerModal } from "./update-user-marker-modal";

interface JourneyMapProps {
  journeyMarkers: MarkerType[];
  nearbyJourneyMarkers: Marker[];
  isAddingPoint: boolean;
  onAddPoint: (point: MarkerType) => void;
  onUpdatePoint?: (id: string, updatedMarker: MarkerType) => void;
  onDeletePoint: (id: string) => void;
}

export function JourneyMap({
  journeyMarkers,
  nearbyJourneyMarkers,
  isAddingPoint,
  onAddPoint,
  onUpdatePoint,
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

  const { closeModal, openModal, modal } = useModal();
  const [cursor, setCursor] = useState<string>("auto");

  // Selected marker (use ProcessedMarker now)
  const [selectedPoint, setSelectedPoint] = useState<ProcessedMarker | null>(
    null
  );

  const { user } = useSession();

  // const nearbyMarkers = nearbyJourneyMarkers.flatMap((njm) => njm.markers);
  // const combinedMarkers = [
  //   ...journeyMarkers,
  //   ...nearbyMarkers.filter(
  //     (nm) => !journeyMarkers.some((jm) => jm._id === nm._id)
  //   ),
  // ];
  // Process markers into journey routes
  const routes = processJourneyRoutes(nearbyJourneyMarkers);

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
      openModal("addPoint", { onConfirm: onAddPoint, coordinates: [lat, lng] });
    },
    [isAddingPoint, onAddPoint, openModal]
  );

  function handleMarkerClick(marker: ProcessedMarker) {
    if (isUserOwnedMarker(marker)) {
      openModal("userMarker", {
        marker: marker,
        onUpdate: handleUpdateMarker,
        onDelete: handleDeleteMarker,
      });
    } else {
      openModal("nearbyMarker", {
        marker: marker,
        ownerId: marker.owner_id,
      });
    }
  }

  // Mouse cursor
  const handleMouseMove = useCallback(() => {
    setCursor(isAddingPoint ? "crosshair" : "auto");
  }, [isAddingPoint]);

  // Check if marker is owned by current user
  const isUserOwnedMarker = (marker: Marker): boolean => {
    if (!user?._id) return false;
    return marker.owner_id === user._id;
  };

  const handleDeleteMarker = (markerId: string) => {
    onDeletePoint(markerId);
    closeModal();
  };

  const handleUpdateMarkerSubmit = (id: string, updatedMarker: MarkerType) => {
    if (onUpdatePoint) {
      onUpdatePoint(id, updatedMarker);
      setSelectedPoint(null);
    }
  };

  const handleUpdateMarker = (id: string, updatedMarker: MarkerType) => {
    // Function that runs when Update button is clicked.
    // Closes current user marker modal.
    closeModal();
    // Opens the update user marker modal.
    openModal("updateUserMarker", {
      onConfirm: handleUpdateMarkerSubmit,
      marker: { ...updatedMarker, _id: id } as ProcessedMarker,
    });
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
              className="rounded bg-white p-2 shadow"
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
                onMarkerClick={handleMarkerClick}
              />
            ))
          )}
        </Map>
      </div>
      {modal.type === "addPoint" && (
        <AddPointModal
          onConfirm={modal.props.onConfirm}
          coordinates={modal.props.coordinates}
        />
      )}

      {modal.type === "updateUserMarker" && (
        <UpdateUserMarkerModal
          marker={modal.props.marker}
          onConfirm={modal.props.onConfirm}
        />
      )}

      {modal.type === "userMarker" && (
        <UserMarkerModal
          marker={modal.props.marker}
          onUpdate={modal.props.onUpdate}
          onDelete={modal.props.onDelete}
        />
      )}

      {modal.type === "nearbyMarker" && (
        <NearbyMarkerModal marker={modal.props.marker} />
      )}
    </>
  );
}
