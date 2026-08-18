import { ChevronDown } from 'lucide-react'
import type { TripDay } from '../../types/trip'
import { Timeline } from './Timeline'

interface DayAccordionProps {
  day: TripDay
  expanded: boolean
  onToggle: () => void
}

export function DayAccordion({ day, expanded, onToggle }: DayAccordionProps) {
  return (
    <section id={`trip-day-${day.day}`} className="scroll-mt-3 border-t border-[#EEF0F3] first:border-t-0">
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
        {day.day === 1 && !expanded ? (
          <span className="rounded-full bg-[#EAF8F2] px-2 py-1 text-[9px] font-medium text-[#37B27C]">
            轻松
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
          <div className="mx-4 mb-3 grid grid-cols-2 rounded-xl bg-[#F7F9FC] px-3 py-2.5">
            <div>
              <p className="text-[9px] text-[#8A949E]">预计花费</p>
              <p className="mt-0.5 text-[12px] font-bold text-[#1677FF]">¥{day.estimatedCost ?? 0} / 人</p>
            </div>
            <div className="border-l border-[#E5EAF0] pl-3">
              <p className="text-[9px] text-[#8A949E]">行程强度</p>
              <p className="mt-0.5 text-[12px] font-semibold text-[#20242A]">
                {day.intensity === 'relaxed' ? '轻松' : day.intensity === 'normal' ? '适中' : '紧凑'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
