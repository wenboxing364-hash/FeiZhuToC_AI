import { MapPin, Minus, Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { Travelers, TripPlan } from '../../types/trip'

export interface TripInfoSettingsValue {
  destinations: string[]
  travelers: Travelers
  budgetTotal: number
}

interface TripInfoSettingsProps {
  tripPlan: TripPlan
  onSave: (value: TripInfoSettingsValue) => void
}

type TravelerKey = keyof Travelers

const travelerRows: Array<{ key: TravelerKey; label: string; hint?: string }> = [
  { key: 'adults', label: '成人' },
  { key: 'children', label: '儿童', hint: '≤ 12岁' },
  { key: 'seniors', label: '老人', hint: '≥ 65岁' },
]

export function TripInfoSettings({ tripPlan, onSave }: TripInfoSettingsProps) {
  const [destinations, setDestinations] = useState(tripPlan.destinations)
  const [travelers, setTravelers] = useState(tripPlan.travelers)
  const [budgetInput, setBudgetInput] = useState(String(tripPlan.budget.total ?? 0))
  const [isAddingDestination, setIsAddingDestination] = useState(false)
  const [destinationInput, setDestinationInput] = useState('')

  const changeTraveler = (key: TravelerKey, amount: number) => {
    setTravelers((current) => ({
      ...current,
      [key]: Math.max(key === 'adults' ? 1 : 0, current[key] + amount),
    }))
  }

  const addDestination = () => {
    const value = destinationInput.trim()
    if (!value || destinations.includes(value)) return
    setDestinations((current) => [...current, value])
    setDestinationInput('')
    setIsAddingDestination(false)
  }

  const budgetTotal = Number(budgetInput)
  const canSave = destinations.length > 0 && Number.isFinite(budgetTotal) && budgetTotal > 0

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSave) onSave({ destinations, travelers, budgetTotal })
      }}
    >
      <div className="settings-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#F5F7FA] px-3 py-3">
        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
          <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-[#20242A]">
            <MapPin size={17} className="text-[#1677FF]" />
            目的地
          </div>
          <div className="flex flex-wrap gap-2">
            {destinations.map((destination) => (
              <span
                key={destination}
                className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#EEF5FF] px-3 text-[13px] font-medium text-[#1677FF]"
              >
                {destination}
                <button
                  type="button"
                  aria-label={`移除目的地${destination}`}
                  className="rounded-full p-0.5 transition active:scale-90 disabled:opacity-30"
                  disabled={destinations.length === 1 || destination === '长沙'}
                  onClick={() =>
                    setDestinations((current) => current.filter((value) => value !== destination))
                  }
                >
                  <X size={13} />
                </button>
              </span>
            ))}
            {isAddingDestination ? (
              <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5">
                <input
                  autoFocus
                  value={destinationInput}
                  aria-label="新目的地"
                  placeholder="输入目的地"
                  className="h-full min-w-0 flex-1 rounded-xl border border-[#BDD7FF] bg-white px-3 text-[13px] outline-none focus:border-[#1677FF]"
                  onChange={(event) => setDestinationInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addDestination()
                    }
                  }}
                />
                <button
                  type="button"
                  className="h-full rounded-xl bg-[#1677FF] px-3 text-xs font-semibold text-white active:scale-95"
                  onClick={addDestination}
                >
                  添加
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#F5F8FF] px-3 text-[13px] font-medium text-[#1677FF] transition active:scale-95"
                onClick={() => setIsAddingDestination(true)}
              >
                <Plus size={15} />
                添加目的地
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
          <div className="flex items-center justify-between border-b border-[#EEF0F3] px-4 py-4">
            <span className="text-[14px] font-semibold text-[#20242A]">旅行时间</span>
            <span className="text-[13px] text-[#66717D]">
              {tripPlan.days}天{tripPlan.nights}晚
            </span>
          </div>
          <div className="px-4">
            <h3 className="pb-1 pt-4 text-[14px] font-semibold text-[#20242A]">出行人数</h3>
            {travelerRows.map((row) => (
              <div
                key={row.key}
                className="flex min-h-14 items-center justify-between border-b border-[#F0F2F5] last:border-none"
              >
                <div className="text-[13px] text-[#20242A]">
                  {row.label}
                  {row.hint && <span className="ml-1.5 text-[11px] text-[#9AA3AD]">{row.hint}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`减少${row.label}人数`}
                    className="stepper-button"
                    disabled={travelers[row.key] <= (row.key === 'adults' ? 1 : 0)}
                    onClick={() => changeTraveler(row.key, -1)}
                  >
                    <Minus size={15} />
                  </button>
                  <output className="w-5 text-center text-[14px] font-medium text-[#20242A]">
                    {travelers[row.key]}
                  </output>
                  <button
                    type="button"
                    aria-label={`增加${row.label}人数`}
                    className="stepper-button"
                    onClick={() => changeTraveler(row.key, 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
          <h3 className="text-[14px] font-semibold text-[#20242A]">预算</h3>
          <label className="mt-3 flex items-center justify-between gap-4 text-[13px] text-[#39424C]">
            总预算（CNY）
            <span className="flex h-10 w-32 items-center rounded-xl border border-[#DDE3EA] px-3 focus-within:border-[#1677FF]">
              <span className="mr-1 text-[#20242A]">¥</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-right text-[15px] font-medium text-[#20242A] outline-none"
                inputMode="numeric"
                aria-label="总预算"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value.replace(/\D/g, ''))}
              />
            </span>
          </label>
          <p className="mt-2 text-[10px] leading-4 text-[#9AA3AD]">
            系统将根据人数和行程自动重新计算费用明细
          </p>
        </section>
      </div>

      <div className="shrink-0 border-t border-[#EEF0F3] bg-white px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
        <button type="submit" className="settings-primary-button" disabled={!canSave}>
          保存并更新行程
        </button>
      </div>
    </form>
  )
}
