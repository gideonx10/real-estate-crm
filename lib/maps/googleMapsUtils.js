export const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export const MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
export const INDIA_CENTER = { lat: 22.9734, lng: 78.6569 };
export const DELHI_CENTER = { lat: 28.6139, lng: 77.209 };

export function formatCoord(value) {
  return Number(Number(value).toFixed(7));
}

export function coordsToLatLng(coords) {
  if (!coords) return null;
  return { lat: coords.latitude, lng: coords.longitude };
}

export function mapsNavUrl(lat, lng) {
  return `https://maps.google.com/maps?q=${lat},${lng}`;
}

export function isValidCoords(entity) {
  return (
    Number.isFinite(entity.latitude) &&
    Number.isFinite(entity.longitude) &&
    entity.latitude >= -90 &&
    entity.latitude <= 90 &&
    entity.longitude >= -180 &&
    entity.longitude <= 180 &&
    !(entity.latitude === 0 && entity.longitude === 0)
  );
}
