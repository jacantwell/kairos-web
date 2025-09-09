"use client";

import { getApiClient } from "../client";
import { useMemo } from "react";

export const useApi = () => {
  const api = useMemo(() => getApiClient(), []);
  return api;
};
