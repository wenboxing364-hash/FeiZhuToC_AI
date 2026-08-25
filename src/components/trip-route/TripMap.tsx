import { LoaderCircle, LocateFixed, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { loadAmap, MissingAmapKeyError } from '../../services/map/amapLoader'
import { isExpectedCityLocation } from '../../services/map/cityGeoFence'
import type { RouteStop, TransportSegment } from '../../types/tripRoute'
import { AMapAdapter } from './map/AMapAdapter'

interface TripMapProps {
  day: number
  stops: RouteStop[]
  segments: TransportSegment[]
  selectedStopId?: string
  resolving: boolean
  panelCollapsed: boolean
  focusRequest?: {
    stopId: string
    requestId: number
  }
  fitRequestId: number
  onStopSelect: (stopId: string) => void
  onStartLocate: (stopId: string) => void
}

export function TripMap({
  day,
  stops,
  segments,
  selectedStopId,
  resolving,
  panelCollapsed,
  focusRequest,
  fitRequestId,
  onStopSelect,
  onStartLocate,
}: TripMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<AMapAdapter | undefined>(undefined)
  const selectedStopRef = useRef(selectedStopId)
  const focusRequestRef = useRef(focusRequest)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')

  const getBottomPadding = useCallback(() => {
    const stageHeight = canvasRef.current?.clientHeight ?? 0
    return panelCollapsed ? 72 : Math.min(Math.round(stageHeight * 0.54), 430)
  }, [panelCollapsed])

  const fitRoute = useCallback(() => {
    adapterRef.current?.fitRoute(getBottomPadding())
  }, [getBottomPadding])

  const routeStart = stops.find((stop) => stop.order === 1) ?? stops[0]

  const locateRouteStart = useCallback(() => {
    if (!routeStart) return
    fitRoute()
    onStartLocate(routeStart.id)
  }, [fitRoute, onStartLocate, routeStart])

  useEffect(() => {
    let disposed = false
    loadAmap()
      .then((amap) => {
        if (disposed || !canvasRef.current) return
        adapterRef.current = new AMapAdapter(amap, canvasRef.current)
        setMapReady(true)
      })
      .catch((error: unknown) => {
        if (disposed) return
        setMapError(
          error instanceof MissingAmapKeyError
            ? '配置高德地图 Key 后即可查看真实地图'
            : '地图暂时无法加载，路线列表仍可查看',
        )
      })
    return () => {
      disposed = true
      adapterRef.current?.destroy()
      adapterRef.current = undefined
    }
  }, [])

  useEffect(() => {
    selectedStopRef.current = selectedStopId
    adapterRef.current?.setSelected(selectedStopId)
  }, [selectedStopId])

  useEffect(() => {
    focusRequestRef.current = focusRequest
  }, [focusRequest])

  useEffect(() => {
    if (!mapReady || !focusRequest) return
    const stop = stops.find((item) => item.id === focusRequest.stopId)
    if (!stop?.location) return
    adapterRef.current?.focusStop(stop, getBottomPadding())
  }, [focusRequest, getBottomPadding, mapReady, stops])

  useEffect(() => {
    if (!mapReady) return
    const adapter = adapterRef.current
    adapter?.renderRoute(stops, segments, selectedStopRef.current, onStopSelect)
    const timer = window.setTimeout(() => {
      const requestedStop = stops.find(
        (stop) => stop.id === focusRequestRef.current?.stopId && stop.location,
      )
      if (requestedStop) {
        adapter?.focusStop(requestedStop, getBottomPadding())
      } else {
        fitRoute()
      }
    }, 80)
    return () => window.clearTimeout(timer)
  }, [day, fitRoute, getBottomPadding, mapReady, onStopSelect, segments, stops])

  useEffect(() => {
    if (!mapReady || fitRequestId === 0) return
    const timer = window.setTimeout(fitRoute, 100)
    return () => window.clearTimeout(timer)
  }, [fitRequestId, fitRoute, mapReady])

  const resolvedCount = stops.filter(
    (stop) => stop.location && isExpectedCityLocation(stop.location, stop.city),
  ).length

  return (
    <section className="trip-map-stage" aria-label={`Day ${day} 行程地图`}>
      <div ref={canvasRef} className="trip-map-canvas" />

      {(mapError || (mapReady && !resolving && resolvedCount === 0)) && (
        <div className="trip-map-message" role="status">
          <LocateFixed size={24} aria-hidden="true" />
          <strong>{mapError ? '地图服务待就绪' : '暂未定位到当天景点'}</strong>
          <span>{mapError || '你仍然可以继续查看下方路线安排'}</span>
        </div>
      )}

      {resolving && (
        <div className="trip-map-resolving" role="status">
          <LoaderCircle size={15} className="animate-spin" />
          正在匹配真实景点
        </div>
      )}

      {!mapError && (
        <>
          <button
            type="button"
            className="trip-map-fit-control"
            onClick={locateRouteStart}
            disabled={!mapReady || resolvedCount === 0}
            aria-label={`显示 Day ${day} 完整路线`}
          >
            <LocateFixed size={25} fill="currentColor" strokeWidth={1.8} />
            <span>定位路线</span>
          </button>

          <div className="trip-map-zoom-controls" aria-label="地图缩放控件">
            <button
              type="button"
              onClick={() => adapterRef.current?.zoomIn()}
              disabled={!mapReady}
              aria-label="放大地图"
            >
              <Plus size={24} />
            </button>
            <span />
            <button
              type="button"
              onClick={() => adapterRef.current?.zoomOut()}
              disabled={!mapReady}
              aria-label="缩小地图"
            >
              <Minus size={24} />
            </button>
          </div>
        </>
      )}
    </section>
  )
}
