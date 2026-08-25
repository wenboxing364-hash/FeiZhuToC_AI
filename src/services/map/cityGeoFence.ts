interface LocationLike {
  lng: number
  lat: number
}

interface CityRouteArea {
  center: LocationLike
  maxDistanceKm: number
}

const CITY_ROUTE_AREAS: Record<string, CityRouteArea> = {
  长沙: {
    center: { lng: 112.9388, lat: 28.2282 },
    maxDistanceKm: 120,
  },
}

function normalizeCityName(city: string) {
  return city.trim().replace(/市$/, '')
}

function distanceInKm(left: LocationLike, right: LocationLike) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latDifference = toRadians(right.lat - left.lat)
  const lngDifference = toRadians(right.lng - left.lng)
  const leftLat = toRadians(left.lat)
  const rightLat = toRadians(right.lat)
  const haversine =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lngDifference / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function isExpectedCityLocation(
  location: LocationLike,
  expectedCity?: string,
  resolvedCity?: string,
) {
  if (!expectedCity) return true
  const normalizedExpected = normalizeCityName(expectedCity)
  if (resolvedCity && normalizeCityName(resolvedCity) !== normalizedExpected) return false

  const area = CITY_ROUTE_AREAS[normalizedExpected]
  return !area || distanceInKm(area.center, location) <= area.maxDistanceKm
}
