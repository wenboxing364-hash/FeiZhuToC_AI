import { ArrowDown, ChevronRight } from 'lucide-react'
import { AssistantAvatar } from '../AssistantAvatar'

interface TripUpdateCardProps {
  onViewDay: () => void
}
export function TripUpdateCard({ onViewDay }: TripUpdateCardProps) {
  const places = ['岳麓山', '湖南大学', '橘子洲周边']

  return (
    <div className="trip-card-enter flex items-start gap-2.5">
      <AssistantAvatar />
      <article className="min-w-0 flex-1 rounded-2xl border border-[#DDE8E4] bg-white p-4 shadow-[0_5px_16px_rgba(31,41,55,0.05)]">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-[#20242A]">Day 2 已更新</h3>
          <span className="flex items-center gap-1 text-[10px] font-medium text-[#37B27C]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#37B27C]" />
            已调整
          </span>
        </div>

        <div className="mt-3 rounded-xl bg-[#F7F9FC] px-3 py-2.5">
          {places.map((place, index) => (
            <div key={place}>
              <p className="text-[11px] font-medium text-[#39424C]">{place}</p>
              {index < places.length - 1 && <ArrowDown size={11} className="my-0.5 text-[#AAB3BC]" />}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[10px] text-[#37B27C]">行程强度减少约35%</p>
          <button
            type="button"
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#1677FF] transition hover:opacity-75 active:scale-95"
            onClick={onViewDay}
          >
            查看 Day 2
            <ChevronRight size={14} />
          </button>
        </div>
      </article>
    </div>
  )
}
