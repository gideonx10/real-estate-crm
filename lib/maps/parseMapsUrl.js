// Detects whether a string is a Google Maps URL (any format)
export function isMapsUrl(text) {
  const t = text.trim();
  return (
    /^https?:\/\/(www\.)?maps\.app\.goo\.gl\//i.test(t) ||
    /^https?:\/\/goo\.gl\/maps\//i.test(t) ||
    /^https?:\/\/(www\.)?google\.com\/maps/i.test(t)
  );
}

// Short links require server-side redirect resolution
export function isShortMapsUrl(url) {
  return (
    /^https?:\/\/(www\.)?maps\.app\.goo\.gl\//i.test(url) ||
    /^https?:\/\/goo\.gl\/maps\//i.test(url)
  );
}

// Extract { latitude, longitude } from a full Google Maps URL, or null
export function extractCoordsFromUrl(url) {
  try {
    // @lat,lng format — most common (place, search, dir, plain @)
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { latitude: lat, longitude: lng };
      }
    }

    const parsed = new URL(url);

    // ?q=lat,lng
    const q = parsed.searchParams.get("q");
    if (q) {
      const m = q.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (m) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { latitude: lat, longitude: lng };
        }
      }
    }

    // ll=lat,lng parameter
    const ll = parsed.searchParams.get("ll");
    if (ll) {
      const m = ll.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
      if (m) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { latitude: lat, longitude: lng };
        }
      }
    }
  } catch {
    // Not a valid URL
  }
  return null;
}

// Parse a Maps URL and return a typed result for the caller to act on:
//   { type: 'coords', latitude, longitude }
//   { type: 'short', url }              — needs server-side resolution
//   { type: 'text', query }             — place-name query, use Places autocomplete
//   null                                — not a Maps URL
export function parseMapsUrl(input) {
  const trimmed = input.trim();
  if (!isMapsUrl(trimmed)) return null;

  if (isShortMapsUrl(trimmed)) {
    return { type: "short", url: trimmed };
  }

  const coords = extractCoordsFromUrl(trimmed);
  if (coords) return { type: "coords", ...coords };

  // Fall back to extracting a text query for Places autocomplete
  try {
    const parsed = new URL(trimmed);
    const q = parsed.searchParams.get("q");
    if (q) return { type: "text", query: q };

    // /maps/place/PlaceName/ path segment
    const placeMatch = trimmed.match(/\/maps\/place\/([^/@?#]+)/);
    if (placeMatch) {
      return {
        type: "text",
        query: decodeURIComponent(placeMatch[1].replace(/\+/g, " ")),
      };
    }
  } catch {
    // ignore
  }

  return null;
}
