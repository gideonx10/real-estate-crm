"use client";

import { LocationPicker } from "@/components/maps/LocationPicker";
import { DELHI_CENTER } from "@/lib/maps/googleMapsUtils";

export function LeadLocationPicker({ coords, onChange }) {
  return (
    <LocationPicker
      coords={coords}
      onChange={onChange}
      center={DELHI_CENTER}
      gestureHandling="cooperative"
    />
  );
}
