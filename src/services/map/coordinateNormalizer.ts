import type { CoordinateSystem, GeoLocation } from '../../types/tripRoute'

export interface SourceLocation {
  lng: number
  lat: number
  coordinateSystem: CoordinateSystem
}

export function normalizeToGcj02(location: SourceLocation): GeoLocation {
  if (location.coordinateSystem !== 'GCJ02') {
    throw new Error(`暂不支持在前端转换 ${location.coordinateSystem} 坐标，请在 POI 服务层统一为 GCJ02`)
  }
  return {
    lng: location.lng,
    lat: location.lat,
    coordinateSystem: 'GCJ02',
  }
}
