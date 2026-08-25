import { Check, Gauge, Leaf, Rocket } from 'lucide-react'
import { useState } from 'react'
import type { TravelPace, TripPlan } from '../../types/trip'

export interface TripPreferenceSettingsValue {
  preferences: string[]
  pace: TravelPace
}

interface TripPreferenceSettingsProps {
  tripPlan: TripPlan
  onSave: (value: TripPreferenceSettingsValue) => void
}

const preferenceOptions = ['美食', '历史文化', '自然风景', '城市探索', '购物', '亲子']

const paceOptions: Array<{
  value: TravelPace
  label: string
  description: string
  icon: typeof Leaf
}> = [
  { value: 'relaxed', label: '轻松', description: '轻松悠闲', icon: Leaf },
  { value: 'normal', label: '适中', description: '平衡舒适', icon: Gauge },
  { value: 'intensive', label: '紧凑', description: '高效充实', icon: Rocket },
]

export function TripPreferenceSettings({ tripPlan, onSave }: TripPreferenceSettingsProps) {
  const [preferences, setPreferences] = useState(tripPlan.preferences)
  const [pace, setPace] = useState<TravelPace>(tripPlan.pace)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="settings-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#F5F7FA] px-3 py-3">
        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
          <h3 className="text-[14px] font-semibold text-[#20242A]">
            旅行偏好 <span className="ml-1 text-[11px] font-normal text-[#9AA3AD]">可多选</span>
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {preferenceOptions.map((preference) => {
              const selected = preferences.includes(preference)
              return (
                <button
                  key={preference}
                  type="button"
                  aria-pressed={selected}
                  className={`relative flex h-11 items-center justify-center rounded-xl border text-[12px] font-medium transition active:scale-95 ${
                    selected
                      ? 'border-[#8AB9FF] bg-[#EAF3FF] text-[#1677FF]'
                      : 'border-[#E1E7EE] bg-white text-[#39424C]'
                  }`}
                  onClick={() =>
                    setPreferences((current) =>
                      current.includes(preference)
                        ? current.filter((value) => value !== preference)
                        : [...current, preference],
                    )
                  }
                >
                  {preference}
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1677FF] text-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
          <h3 className="text-[14px] font-semibold text-[#20242A]">
            行程节奏 <span className="ml-1 text-[11px] font-normal text-[#9AA3AD]">单选</span>
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {paceOptions.map((option) => {
              const Icon = option.icon
              const selected = pace === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  className={`flex min-h-24 flex-col items-center justify-center rounded-xl border transition active:scale-95 ${
                    selected
                      ? 'border-[#77ADFF] bg-[#EEF5FF] text-[#1677FF] shadow-[0_0_0_1px_rgba(22,119,255,0.08)]'
                      : 'border-[#E4E9EF] bg-white text-[#20242A]'
                  }`}
                  onClick={() => setPace(option.value)}
                >
                  <Icon size={25} strokeWidth={1.8} />
                  <span className="mt-2 text-[13px] font-semibold">{option.label}</span>
                  <span className={`mt-0.5 text-[10px] ${selected ? 'text-[#66A0F5]' : 'text-[#9AA3AD]'}`}>
                    {option.description}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <div className="shrink-0 border-t border-[#EEF0F3] bg-white px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          className="settings-primary-button"
          onClick={() => onSave({ preferences, pace })}
        >
          保存并更新行程
        </button>
      </div>
    </div>
  )
}
