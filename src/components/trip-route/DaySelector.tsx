import { useEffect, useRef } from 'react'
import type { DayRoute } from '../../types/tripRoute'

interface DaySelectorProps {
  routes: DayRoute[]
  activeDay: number
  onDayChange: (day: number) => void
}

export function DaySelector({ routes, activeDay, onDayChange }: DaySelectorProps) {
  const buttonRefs = useRef(new Map<number, HTMLButtonElement>())

  useEffect(() => {
    buttonRefs.current.get(activeDay)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeDay])

  return (
    <nav className="route-day-selector" aria-label="选择行程日期">
      {routes.map((route) => (
        <button
          key={route.day}
          ref={(element) => {
            if (element) buttonRefs.current.set(route.day, element)
            else buttonRefs.current.delete(route.day)
          }}
          type="button"
          className={route.day === activeDay ? 'route-day-active' : ''}
          aria-pressed={route.day === activeDay}
          onClick={() => onDayChange(route.day)}
        >
          Day {route.day}
        </button>
      ))}
    </nav>
  )
}
