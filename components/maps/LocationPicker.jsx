"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const indiaCenter = [22.9734, 78.6569];
const selectedLocationIcon = L.divIcon({
  className: "",
  html: '<span class="block h-5 w-5 rounded-full border-4 border-white bg-navy shadow-lg ring-4 ring-gold/40"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function LocationPicker({ coords, onChange, className = "h-64" }) {
  const center = coords ? [coords.latitude, coords.longitude] : indiaCenter;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
      <MapContainer center={center} zoom={coords ? 16 : 5} scrollWheelZoom className={`${className} w-full`}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap coords={coords} />
        <LocationClickHandler onChange={onChange} />
        {coords ? <Marker icon={selectedLocationIcon} position={[coords.latitude, coords.longitude]} /> : null}
      </MapContainer>
    </div>
  );
}

function RecenterMap({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (!coords) return;
    map.setView([coords.latitude, coords.longitude], 16, { animate: true });
  }, [coords, map]);

  return null;
}

function LocationClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(7)),
        longitude: Number(event.latlng.lng.toFixed(7)),
      });
    },
  });

  return null;
}
