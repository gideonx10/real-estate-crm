"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APIProvider, AdvancedMarker, InfoWindow, Map, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  Building2,
  Check,
  Clipboard,
  ClipboardList,
  ExternalLink,
  FolderKanban,
  MapPin,
  Navigation,
  Pencil,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAPS_API_KEY,
  MAPS_MAP_ID,
  INDIA_CENTER,
  isValidCoords,
  mapsNavUrl,
} from "@/lib/maps/googleMapsUtils";

export function PortfolioMapPanel({ projects = [], builders = [] }) {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("All");
  const [location, setLocation] = useState("");
  const [projectColor, setProjectColor] = useState("#0D1B3E");
  const [builderColor, setBuilderColor] = useState("#C9A84C");
  const [selectedEntity, setSelectedEntity] = useState(null);

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
    () =>
      [...new Set(entities.map((e) => e.location).filter((l) => l !== "Location not set"))].sort(),
    [entities]
  );

  const filteredEntities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entities.filter((e) => {
      const matchesType = entityType === "All" || e.type === entityType;
      const matchesLocation = !location || e.location === location;
      const matchesQuery = !q || `${e.name} ${e.location} ${e.type}`.toLowerCase().includes(q);
      return matchesType && matchesLocation && matchesQuery;
    });
  }, [entities, entityType, location, query]);

  const mappedEntities = filteredEntities.filter(isValidCoords);
  const unmappedCount = filteredEntities.length - mappedEntities.length;

  return (
    <section className="grid gap-4">
      {/* Filter panel */}
      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
                entityType === item
                  ? "border-navy bg-navy text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
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
              <button
                type="button"
                onClick={() => setLocation("")}
                className="text-xs font-bold text-gold"
              >
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
                  location === item
                    ? "bg-navy text-white"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <MapPin
                  size={16}
                  className={location === item ? "text-gold" : "text-success"}
                />
                <span className="min-w-0 flex-1 wrap-break-word">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ColorControl
            label="Projects"
            icon={FolderKanban}
            value={projectColor}
            onChange={setProjectColor}
          />
          <ColorControl
            label="Builders"
            icon={Building2}
            value={builderColor}
            onChange={setBuilderColor}
          />
        </div>
      </div>

      {/* Map panel */}
      <div className="relative isolate overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
          <p className="font-bold text-navy">{mappedEntities.length} mapped records</p>
          {unmappedCount > 0 ? (
            <p className="text-xs font-semibold text-warning">
              {unmappedCount} need map coordinates
            </p>
          ) : null}
        </div>
        <APIProvider apiKey={MAPS_API_KEY}>
          <Map
            mapId={MAPS_MAP_ID}
            defaultCenter={INDIA_CENTER}
            defaultZoom={5}
            minZoom={4}
            className="h-[52vh] min-h-80 max-h-170 w-full sm:min-h-95"
            onClick={() => setSelectedEntity(null)}
          >
            <MapViewport entities={mappedEntities} />
            <ClusteredMarkers
              entities={mappedEntities}
              projectColor={projectColor}
              builderColor={builderColor}
              onSelect={setSelectedEntity}
            />
            {selectedEntity ? (
              <InfoWindow
                position={{ lat: selectedEntity.latitude, lng: selectedEntity.longitude }}
                onCloseClick={() => setSelectedEntity(null)}
                headerDisabled
              >
                <EntityInfoPanel
                  entity={selectedEntity}
                  onClose={() => setSelectedEntity(null)}
                />
              </InfoWindow>
            ) : null}
          </Map>
        </APIProvider>
      </div>
    </section>
  );
}

function EntityInfoPanel({ entity, onClose }) {
  const mapsUrl = mapsNavUrl(entity.latitude, entity.longitude);

  return (
    <div className="w-56 font-sans">
      <div className="mb-2.5">
        <span className="inline-block rounded-full bg-navy/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-navy">
          {entity.type}
        </span>
        <p className="mt-1.5 text-base font-bold leading-tight text-zinc-900">{entity.name}</p>
        <p className="mt-1 flex items-start gap-1 text-xs text-zinc-500">
          <MapPin size={11} className="mt-0.5 shrink-0" />
          <span className="leading-tight">{entity.location}</span>
        </p>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5">
        <a
          href={entity.href}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-navy/90"
        >
          <ExternalLink size={12} />
          {entity.type === "Project" ? "View Project" : "View Profile"}
        </a>
        <a
          href={entity.href}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-200"
        >
          <Pencil size={12} />
          {entity.type === "Project" ? "Edit Project" : "Edit Builder"}
        </a>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
      >
        <Navigation size={13} />
        Open in Google Maps
      </a>

      <div className="grid grid-cols-2 gap-1.5">
        <CopyButton text={entity.location} icon={ClipboardList} label="Copy Address" />
        <CopyButton
          text={`${entity.latitude}, ${entity.longitude}`}
          icon={Clipboard}
          label="Copy Coords"
        />
      </div>
    </div>
  );
}

function CopyButton({ text, icon: Icon, label }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-2 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200"
    >
      {copied ? <Check size={12} className="text-success" /> : <Icon size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function ColorControl({ label, icon: Icon, value, onChange }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-navy">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    if (!map) return;
    if (!entities.length) {
      map.setCenter(INDIA_CENTER);
      map.setZoom(5);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    entities.forEach((e) => bounds.extend({ lat: e.latitude, lng: e.longitude }));
    map.fitBounds(bounds, 36);
  }, [map, entities]);

  return null;
}

function ClusteredMarkers({ entities, projectColor, builderColor, onSelect }) {
  const map = useMap();
  const clusterer = useRef(null);
  const markerNodes = useRef({});

  useEffect(() => {
    if (!map) return;
    clusterer.current = new MarkerClusterer({ map });
    clusterer.current.addMarkers(Object.values(markerNodes.current));
    return () => {
      clusterer.current?.clearMarkers();
      clusterer.current = null;
    };
  }, [map]);

  const syncMarkers = useCallback(() => {
    const c = clusterer.current;
    if (!c) return;
    c.clearMarkers();
    c.addMarkers(Object.values(markerNodes.current));
  }, []);

  const setMarkerRef = useCallback(
    (marker, key) => {
      if (marker) {
        markerNodes.current[key] = marker;
      } else {
        delete markerNodes.current[key];
      }
      syncMarkers();
    },
    [syncMarkers]
  );

  return entities.map((entity) => {
    const key = `${entity.type}-${entity.id}`;
    const color = entity.type === "Project" ? projectColor : builderColor;
    const label = entity.type === "Project" ? "P" : "B";
    return (
      <AdvancedMarker
        key={key}
        position={{ lat: entity.latitude, lng: entity.longitude }}
        ref={(m) => setMarkerRef(m, key)}
        onClick={(e) => {
          e.stop();
          onSelect(entity);
        }}
      >
        <div
          style={{ background: color }}
          className="grid h-9 w-9 place-items-center rounded-full border-4 border-white text-xs font-black text-white shadow-lg"
        >
          {label}
        </div>
      </AdvancedMarker>
    );
  });
}
