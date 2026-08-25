import { findChangshaAttraction } from '../../data/travel/attractions'
import type { TimelineItem, TripPlan } from '../../types/trip'
import type {
  DayRoute,
  RouteImage,
  RouteStop,
  TransportSegment,
  TransportType,
} from '../../types/tripRoute'

const DEMO_SEGMENTS: Array<{
  type: TransportType
  duration: number
  distance: number
  price?: number
}> = [
  { type: 'metro', duration: 8, distance: 2.1, price: 2 },
  { type: 'walk', duration: 15, distance: 1.2 },
  { type: 'taxi', duration: 12, distance: 4.3, price: 18 },
  { type: 'walk', duration: 10, distance: 0.8 },
  { type: 'bus', duration: 16, distance: 3.5, price: 2 },
]

const THUMBNAIL_OFFSETS = [
  { x: -70, y: -76 },
  { x: 18, y: -78 },
  { x: 18, y: -50 },
  { x: -70, y: -52 },
  { x: 18, y: -20 },
]

function fallbackImage(activity: TimelineItem): RouteImage | undefined {
  const attraction = activity.attractionId
    ? findChangshaAttraction(activity.attractionId)
    : undefined
  const url = attraction?.images?.cover
  return url ? { url, alt: `${attraction.name}景点照片` } : undefined
}

function isMappableActivity(activity: TimelineItem) {
  return !activity.activityType || activity.activityType === 'attraction'
}

function createSegments(stops: RouteStop[]): TransportSegment[] {
  return stops.slice(0, -1).map((stop, index) => {
    const preset = DEMO_SEGMENTS[index % DEMO_SEGMENTS.length]
    return {
      fromStopId: stop.id,
      toStopId: stops[index + 1].id,
      ...preset,
    }
  })
}

function summarizeSegments(segments: TransportSegment[]) {
  return {
    totalDistance: Number(segments.reduce((sum, segment) => sum + segment.distance, 0).toFixed(1)),
    totalTransportTime: segments.reduce((sum, segment) => sum + segment.duration, 0),
  }
}

export function normalizeTripPlanToRoutes(plan: TripPlan): DayRoute[] {
  return plan.itinerary.map((day) => {
    const stops = day.activities.filter(isMappableActivity).map<RouteStop>((activity, index) => ({
      id: activity.id,
      order: index + 1,
      time: activity.time,
      name: activity.place,
      description: activity.description,
      city: day.city,
      attractionId: activity.attractionId,
      image: fallbackImage(activity),
      resolutionStatus: 'pending',
      thumbnailOffset: THUMBNAIL_OFFSETS[index % THUMBNAIL_OFFSETS.length],
    }))
    const segments = createSegments(stops)
    return {
      day: day.day,
      title: day.title,
      stops,
      segments,
      ...summarizeSegments(segments),
    }
  })
}

function distanceInKm(left: RouteStop, right: RouteStop) {
  if (!left.location || !right.location) return undefined
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latDifference = toRadians(right.location.lat - left.location.lat)
  const lngDifference = toRadians(right.location.lng - left.location.lng)
  const leftLat = toRadians(left.location.lat)
  const rightLat = toRadians(right.location.lat)
  const haversine =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(leftLat) * Math.cos(rightLat) * Math.sin(lngDifference / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)) * 1.18
}

function estimateDuration(type: TransportType, distance: number) {
  const minutesPerKm = { walk: 13, metro: 3, bus: 4.5, taxi: 2.7 }[type]
  const fixedMinutes = { walk: 0, metro: 7, bus: 5, taxi: 4 }[type]
  return Math.max(1, Math.round(distance * minutesPerKm + fixedMinutes))
}

function estimatePrice(type: TransportType, distance: number) {
  if (type === 'walk') return undefined
  if (type === 'bus') return 2
  if (type === 'metro') return Math.max(2, Math.min(7, Math.ceil(distance / 4) + 1))
  return Math.round(8 + distance * 2.2)
}

export function updateRouteWithResolvedStops(route: DayRoute, stops: RouteStop[]): DayRoute {
  const byId = new Map(stops.map((stop) => [stop.id, stop]))
  const segments = route.segments.map((segment) => {
    const from = byId.get(segment.fromStopId)
    const to = byId.get(segment.toStopId)
    const distance = from && to ? distanceInKm(from, to) : undefined
    if (distance === undefined) return segment
    const roundedDistance = Number(distance.toFixed(1))
    return {
      ...segment,
      distance: roundedDistance,
      duration: estimateDuration(segment.type, roundedDistance),
      price: estimatePrice(segment.type, roundedDistance),
    }
  })
  return { ...route, stops, segments, ...summarizeSegments(segments) }
}
