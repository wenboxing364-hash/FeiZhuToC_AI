import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { DayRoute } from '../../types/tripRoute'
import { RouteSummary } from './RouteSummary'
import { RouteTimeline } from './RouteTimeline'

interface RouteDetailPanelProps {
  route: DayRoute
  selectedStopId?: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onStopSelect: (stopId: string) => void
}

export function RouteDetailPanel({
  route,
  selectedStopId,
  collapsed,
  onCollapsedChange,
  onStopSelect,
}: RouteDetailPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const dragStartRef = useRef<number | undefined>(undefined)
  const dragOffsetRef = useRef(0)
  const suppressClickRef = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const updateDragOffset = (value: number) => {
    dragOffsetRef.current = value
    setDragOffset(value)
  }

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragStartRef.current = event.clientY
    suppressClickRef.current = false
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStartRef.current === undefined) return
    const delta = event.clientY - dragStartRef.current
    const maxTravel = Math.max((panelRef.current?.clientHeight ?? 320) - 42, 0)
    const nextOffset = collapsed
      ? Math.max(-maxTravel, Math.min(0, delta))
      : Math.min(maxTravel, Math.max(0, delta))
    if (Math.abs(delta) > 6) suppressClickRef.current = true
    updateDragOffset(nextOffset)
  }

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragStartRef.current === undefined) return
    const finalDelta = event.clientY - dragStartRef.current
    if (Math.abs(finalDelta) > 6) suppressClickRef.current = true
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!collapsed && finalDelta > 64) onCollapsedChange(true)
    if (collapsed && finalDelta < -48) onCollapsedChange(false)
    dragStartRef.current = undefined
    updateDragOffset(0)
    setDragging(false)
  }

  const transform = collapsed
    ? `translateY(calc(100% - 42px + ${dragOffset}px))`
    : `translateY(${dragOffset}px)`

  return (
    <section
      ref={panelRef}
      className={`route-detail-panel ${dragging ? 'route-panel-dragging' : ''}`}
      data-route-panel-scroll
      data-collapsed={collapsed}
      style={{ transform }}
    >
      <button
        type="button"
        className="route-panel-grab-zone"
        aria-label={collapsed ? '展开路线详情' : '收起路线详情'}
        aria-expanded={!collapsed}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false
            return
          }
          onCollapsedChange(!collapsed)
        }}
      >
        <span aria-hidden="true" />
      </button>
      <RouteSummary route={route} />
      <RouteTimeline
        route={route}
        selectedStopId={selectedStopId}
        onStopSelect={onStopSelect}
      />
    </section>
  )
}
