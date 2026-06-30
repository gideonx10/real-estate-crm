"use client";

import { useCallback, useState } from "react";

export function useCurrentLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestLocation = useCallback((onSuccess) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError("Location permission denied");
        else if (err.code === 2) setError("Location unavailable");
        else setError("Location request timed out");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { loading, error, requestLocation };
}
