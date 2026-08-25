import { ChevronDown } from 'lucide-react'
import type { TripDay } from '../../types/trip'
import { Timeline } from './Timeline'

interface DayAccordionProps {
  day: TripDay
  totalCost: number
  perPersonCost: number
  expanded: boolean
  onToggle: () => void
}

function formatMoney(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits }).format(value)
}

export function DayAccordion({
  day,
  totalCost,
  perPersonCost,
  expanded,
  onToggle,
}: DayAccordionProps) {
  const intensityLabel =
    day.intensity === 'relaxed' ? '轻松' : day.intensity === 'normal' ? '适中' : '紧凑'
  return (
    <section
      id={`trip-day-${day.day}`}
      data-area={day.area}
      data-intensity={day.intensity}
      className="scroll-mt-3 border-t border-[#EEF0F3] first:border-t-0"
    >
      <button
        type="button"
        className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-[#FAFBFC] active:bg-[#F5F7FA]"
        aria-expanded={expanded}
        aria-controls={`day-${day.day}-content`}
        onClick={onToggle}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-[#20242A]">Day {day.day}</span>
            <span className="text-[#C5CAD0]">|</span>
            <span className="truncate text-[12px] font-semibold text-[#20242A]">{day.title}</span>
          </div>
          {day.theme && (
            <p className="mt-1 truncate text-[9px] leading-4 text-[#8A949E]">{day.theme}</p>
          )}
        </div>
        {!expanded ? (
          <span className="rounded-full bg-[#EAF8F2] px-2 py-1 text-[9px] font-medium text-[#37B27C]">
            {intensityLabel}
          </span>
        ) : (
          <ChevronDown
            size={16}
            className={`mt-0.5 shrink-0 text-[#6E7883] transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      <div
        id={`day-${day.day}-content`}
        aria-hidden={!expanded}
        inert={!expanded}
        className={`accordion-grid ${expanded ? 'accordion-grid-open' : ''}`}
      >
        <div className="overflow-hidden">
          <Timeline items={day.activities} />
          <div
            data-day-total-cost={totalCost}
            data-day-per-person-cost={perPersonCost}
            className="mx-4 mb-3 grid grid-cols-[1.45fr_0.55fr] rounded-xl bg-[#F7F9FC] px-3 py-2.5"
          >
            <div className="min-w-0 pr-3">
              <p className="text-[9px] text-[#8A949E]">当日全部游客预计消费</p>
              <p className="mt-0.5 text-[19px] font-bold leading-6 text-[#1677FF]">
                ¥{formatMoney(totalCost)}
              </p>
              <p className="mt-0.5 text-[9px] text-[#8A949E]">
                人均约 ¥{formatMoney(perPersonCost, 2)}
              </p>
            </div>
            <div className="flex flex-col justify-center border-l border-[#E5EAF0] pl-3">
              <p className="text-[9px] text-[#8A949E]">行程强度</p>
              <p className="mt-0.5 text-[12px] font-semibold text-[#20242A]">
                {intensityLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
