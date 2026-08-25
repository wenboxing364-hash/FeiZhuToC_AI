export interface AMapLngLatLike {
  getLng?: () => number
  getLat?: () => number
  lng?: number
  lat?: number
}

export interface AMapPoiPhoto {
  url?: string
}

export interface AMapPoi {
  id?: string
  name?: string
  address?: string | string[]
  cityname?: string
  type?: string
  location?: AMapLngLatLike
  photos?: AMapPoiPhoto[]
}

export interface AMapPlaceSearchResult {
  poiList?: {
    pois?: AMapPoi[]
  }
}

export interface AMapPlaceSearchInstance {
  search: (
    keyword: string,
    callback: (status: string, result: AMapPlaceSearchResult | string) => void,
  ) => void
}

export interface AMapMapInstance {
  destroy: () => void
  getZoom: () => number
  setZoom: (zoom: number) => void
  setZoomAndCenter: (
    zoom: number,
    center: [number, number],
    immediately?: boolean,
    duration?: number,
  ) => void
  setFitView: (
    overlays?: AMapOverlayInstance[],
    immediately?: boolean,
    avoid?: [number, number, number, number],
    maxZoom?: number,
  ) => void
  on: (event: string, handler: () => void) => void
}

export interface AMapOverlayInstance {
  setMap: (map: AMapMapInstance | null) => void
}

export interface AMapMarkerInstance extends AMapOverlayInstance {
  setzIndex?: (zIndex: number) => void
}

export interface AMapGlobal {
  Map: new (
    container: HTMLElement,
    options: Record<string, unknown>,
  ) => AMapMapInstance
  Marker: new (options: Record<string, unknown>) => AMapMarkerInstance
  Polyline: new (options: Record<string, unknown>) => AMapOverlayInstance
  PlaceSearch: new (options: Record<string, unknown>) => AMapPlaceSearchInstance
}

declare global {
  interface Window {
    AMap?: AMapGlobal
    _AMapSecurityConfig?: { securityJsCode: string }
  }
}

let loaderPromise: Promise<AMapGlobal> | undefined

export class MissingAmapKeyError extends Error {
  constructor() {
    super('未配置 VITE_AMAP_KEY')
    this.name = 'MissingAmapKeyError'
  }
}

export function loadAmap(): Promise<AMapGlobal> {
  if (window.AMap) return Promise.resolve(window.AMap)
  if (loaderPromise) return loaderPromise

  const key = import.meta.env.VITE_AMAP_KEY?.trim()
  if (!key) return Promise.reject(new MissingAmapKeyError())

  const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE?.trim()
  if (securityCode) window._AMapSecurityConfig = { securityJsCode: securityCode }

  loaderPromise = new Promise<AMapGlobal>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('#amap-jsapi-script')
    const handleLoad = () => {
      if (window.AMap) resolve(window.AMap)
      else reject(new Error('高德地图 SDK 加载完成但未初始化'))
    }
    const handleError = () => reject(new Error('高德地图 SDK 加载失败'))

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'amap-jsapi-script'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.PlaceSearch`
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    loaderPromise = undefined
    throw error
  })

  return loaderPromise
}
