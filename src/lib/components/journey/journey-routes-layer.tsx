import { Source, Layer } from 'react-map-gl/mapbox';
import { ProcessedRoute } from './utils/journey-routes';

interface JourneyRoutesLayerProps {
  routes: ProcessedRoute[];
}

export function JourneyRoutesLayer({ routes }: JourneyRoutesLayerProps) {
  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <>
      {routes.map((route) => {
        if (route.coordinates.length < 2) {
          return null; // Need at least 2 points to draw a line
        }

        const sourceId = `route-${route.journeyId}`;
        const layerId = `route-layer-${route.journeyId}`;

        // Create GeoJSON LineString for the route
        const routeGeoJSON = {
          type: 'Feature' as const,
          properties: {
            journeyId: route.journeyId,
            color: route.color,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: route.coordinates,
          },
        };

        return (
          <div key={route.journeyId}>
            <Source id={sourceId} type="geojson" data={routeGeoJSON}>
              {/* Main route line */}
              <Layer
                id={layerId}
                type="line"
                paint={{
                  'line-color': route.color,
                  'line-width': 4,
                  'line-opacity': 0.8,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
              
              {/* Route outline for better visibility */}
              <Layer
                id={`${layerId}-outline`}
                type="line"
                paint={{
                  'line-color': '#FFFFFF',
                  'line-width': 6,
                  'line-opacity': 0.6,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
                beforeId={layerId} // Render outline below main line
              />

              {/* Directional arrows for the route */}
              <Layer
                id={`${layerId}-arrows`}
                type="symbol"
                paint={{
                  'text-color': route.color,
                  'text-halo-color': '#FFFFFF',
                  'text-halo-width': 1,
                }}
                layout={{
                  'symbol-placement': 'line',
                  'symbol-spacing': 100,
                  'text-field': '▶',
                  'text-size': 12,
                  'text-rotation-alignment': 'map',
                  'text-pitch-alignment': 'viewport',
                  'text-keep-upright': true,
                }}
              />
            </Source>
          </div>
        );
      })}
    </>
  );
}