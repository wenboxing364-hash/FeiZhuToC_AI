import { ChevronRight } from 'lucide-react'
import type { TripUpdateChatItem } from '../../types/trip'
import { AssistantAvatar } from '../AssistantAvatar'

interface TripUpdateCardProps {
  update: TripUpdateChatItem
  onViewDay: (day: number) => void
}
export function TripUpdateCard({ update, onViewDay }: TripUpdateCardProps) {
  return (
    <div id={update.id} className="trip-card-enter flex items-start gap-2.5">
      <AssistantAvatar />
      <article
        data-card-type="trip-update"
        className="min-w-0 flex-1 rounded-2xl border border-[#BFE8DA] bg-white p-4 shadow-[0_5px_16px_rgba(31,41,55,0.05)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#20242A]">{update.title}</h3>
          <span className="flex items-center gap-1 text-[10px] font-medium text-[#37B27C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#37B27C]" />
            已调整
          </span>
        </div>

        <div className="mt-3 rounded-xl bg-[#F7F9FC] px-3 py-2.5">
          {update.before && (
            <p className="text-[11px] leading-5 text-[#98A2AE] line-through">{update.before}</p>
          )}
          <p className="text-[11px] font-semibold leading-5 text-[#243142]">{update.after}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[10px] leading-4 text-[#37B27C]">{update.impact}</p>
          {update.targetDay && (
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[#1677FF] transition hover:opacity-75 active:scale-95"
              onClick={() => onViewDay(update.targetDay!)}
            >
              查看 Day {update.targetDay}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
