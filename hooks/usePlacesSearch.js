"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { formatCoord } from "@/lib/maps/googleMapsUtils";

export function usePlacesSearch() {
  const placesLib = useMapsLibrary("places");
  const autocomplete = useRef(null);
  const geocoder = useRef(null);
  const debounceTimer = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!placesLib) return;
    autocomplete.current = new placesLib.AutocompleteService();
    if (typeof window !== "undefined" && window.google?.maps?.Geocoder) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, [placesLib]);

  const search = useCallback((query) => {
    clearTimeout(debounceTimer.current);
    if (!query.trim()) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      if (!autocomplete.current) return;
      setSearching(true);
      autocomplete.current.getPlacePredictions(
        { input: query, componentRestrictions: { country: "in" } },
        (predictions, status) => {
          setSearching(false);
          setSuggestions(status === "OK" && predictions ? predictions.slice(0, 5) : []);
        }
      );
    }, 300);
  }, []);

  const resolvePlace = useCallback((placeId, onCoords) => {
    if (!geocoder.current) return;
    geocoder.current.geocode({ placeId }, (results, status) => {
      if (status !== "OK" || !results?.[0]) return;
      const loc = results[0].geometry.location;
      onCoords({
        latitude: formatCoord(loc.lat()),
        longitude: formatCoord(loc.lng()),
      });
    });
  }, []);

  const clear = useCallback(() => {
    clearTimeout(debounceTimer.current);
    setSuggestions([]);
    setSearching(false);
  }, []);

  return { suggestions, searching, search, resolvePlace, clear };
}
