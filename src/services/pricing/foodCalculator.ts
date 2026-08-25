import { foodPrices } from '../../data/travel/food'
import type { FoodCost, MealType } from '../../types/pricing'

interface FoodPlan {
  breakfastsPerDay?: number
  lunchesPerDay?: number
  dinnersPerDay?: number
  snackSessions?: number
}

export function calculateFoodCost(
  travelerCount: number,
  days: number,
  plan: FoodPlan = {},
): FoodCost {
  if (!Number.isInteger(travelerCount) || travelerCount < 1) {
    throw new RangeError('游客人数必须是大于 0 的整数')
  }
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError('旅行天数必须是大于 0 的整数')
  }

  const sessions: Record<MealType, number> = {
    breakfast: (plan.breakfastsPerDay ?? 1) * days,
    lunch: (plan.lunchesPerDay ?? 1) * days,
    dinner: (plan.dinnersPerDay ?? 1) * days,
    snack: plan.snackSessions ?? 0,
  }
  const breakdown = Object.fromEntries(
    foodPrices.map((item) => [
      item.mealType,
      item.pricePerPerson.amount * travelerCount * sessions[item.mealType],
    ]),
  ) as Record<MealType, number>

  return {
    travelerCount,
    days,
    breakdown,
    total: Object.values(breakdown).reduce((sum, subtotal) => sum + subtotal, 0),
  }
}
