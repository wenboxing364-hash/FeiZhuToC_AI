import { Map, RefreshCw, Sparkles } from 'lucide-react'
import type { TripPlan } from '../../types/trip'
import { AssistantAvatar } from '../AssistantAvatar'
import { DayAccordion } from './DayAccordion'

interface ItineraryCardProps {
  tripPlan: TripPlan
  expandedDay: number | null
  onExpandedDayChange: (day: number | null) => void
  onAction: (message: string) => void
}
export function ItineraryCard({
  tripPlan,
  expandedDay,
  onExpandedDayChange,
  onAction,
}: ItineraryCardProps) {
  const destinationLabel = tripPlan.destinations.join(' → ')

  return (
    <div className="trip-card-enter flex items-start gap-2.5">
      <AssistantAvatar />
      <article className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#E8EBEF] bg-white shadow-[0_6px_20px_rgba(31,41,55,0.06)]">
        <div className="px-4 pb-3.5 pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#1677FF]">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EAF3FF]">
              <Sparkles size={12} />
            </span>
            AI规划
          </div>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#20242A]">
            {destinationLabel}{tripPlan.days}天{tripPlan.nights}晚轻松旅行
          </h2>
          <p className="mt-1.5 text-[10px] text-[#8A949E]">
            {tripPlan.travelers}人 · 人均约¥{tripPlan.budget.perPerson ?? 0} · {tripPlan.preferences.join(' / ')}
          </p>
        </div>

        <div className="border-y border-[#EEF0F3]">
          {tripPlan.itinerary.map((day) => (
            <DayAccordion
              key={day.day}
              day={day}
              expanded={expandedDay === day.day}
              onToggle={() => onExpandedDayChange(expandedDay === day.day ? null : day.day)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          <button
            type="button"
            className="card-action-button"
            onClick={() => onAction('路线预览将在下一版本开放')}
          >
            <Map size={14} />
            查看路线
          </button>
          <button
            type="button"
            className="card-action-button"
            onClick={() => onAction('已按当前偏好重新生成（Demo）')}
          >
            <RefreshCw size={14} />
            重新生成
          </button>
        </div>
      </article>
    </div>
  )
}
