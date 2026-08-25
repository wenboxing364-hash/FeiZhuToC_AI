import { MapPinned } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DaySelector } from '../components/trip-route/DaySelector'
import { RouteDetailPanel } from '../components/trip-route/RouteDetailPanel'
import { RouteHeader } from '../components/trip-route/RouteHeader'
import { TripMap } from '../components/trip-route/TripMap'
import { MissingAmapKeyError } from '../services/map/amapLoader'
import { resolveRouteStops } from '../services/map/poiResolver'
import {
  normalizeTripPlanToRoutes,
  updateRouteWithResolvedStops,
} from '../services/map/routeNormalizer'
import type { TripPlan } from '../types/trip'
import type { DayRoute } from '../types/tripRoute'

interface TripRoutePageProps {
  tripPlan?: TripPlan
  onBack: () => void
}

export function TripRoutePage({ tripPlan, onBack }: TripRoutePageProps) {
  const normalizedRoutes = useMemo(
    () => (tripPlan ? normalizeTripPlanToRoutes(tripPlan) : []),
    [tripPlan],
  )
  const [routes, setRoutes] = useState<DayRoute[]>(normalizedRoutes)
  const [activeDay, setActiveDay] = useState(normalizedRoutes[0]?.day ?? 1)
  const [selectedStopId, setSelectedStopId] = useState<string | undefined>(
    normalizedRoutes[0]?.stops[0]?.id,
  )
  const [resolvingDay, setResolvingDay] = useState<number>()
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [focusRequest, setFocusRequest] = useState<{
    stopId: string
    requestId: number
  }>()
  const [fitRequestId, setFitRequestId] = useState(0)
  const focusRequestIdRef = useRef(0)
  const attemptedDaysRef = useRef(new Set<number>())

  const currentRoute = routes.find((route) => route.day === activeDay)

  useEffect(() => {
    if (!currentRoute || attemptedDaysRef.current.has(currentRoute.day)) return
    attemptedDaysRef.current.add(currentRoute.day)
    setResolvingDay(currentRoute.day)
    resolveRouteStops(currentRoute.stops)
      .then((stops) => {
        setRoutes((current) =>
          current.map((route) =>
            route.day === currentRoute.day ? updateRouteWithResolvedStops(route, stops) : route,
          ),
        )
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV && !(error instanceof MissingAmapKeyError)) {
          console.warn('[TripRoute] POI 解析服务不可用', error)
        }
        setRoutes((current) =>
          current.map((route) =>
            route.day === currentRoute.day
              ? {
                  ...route,
                  stops: route.stops.map((stop) => ({ ...stop, resolutionStatus: 'unresolved' })),
                }
              : route,
          ),
        )
      })
      .finally(() => setResolvingDay((day) => (day === currentRoute.day ? undefined : day)))
  }, [currentRoute])

  const selectStop = useCallback((stopId: string) => {
    setSelectedStopId(stopId)
    setPanelCollapsed(false)
    focusRequestIdRef.current += 1
    setFocusRequest({ stopId, requestId: focusRequestIdRef.current })
  }, [])

  const locateRouteStart = useCallback((stopId: string) => {
    setSelectedStopId(stopId)
    setFocusRequest(undefined)
    setFitRequestId((requestId) => requestId + 1)
  }, [])

  const changeDay = (day: number) => {
    const route = routes.find((item) => item.day === day)
    const routeStart = route?.stops.find((stop) => stop.order === 1) ?? route?.stops[0]
    setActiveDay(day)
    setSelectedStopId(routeStart?.id)
    setFocusRequest(undefined)
    setFitRequestId((requestId) => requestId + 1)
  }

  if (!tripPlan || routes.length === 0) {
    return (
      <div className="route-page-shell">
        <RouteHeader onBack={onBack} />
        <div className="route-empty-state">
          <span>
            <MapPinned size={30} />
          </span>
          <h2>暂无路线信息</h2>
          <p>完成行程规划后即可查看路线</p>
          <button type="button" onClick={onBack}>
            返回行程
          </button>
        </div>
      </div>
    )
  }

  if (!currentRoute) return null

  return (
    <div className="route-page-shell" data-active-route-day={activeDay}>
      <RouteHeader onBack={onBack} />
      <DaySelector routes={routes} activeDay={activeDay} onDayChange={changeDay} />
      <div
        className={`route-map-workspace ${panelCollapsed ? 'route-panel-collapsed' : ''}`}
      >
        <TripMap
          day={currentRoute.day}
          stops={currentRoute.stops}
          segments={currentRoute.segments}
          selectedStopId={selectedStopId}
          resolving={resolvingDay === currentRoute.day}
          panelCollapsed={panelCollapsed}
          focusRequest={focusRequest}
          fitRequestId={fitRequestId}
          onStopSelect={selectStop}
          onStartLocate={locateRouteStart}
        />
        <RouteDetailPanel
          route={currentRoute}
          selectedStopId={selectedStopId}
          collapsed={panelCollapsed}
          onCollapsedChange={setPanelCollapsed}
          onStopSelect={selectStop}
        />
      </div>
    </div>
  )
}
