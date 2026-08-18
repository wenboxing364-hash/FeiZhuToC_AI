import type { TimelineItem } from '../../types/trip'

interface TimelineProps {
  items: TimelineItem[]
}
export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="px-4 pb-2 pt-1" aria-label="当天时间安排">
      {items.map((item, index) => (
        <li key={item.id} className="relative flex min-h-[64px] gap-3 pb-3 last:min-h-0 last:pb-1">
          {index < items.length - 1 && (
            <span className="absolute left-[3px] top-[14px] h-[calc(100%-5px)] w-px bg-[#DDE9FF]" />
          )}
          <span className="relative mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full border-2 border-[#1677FF] bg-white shadow-[0_0_0_3px_#EEF5FF]" />
          <time className="w-[36px] shrink-0 pt-0.5 text-[10px] font-semibold text-[#1677FF]">
            {item.time}
          </time>
          <div className="min-w-0 flex-1">
            <h4 className="text-[12px] font-semibold leading-5 text-[#20242A]">{item.place}</h4>
            <p className="mt-0.5 text-[10px] leading-[1.5] text-[#8A949E]">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
