import { BusFront, CarFront, Footprints, TrainFront } from 'lucide-react'
import { Fragment, useEffect, useRef } from 'react'
import type { ComponentType, SVGProps } from 'react'
import type { DayRoute, TransportSegment, TransportType } from '../../types/tripRoute'

interface RouteTimelineProps {
  route: DayRoute
  selectedStopId?: string
  onStopSelect: (stopId: string) => void
}

const TRANSPORT_META: Record<
  TransportType,
  { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  walk: { label: '步行', icon: Footprints },
  metro: { label: '地铁', icon: TrainFront },
  bus: { label: '公交', icon: BusFront },
  taxi: { label: '打车', icon: CarFront },
}

function TransportItem({ segment }: { segment: TransportSegment }) {
  const meta = TRANSPORT_META[segment.type]
  const Icon = meta.icon
  return (
    <li className={`route-transport-item route-transport-${segment.type}`}>
      <span className="route-transport-icon">
        <Icon width={19} height={19} />
      </span>
      <div>
        <strong>
          <Icon width={15} height={15} />
          {meta.label}
        </strong>
        <p>
          {segment.duration}分钟 <span>·</span> {segment.distance}km
          {segment.price !== undefined && (
            <>
              {' '}
              <span>·</span> ¥{segment.price}
            </>
          )}
        </p>
      </div>
    </li>
  )
}

export function RouteTimeline({ route, selectedStopId, onStopSelect }: RouteTimelineProps) {
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>(
      `[data-route-stop-id="${CSS.escape(selectedStopId ?? '')}"]`,
    )
    const panel = listRef.current?.closest<HTMLElement>('[data-route-panel-scroll]')
    if (!selected || !panel) return
    const panelRect = panel.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()
    const target =
      panel.scrollTop +
      selectedRect.top -
      panelRect.top -
      panel.clientHeight / 2 +
      selectedRect.height / 2
    panel.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [selectedStopId])

  return (
    <ol ref={listRef} className="route-timeline" aria-label={`Day ${route.day} 路线详情`}>
      {route.stops.map((stop, index) => {
        const selected = stop.id === selectedStopId
        const segment = route.segments[index]
        return (
          <Fragment key={stop.id}>
            <li
              data-route-stop-id={stop.id}
              className={`route-stop-item ${selected ? 'route-stop-selected' : ''}`}
            >
              <button type="button" onClick={() => onStopSelect(stop.id)} aria-pressed={selected}>
                <span className="route-stop-number">{stop.order}</span>
                <time>{stop.time}</time>
                <span className="route-stop-copy">
                  <strong>{stop.name}</strong>
                  <span>{stop.description}</span>
                  {stop.resolutionStatus === 'unresolved' && (
                    <small>地图位置暂未匹配</small>
                  )}
                </span>
              </button>
            </li>
            {segment && <TransportItem segment={segment} />}
          </Fragment>
        )
      })}
    </ol>
  )
}
