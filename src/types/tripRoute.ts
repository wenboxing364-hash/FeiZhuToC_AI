export type TransportType = 'walk' | 'metro' | 'bus' | 'taxi'

export type CoordinateSystem = 'GCJ02' | 'WGS84' | 'BD09'

export interface GeoLocation {
  lng: number
  lat: number
  coordinateSystem: 'GCJ02'
}

export interface RoutePoint {
  lng: number
  lat: number
}

export interface RouteImage {
  url: string
  alt: string
}

export type PoiResolutionStatus = 'pending' | 'resolved' | 'unresolved'

export interface TransportSegment {
  fromStopId: string
  toStopId: string
  type: TransportType
  duration: number
  distance: number
  price?: number
  path?: RoutePoint[]
}

export interface RouteStop {
  id: string
  poiId?: string
  order: number
  time: string
  name: string
  description?: string
  city?: string
  address?: string
  attractionId?: string
  location?: GeoLocation
  image?: RouteImage
  resolutionStatus: PoiResolutionStatus
  thumbnailOffset?: {
    x: number
    y: number
  }
}

export interface DayRoute {
  day: number
  title: string
  totalDistance: number
  totalTransportTime: number
  stops: RouteStop[]
  segments: TransportSegment[]
}
