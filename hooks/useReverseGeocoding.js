"use client";

import { useCallback, useRef, useState } from "react";

const PLACE_TYPES = ["establishment", "premise", "point_of_interest", "natural_feature", "park"];

export function useReverseGeocoding() {
  const geocoderRef = useRef(null);
  const timerRef = useRef(null);
  const [address, setAddress] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [verified, setVerified] = useState(false);
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
          const first = results[0];
          const establishmentComp = first.address_components?.find((c) =>
            c.types.some((t) => PLACE_TYPES.includes(t))
          );
          setAddress(first.formatted_address || "");
          setPlaceName(establishmentComp?.long_name || "");
          setVerified(true);
        }
      });
    }, 500);
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setAddress("");
    setPlaceName("");
    setVerified(false);
    setLoading(false);
  }, []);

  return { address, placeName, verified, loading, reverseGeocode, reset };
}
