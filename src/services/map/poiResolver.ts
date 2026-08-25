import type { RouteStop } from '../../types/tripRoute'
import {
  loadAmap,
  type AMapGlobal,
  type AMapLngLatLike,
  type AMapPoi,
  type AMapPlaceSearchResult,
} from './amapLoader'
import { normalizeToGcj02 } from './coordinateNormalizer'
import { isExpectedCityLocation } from './cityGeoFence'

const resolvedPoiCache = new Map<string, RouteStop>()

function normalizePoiName(value: string) {
  return value
    .replace(/长沙|周边|景区|旅游区|湖南/g, '')
    .replace(/\s|·|（|）|\(|\)/g, '')
    .toLocaleLowerCase('zh-CN')
}

function locationNumbers(location: AMapLngLatLike | undefined) {
  if (!location) return undefined
  const lng = location.getLng?.() ?? location.lng
  const lat = location.getLat?.() ?? location.lat
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return undefined
  return { lng: lng as number, lat: lat as number }
}

function poiScore(poi: AMapPoi, stop: RouteStop) {
  const target = normalizePoiName(stop.name)
  const candidate = normalizePoiName(poi.name ?? '')
  let score = 0
  if (candidate === target) score += 100
  else if (candidate.includes(target) || target.includes(candidate)) score += 55
  if (poi.cityname?.includes(stop.city ?? '')) score += 25
  if (/风景名胜|科教文化|购物服务|生活服务/.test(poi.type ?? '')) score += 10
  if (locationNumbers(poi.location)) score += 20
  return score
}

function isRelevantPoi(poi: AMapPoi, stop: RouteStop) {
  const target = normalizePoiName(stop.name)
  const candidate = normalizePoiName(poi.name ?? '')
  const location = locationNumbers(poi.location)
  const nameMatches =
    target.length >= 2 &&
    candidate.length >= 2 &&
    (candidate === target || candidate.includes(target) || target.includes(candidate))
  return (
    nameMatches &&
    location !== undefined &&
    isExpectedCityLocation(location, stop.city, poi.cityname)
  )
}

function searchPoi(amap: AMapGlobal, stop: RouteStop): Promise<AMapPoi | undefined> {
  const search = new amap.PlaceSearch({
    city: stop.city,
    citylimit: true,
    pageSize: 10,
    pageIndex: 1,
    extensions: 'all',
  })
  return new Promise((resolve) => {
    search.search(`${stop.city ?? ''} ${stop.name}`.trim(), (status, result) => {
      if (status !== 'complete' || typeof result === 'string') {
        resolve(undefined)
        return
      }
      const pois = (result as AMapPlaceSearchResult).poiList?.pois ?? []
      resolve(
        pois
          .filter((poi) => isRelevantPoi(poi, stop))
          .sort((left, right) => poiScore(right, stop) - poiScore(left, stop))[0],
      )
    })
  })
}

export async function resolveRouteStopPoi(stop: RouteStop, amap?: AMapGlobal): Promise<RouteStop> {
  const cacheKey = `${stop.city ?? ''}:${normalizePoiName(stop.name)}`
  const cached = resolvedPoiCache.get(cacheKey)
  if (
    cached?.location &&
    isExpectedCityLocation(cached.location, stop.city, cached.city)
  ) {
    return { ...stop, ...cached, id: stop.id, order: stop.order, time: stop.time }
  }
  if (cached) resolvedPoiCache.delete(cacheKey)

  const sdk = amap ?? (await loadAmap())
  const poi = await searchPoi(sdk, stop)
  const numbers = locationNumbers(poi?.location)
  if (!poi || !numbers) {
    if (import.meta.env.DEV) console.warn(`[TripRoute] 无法解析 POI：${stop.city ?? ''} ${stop.name}`)
    return { ...stop, resolutionStatus: 'unresolved' }
  }

  const resolved: RouteStop = {
    ...stop,
    poiId: poi.id,
    name: poi.name ?? stop.name,
    address: Array.isArray(poi.address) ? poi.address.join('') : poi.address,
    city: poi.cityname ?? stop.city,
    location: normalizeToGcj02({ ...numbers, coordinateSystem: 'GCJ02' }),
    image: poi.photos?.[0]?.url
      ? { url: poi.photos[0].url, alt: `${poi.name ?? stop.name}景点照片` }
      : stop.image,
    resolutionStatus: 'resolved',
  }
  resolvedPoiCache.set(cacheKey, resolved)
  return resolved
}

export async function resolveRouteStops(stops: RouteStop[]): Promise<RouteStop[]> {
  const amap = await loadAmap()
  return Promise.all(stops.map((stop) => resolveRouteStopPoi(stop, amap)))
}
