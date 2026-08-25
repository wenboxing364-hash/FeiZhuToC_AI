import { useEffect, useRef, useState } from 'react'
import { TripPlannerPage } from './pages/TripPlannerPage'
import { TripRoutePage } from './pages/TripRoutePage'
import type { TripPlan } from './types/trip'

function App() {
  const initialRoutePage = window.location.pathname.endsWith('/trip-route')
  const [routePageOpen, setRoutePageOpen] = useState(initialRoutePage)
  const [routePlan, setRoutePlan] = useState<TripPlan>()
  const plannerPathRef = useRef(initialRoutePage ? '/' : window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setRoutePageOpen(window.location.pathname.endsWith('/trip-route'))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const openRoutePage = (plan: TripPlan) => {
    setRoutePlan(plan)
    if (!window.location.pathname.endsWith('/trip-route')) {
      window.history.pushState({ tripRoute: true }, '', '/trip-route')
    }
    setRoutePageOpen(true)
  }

  const closeRoutePage = () => {
    if (window.history.state?.tripRoute) {
      window.history.back()
      return
    }
    window.history.replaceState({}, '', plannerPathRef.current)
    setRoutePageOpen(false)
  }

  return (
    <>
      <TripPlannerPage onViewRoute={openRoutePage} hidden={routePageOpen} />
      {routePageOpen && <TripRoutePage tripPlan={routePlan} onBack={closeRoutePage} />}
    </>
  )
}

export default App
