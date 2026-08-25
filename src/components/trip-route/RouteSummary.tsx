import { ArrowLeftRight, Clock3, MapPin } from 'lucide-react'
import type { DayRoute } from '../../types/tripRoute'

interface RouteSummaryProps {
  route: DayRoute
}

export function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <header className="route-summary">
      <h2>
        Day {route.day} <span>·</span> {route.title}
      </h2>
      <div className="route-summary-stats">
        <span>
          <MapPin size={18} fill="currentColor" />
          {route.stops.length}个地点
        </span>
        <span>
          <ArrowLeftRight size={19} />约{route.totalDistance}km
        </span>
        <span>
          <Clock3 size={18} />约{route.totalTransportTime}分钟交通
        </span>
      </div>
    </header>
  )
}
