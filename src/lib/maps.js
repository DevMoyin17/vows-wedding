/**
 * Google Maps deep links — no API key required for navigation.
 * If VITE_GOOGLE_MAPS_API_KEY is provided, links can also use the
 * Maps URLs API conventions; the universal directions URL works everywhere.
 */

/** Turn-by-turn directions to a venue. */
export function directionsUrl(venue) {
  const destination = venue.coords
    ? `${venue.coords.lat},${venue.coords.lng}`
    : venue.fullAddress || venue.address;
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });
  if (venue.coords) params.set("destination_place_id", "");
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Open the venue on Google Maps. */
export function placeUrl(venue) {
  const query = venue.fullAddress || venue.name;
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query }).toString()}`;
}
