"use client";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Building2, FolderKanban, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const indiaCenter = [22.9734, 78.6569];

export function PortfolioMapPanel({ projects = [], builders = [] }) {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("All");
  const [location, setLocation] = useState("");
  const [projectColor, setProjectColor] = useState("#0D1B3E");
  const [builderColor, setBuilderColor] = useState("#C9A84C");

  const entities = useMemo(
    () => [
      ...projects.map((project) => ({
        id: project.id,
        type: "Project",
        name: project.name,
        location: project.location || "Location not set",
        latitude: Number(project.latitude),
        longitude: Number(project.longitude),
        href: `/projects/${project.id}`,
      })),
      ...builders.map((builder) => ({
        id: builder.id,
        type: "Builder",
        name: builder.company_name || builder.full_name,
        location: builder.office_address || "Location not set",
        latitude: Number(builder.latitude),
        longitude: Number(builder.longitude),
        href: `/contacts/builders/${builder.id}`,
      })),
    ],
    [builders, projects]
  );

  const locations = useMemo(
    () => [...new Set(entities.map((entity) => entity.location).filter((item) => item !== "Location not set"))].sort(),
    [entities]
  );

  const filteredEntities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entities.filter((entity) => {
      const matchesType = entityType === "All" || entity.type === entityType;
      const matchesLocation = !location || entity.location === location;
      const matchesQuery =
        !normalizedQuery ||
        `${entity.name} ${entity.location} ${entity.type}`.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesLocation && matchesQuery;
    });
  }, [entities, entityType, location, query]);

  const mappedEntities = filteredEntities.filter(
    (entity) =>
      Number.isFinite(entity.latitude) &&
      Number.isFinite(entity.longitude) &&
      entity.latitude >= -90 &&
      entity.latitude <= 90 &&
      entity.longitude >= -180 &&
      entity.longitude <= 180 &&
      !(entity.latitude === 0 && entity.longitude === 0)
  );
  const unmappedCount = filteredEntities.length - mappedEntities.length;

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, builders or locations"
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Project", "Builder"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setEntityType(item)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-sm font-bold",
                entityType === item ? "border-navy bg-navy text-white" : "border-zinc-200 bg-white text-zinc-600"
              )}
            >
              {item === "All" ? "All Data" : `${item}s`}
            </button>
          ))}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-navy">Locations</p>
            {location ? (
              <button type="button" onClick={() => setLocation("")} className="text-xs font-bold text-gold">
                Clear filter
              </button>
            ) : null}
          </div>
          <div className="max-h-44 space-y-1 overflow-y-auto overscroll-contain pr-1">
            {locations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocation(location === item ? "" : item)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold",
                  location === item ? "bg-navy text-white" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <MapPin size={16} className={location === item ? "text-gold" : "text-success"} />
                <span className="min-w-0 flex-1 break-words">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ColorControl label="Projects" icon={FolderKanban} value={projectColor} onChange={setProjectColor} />
          <ColorControl label="Builders" icon={Building2} value={builderColor} onChange={setBuilderColor} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
          <p className="font-bold text-navy">{mappedEntities.length} mapped records</p>
          {unmappedCount > 0 ? (
            <p className="text-xs font-semibold text-warning">{unmappedCount} need map coordinates</p>
          ) : null}
        </div>
        <MapContainer
          center={indiaCenter}
          zoom={5}
          minZoom={4}
          scrollWheelZoom
          className="h-[52vh] min-h-[320px] max-h-[680px] w-full sm:min-h-[380px]"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewport entities={mappedEntities} />
          <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
            {mappedEntities.map((entity) => (
              <Marker
                key={`${entity.type}-${entity.id}`}
                position={[entity.latitude, entity.longitude]}
                icon={createMarkerIcon(entity.type === "Project" ? projectColor : builderColor, entity.type)}
              >
                <Popup>
                  <div className="min-w-44">
                    <p className="text-xs font-bold uppercase text-zinc-500">{entity.type}</p>
                    <p className="mt-1 font-bold text-navy">{entity.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{entity.location}</p>
                    <a href={entity.href} className="mt-3 inline-flex font-bold text-blue-700">
                      Open record
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </section>
  );
}

function ColorControl({ label, icon: Icon, value, onChange }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-navy">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} marker color`}
        className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
      />
      <Icon size={17} />
      <span>{label}</span>
    </label>
  );
}

function MapViewport({ entities }) {
  const map = useMap();

  useEffect(() => {
    if (!entities.length) {
      map.setView(indiaCenter, 5);
      return;
    }
    const bounds = L.latLngBounds(entities.map((entity) => [entity.latitude, entity.longitude]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }, [entities, map]);

  return null;
}

function createMarkerIcon(color, type) {
  const label = type === "Project" ? "P" : "B";
  return L.divIcon({
    className: "",
    html: `<span style="background:${color}" class="grid h-9 w-9 place-items-center rounded-full border-4 border-white text-xs font-black text-white shadow-lg">${label}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}
