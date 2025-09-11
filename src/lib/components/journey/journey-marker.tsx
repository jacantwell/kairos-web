import { Marker } from 'react-map-gl/mapbox';
import { ProcessedMarker, getMarkerStyle } from './utils/journey-routes';

interface EnhancedMarkerProps {
  marker: ProcessedMarker;
  journeyColor: string;
  isSelected?: boolean;
  onMarkerClick: (marker: ProcessedMarker) => void;
}

export function EnhancedMarker({
  marker,
  journeyColor,
  isSelected = false,
  onMarkerClick,
}: EnhancedMarkerProps) {
  const style = getMarkerStyle(marker, journeyColor);

  return (
    <Marker
      longitude={marker.coordinates.coordinates[0]}
      latitude={marker.coordinates.coordinates[1]}
      anchor="bottom"
    >
      <div
        className="cursor-pointer transition-all duration-200 hover:scale-110 relative"
        onClick={() => onMarkerClick(marker)}
        title={`${marker.name} (${marker.marker_type})`}
      >
        {/* Marker pin shape */}
        <div className="relative">
          {/* Pin body */}
          <div
            className={`
              flex items-center justify-center text-white font-bold text-xs
              transition-all duration-200
              ${isSelected ? 'scale-125 ring-4 ring-blue-300' : ''}
            `}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: marker.marker_type === 'past' ? journeyColor : 'white',
              border: `3px solid ${marker.marker_type === 'past' ? 'white' : journeyColor}`,
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            }}
          >
            {/* Inner content */}
            <div
              style={{
                transform: 'rotate(45deg)',
                color: marker.marker_type === 'past' ? 'white' : journeyColor,
                fontSize: '12px',
              }}
            >
              {marker.marker_type === 'past' ? '●' : 
               marker.segmentType === 'transition' ? '→' : '○'}
            </div>
          </div>

          {/* Order number badge for debugging/development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div
              className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              style={{ fontSize: '10px' }}
            >
              {marker.order + 1}
            </div>
          )} */}

          {/* Pulse animation for selected marker */}
          {isSelected && (
            <div
              className="absolute top-0 left-0 animate-ping"
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: journeyColor,
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                opacity: 0.4,
              }}
            />
          )}
        </div>

        {/* Marker label */}
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none"
          style={{ zIndex: 1000 }}
        >
          <div className="text-center">
            <div className="font-semibold">{marker.name}</div>
            <div className="text-gray-300 capitalize">
              {marker.marker_type}
              {marker.marker_type === 'past' && marker.timestamp && 
                ` • ${new Date(marker.timestamp).toLocaleDateString()}`
              }
              {marker.marker_type === 'plan' && marker.estimated_time && 
                ` • ${new Date(marker.estimated_time).toLocaleDateString()}`
              }
            </div>
          </div>
        </div>
      </div>
    </Marker>
  );
}