"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { CenterPin } from "@/components/maps/CenterPin";
import { ClipboardPasteButton } from "@/components/maps/ClipboardPasteButton";
import { CurrentLocationButton } from "@/components/maps/CurrentLocationButton";
import { LocationInfoCard } from "@/components/maps/LocationInfoCard";
import { PlacesSearchBar } from "@/components/maps/PlacesSearchBar";
import { useReverseGeocoding } from "@/hooks/useReverseGeocoding";
import {
  MAPS_API_KEY,
  MAPS_MAP_ID,
  INDIA_CENTER,
  formatCoord,
} from "@/lib/maps/googleMapsUtils";

export function LocationPicker({
  coords,
  onChange,
  center = INDIA_CENTER,
  gestureHandling = "greedy",
  className = "h-64",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(coords ?? null);
  const [panTarget, setPanTarget] = useState(null);
  const { address, placeName, verified, loading: geocoding, reverseGeocode } =
    useReverseGeocoding();

  // Becomes true as soon as the user interacts (drag, search, current-location, paste)
  // Prevents the initial mount idle from writing coords to the parent
  const hasMoved = useRef(false);
  const searchBarRef = useRef(null);

  const initialCenter = coords
    ? { lat: coords.latitude, lng: coords.longitude }
    : center;
  const initialZoom = coords ? 16 : center === INDIA_CENTER ? 5 : 11;

  // Immediately show address for an existing location when the picker opens
  useEffect(() => {
    if (coords) reverseGeocode(coords.latitude, coords.longitude);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Called when user picks a location from the search bar (text or URL)
  function handleSearchPlace(newCoords) {
    hasMoved.current = true;
    setPanTarget({ lat: newCoords.latitude, lng: newCoords.longitude });
    setPendingCoords(newCoords);
    onChange(newCoords);
    reverseGeocode(newCoords.latitude, newCoords.longitude);
  }

  // Called by the GPS button
  function handleCurrentLocation(newCoords) {
    hasMoved.current = true;
    setPanTarget({ lat: newCoords.latitude, lng: newCoords.longitude });
    setPendingCoords(newCoords);
    onChange(newCoords);
    reverseGeocode(newCoords.latitude, newCoords.longitude);
  }

  // Called by the clipboard paste button — delegates to search bar which
  // handles both Maps URLs and plain text queries
  function handleClipboardPaste(text) {
    searchBarRef.current?.processInput(text);
  }

  // Fires on every map idle (after drag settles, after pan, on initial mount)
  const handleIdle = useCallback(
    (lat, lng) => {
      // Always reverse geocode if there are coords to resolve (edit mode or after first interaction)
      const hasCoords = hasMoved.current || !!coords;
      if (hasCoords) reverseGeocode(lat, lng);

      // Only propagate new coords to the parent after the user has interacted
      if (!hasMoved.current) return;
      const newCoords = { latitude: formatCoord(lat), longitude: formatCoord(lng) };
      setPendingCoords(newCoords);
      onChange(newCoords);
    },
    [coords, onChange, reverseGeocode]
  );

  return (
    <div className="relative isolate rounded-xl border border-zinc-200 bg-white">
      <APIProvider apiKey={MAPS_API_KEY}>
        {/* Search row — z-10 keeps the autocomplete dropdown above the map */}
        <div className="relative z-10 flex items-center gap-2 border-b border-zinc-100 bg-white p-2">
          <div className="flex-1">
            <PlacesSearchBar
              ref={searchBarRef}
              onPlace={handleSearchPlace}
            />
          </div>
          <ClipboardPasteButton onPaste={handleClipboardPaste} />
          <CurrentLocationButton onLocation={handleCurrentLocation} />
        </div>

        {/* Map area + info card share overflow-hidden for rounded bottom corners */}
        <div className="overflow-hidden rounded-b-xl">
          <div className="relative bg-zinc-50">
            <Map
              mapId={MAPS_MAP_ID}
              defaultCenter={initialCenter}
              defaultZoom={initialZoom}
              className={`${className} w-full`}
              gestureHandling={gestureHandling}
              mapTypeControl={false}
              streetViewControl={false}
              fullscreenControl={false}
              onDragStart={() => {
                hasMoved.current = true;
                setIsDragging(true);
              }}
              onDragEnd={() => setIsDragging(false)}
            >
              <MapCenterWatcher onIdle={handleIdle} />
              <MapPanTo target={panTarget} />
            </Map>
            <CenterPin isDragging={isDragging} />
          </div>
          <LocationInfoCard
            address={address}
            placeName={placeName}
            coords={pendingCoords}
            loading={geocoding}
            verified={verified}
          />
        </div>
      </APIProvider>
    </div>
  );
}

// Watches the map idle event and reports the current center to the parent
function MapCenterWatcher({ onIdle }) {
  const map = useMap();
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("idle", () => {
      const c = map.getCenter();
      if (c) onIdleRef.current(c.lat(), c.lng());
    });
    return () => window.google.maps.event.removeListener(listener);
  }, [map]);

  return null;
}

// Pans the map to a new target whenever one is set (search / GPS triggers)
function MapPanTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    map.setZoom(16);
  }, [map, target]);

  return null;
}
