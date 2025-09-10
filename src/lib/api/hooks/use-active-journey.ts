
"use client";

import { useState, useEffect, useMemo } from "react";
import { Journey } from "kairos-api-client-ts";

interface UseActiveJourneyProps {
  journeys: Journey[];
}

export function useActiveJourney({ journeys }: UseActiveJourneyProps) {
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  // Derive active journey from journeys list
  const activeJourney = useMemo(() => {
    const foundActive = journeys.find((journey) => journey.active);
    return foundActive || null;
  }, [journeys]);

  // Update local active journey ID when the active journey changes
  useEffect(() => {
    if (activeJourney?._id) {
      setActiveJourneyId(activeJourney._id);
    } else {
      setActiveJourneyId(null);
    }
  }, [activeJourney?._id]);

  const setAsActive = (journey: Journey) => {
    setActiveJourneyId(journey._id || null);
  };

  const clearActive = () => {
    setActiveJourneyId(null);
  };

  return {
    activeJourney,
    activeJourneyId,
    setAsActive,
    clearActive,
  };
}