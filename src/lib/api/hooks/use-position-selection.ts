import { useState, useCallback } from 'react';

interface PendingPosition {
  lat: number;
  lng: number;
}

export function usePositionSelection() {
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<PendingPosition | null>(null);

  const startPositionSelection = useCallback(() => {
    setIsSelectingPosition(true);
    setPendingPosition(null);
  }, []);

  const handleMapClick = useCallback((lng: number, lat: number) => {
    if (isSelectingPosition) {
      setPendingPosition({ lat, lng });
      setIsSelectingPosition(false);
    }
  }, [isSelectingPosition]);

  const cancelPositionSelection = useCallback(() => {
    setIsSelectingPosition(false);
    setPendingPosition(null);
  }, []);

  const confirmPosition = useCallback(() => {
    const position = pendingPosition;
    setPendingPosition(null);
    return position;
  }, [pendingPosition]);

  return {
    isSelectingPosition,
    pendingPosition,
    startPositionSelection,
    handleMapClick,
    cancelPositionSelection,
    confirmPosition,
  };
}