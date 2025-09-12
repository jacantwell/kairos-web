import { Marker } from "kairos-api-client-ts";
export interface ProcessedRoute {
  journeyId: string;
  coordinates: [number, number][];
  color: string;
  markers: ProcessedMarker[];
}

export interface ProcessedMarker extends Marker {
  order: number;
  segmentType: "past" | "plan" | "transition";
}

// Generate distinct colors for different journeys
export const generateJourneyColor = (journeyId: string): string => {
  const colors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6366F1", // Indigo
  ];

  // Create a simple hash from journey ID
  let hash = 0;
  for (let i = 0; i < journeyId.length; i++) {
    const char = journeyId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
};

// Sort markers according to the specified rules
export const sortMarkersForRoute = (markers: Marker[]): ProcessedMarker[] => {
  if (!markers || markers.length === 0) return [];

  // Separate past and plan markers
  const pastMarkers = markers
    .filter((m) => m.marker_type === "past" && m.timestamp)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp!);
      const dateB = new Date(b.timestamp!);
      return dateA.getTime() - dateB.getTime();
    });

  const planMarkers = markers
    .filter((m) => m.marker_type === "plan" && m.estimated_time)
    .sort((a, b) => {
      const dateA = new Date(a.estimated_time!);
      const dateB = new Date(b.estimated_time!);
      return dateA.getTime() - dateB.getTime();
    });

  // Combine them in the correct order
  const sortedMarkers: ProcessedMarker[] = [];
  let order = 0;

  // Add past markers first
  pastMarkers.forEach((marker) => {
    sortedMarkers.push({
      ...marker,
      order: order++,
      segmentType: "past",
    });
  });

  // Add plan markers
  planMarkers.forEach((marker, index) => {
    sortedMarkers.push({
      ...marker,
      order: order++,
      segmentType:
        index === 0 && pastMarkers.length > 0 ? "transition" : "plan",
    });
  });

  return sortedMarkers;
};

// Group markers by journey and create route data
export const processJourneyRoutes = (
  markers: Marker[],
): ProcessedRoute[] => {
  if (!markers || markers.length === 0) return [];

  // Group markers by journey_id
  const journeyGroups = markers.reduce((groups, marker) => {
    const journeyId = marker.journey_id;
    if (!groups[journeyId]) {
      groups[journeyId] = [];
    }
    groups[journeyId].push(marker);
    return groups;
  }, {} as Record<string, Marker[]>);

  // Process each journey
  return Object.entries(journeyGroups).map(([journeyId, journeyMarkers]) => {
    const sortedMarkers = sortMarkersForRoute(journeyMarkers);

    // Extract coordinates for the route line
    const coordinates: [number, number][] = sortedMarkers.map((marker) => [
      marker.coordinates.coordinates[0], // longitude
      marker.coordinates.coordinates[1], // latitude
    ]);

    return {
      journeyId,
      coordinates,
      color: generateJourneyColor(journeyId),
      markers: sortedMarkers,
    };
  });
};

// Get marker style based on type and position in route
export const getMarkerStyle = (
  marker: ProcessedMarker,
  journeyColor: string
) => {
  const baseStyle = {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "3px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    color: "white",
  };

  if (marker.marker_type === "past") {
    return {
      ...baseStyle,
      backgroundColor: journeyColor,
      content: "●",
    };
  } else if (marker.marker_type === "plan") {
    return {
      ...baseStyle,
      backgroundColor: "white",
      border: `3px solid ${journeyColor}`,
      color: journeyColor,
      content: marker.segmentType === "transition" ? "→" : "○",
    };
  }

  return baseStyle;
};
