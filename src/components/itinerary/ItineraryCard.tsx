import { Map, RefreshCw, Sparkles } from 'lucide-react'
import type { BudgetSummary } from '../../types/pricing'
import type { TripPlan } from '../../types/trip'
import { AssistantAvatar } from '../AssistantAvatar'
import { BudgetSummaryPanel } from '../pricing/BudgetSummaryCard'
import { DayAccordion } from './DayAccordion'

interface ItineraryCardProps {
  chatItemId?: string
  tripPlan: TripPlan
  budgetSummary?: BudgetSummary
  expandedDay: number | null
  onExpandedDayChange: (day: number | null) => void
  onViewRoute: () => void
  onAction: (message: string) => void
}
export function ItineraryCard({
  chatItemId,
  tripPlan,
  budgetSummary,
  expandedDay,
  onExpandedDayChange,
  onViewRoute,
  onAction,
}: ItineraryCardProps) {
  const destinationLabel = tripPlan.destinations.join(' → ')
  const travelerCount =
    tripPlan.travelers.adults + tripPlan.travelers.children + tripPlan.travelers.seniors
  const paceLabel =
    tripPlan.pace === 'relaxed' ? '轻松' : tripPlan.pace === 'intensive' ? '紧凑' : ''
  const totalAdultReferenceTickets = tripPlan.itinerary.reduce(
    (sum, day) => sum + (day.estimatedCost ?? 0),
    0,
  )
  const sharedDailyCost = budgetSummary
    ? Math.max(budgetSummary.total - budgetSummary.attractions, 0) / tripPlan.days
    : 0
  const dailyCostFor = (estimatedCost = 0) => {
    const attractionCost = budgetSummary
      ? totalAdultReferenceTickets > 0
        ? budgetSummary.attractions * (estimatedCost / totalAdultReferenceTickets)
        : 0
      : estimatedCost * travelerCount
    const total = sharedDailyCost + attractionCost
    return {
      total,
      perPerson: travelerCount > 0 ? total / travelerCount : 0,
    }
  }

  return (
    <div id={chatItemId} className="trip-card-enter flex items-start gap-2.5">
      <AssistantAvatar />
      <article
        data-card-type="itinerary-budget"
        className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#E8EBEF] bg-white shadow-[0_6px_20px_rgba(31,41,55,0.06)]"
      >
        <div className="px-4 pb-3.5 pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#1677FF]">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EAF3FF]">
              <Sparkles size={12} />
            </span>
            AI 行程与预算
          </div>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#20242A]">
            {destinationLabel}{tripPlan.days}天{tripPlan.nights}晚{paceLabel}旅行
          </h2>
          <p className="mt-1.5 text-[10px] text-[#8A949E]">
            {travelerCount}人 · 人均约¥{tripPlan.budget.perPerson ?? 0} · {tripPlan.preferences.join(' / ')}
          </p>
        </div>

        <div className="border-y border-[#EEF0F3]">
          {tripPlan.itinerary.map((day) => {
            const dailyCost = dailyCostFor(day.estimatedCost)
            return (
              <DayAccordion
                key={day.day}
                day={day}
                totalCost={dailyCost.total}
                perPersonCost={dailyCost.perPerson}
                expanded={expandedDay === day.day}
                onToggle={() => onExpandedDayChange(expandedDay === day.day ? null : day.day)}
              />
            )
          })}
        </div>

        {budgetSummary && <BudgetSummaryPanel summary={budgetSummary} />}

        <div className="grid grid-cols-2 gap-2 p-3">
          <button
            type="button"
            className="card-action-button"
            onClick={onViewRoute}
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
