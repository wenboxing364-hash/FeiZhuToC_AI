import { findChangshaAttraction } from '../../data/travel/attractions'
import type { TimelineItem } from '../../types/trip'
import { AttractionThumbnail } from './AttractionThumbnail'

interface TimelineProps {
  items: TimelineItem[]
}
export function Timeline({ items }: TimelineProps) {
  return (
    <ol className="px-4 pb-2 pt-1" aria-label="当天时间安排">
      {items.map((item, index) => {
        const attraction = item.attractionId
          ? findChangshaAttraction(item.attractionId)
          : undefined
        const isAttraction = item.activityType === 'attraction' || Boolean(item.attractionId)
        const showThumbnail = isAttraction && Boolean(item.attractionId)

        return (
          <li
            key={item.id}
            data-activity-type={item.activityType ?? 'attraction'}
            data-period={item.period}
            data-area={item.area}
            className="relative flex min-h-[64px] gap-3 pb-3 last:min-h-0 last:pb-1"
          >
            {index < items.length - 1 && (
              <span className="absolute left-[3px] top-[14px] h-[calc(100%-5px)] w-px bg-[#DDE9FF]" />
            )}
            <span className="relative mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full border-2 border-[#1677FF] bg-white shadow-[0_0_0_3px_#EEF5FF]" />
            <time className="w-[36px] shrink-0 pt-0.5 text-[10px] font-semibold text-[#1677FF]">
              {item.time}
            </time>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-[12px] font-semibold leading-5 text-[#20242A]">
                  {item.place}
                </h4>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-[1.5] text-[#8A949E]">
                  {item.description}
                </p>
                {item.cost !== undefined && (
                  <p className="mt-1 text-[9px] font-medium leading-4 text-[#B76B00]">
                    {item.cost === 0 ? '门票免费' : `成人参考门票 ¥${item.cost}`}
                    <span className="ml-1 font-normal text-[#A0A7B0]">
                      · {item.priceType === 'estimated' ? '预计价格' : 'Mock 参考价格'}
                    </span>
                  </p>
                )}
              </div>
              {showThumbnail && (
                <AttractionThumbnail
                  src={attraction?.images?.cover}
                  alt={attraction?.name ?? item.place}
                />
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
