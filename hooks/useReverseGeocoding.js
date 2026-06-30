"use client";

import { useCallback, useRef, useState } from "react";

export function useReverseGeocoding() {
  const geocoderRef = useRef(null);
  const timerRef = useRef(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  function getGeocoder() {
    if (!geocoderRef.current && typeof window !== "undefined" && window.google?.maps?.Geocoder) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  }

  const reverseGeocode = useCallback((lat, lng) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const gc = getGeocoder();
      if (!gc) return;
      setLoading(true);
      gc.geocode({ location: { lat, lng } }, (results, status) => {
        setLoading(false);
        if (status === "OK" && results?.[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }, 500);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setAddress("");
    setLoading(false);
  }, []);

  return { address, loading, reverseGeocode, reset };
}
