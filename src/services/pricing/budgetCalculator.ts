import type { BudgetSummary, PriceType } from '../../types/pricing'

interface BudgetCalculatorInput {
  intercityTransport: number
  hotel: number
  attractions: number
  food: number
  localTransport: number
  travelerCount: number
  userBudget?: number
  priceTypes: PriceType[]
  assumptions: BudgetSummary['assumptions']
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateBudgetSummary(input: BudgetCalculatorInput): BudgetSummary {
  if (!Number.isInteger(input.travelerCount) || input.travelerCount < 1) {
    throw new RangeError('游客人数必须是大于 0 的整数')
  }
  const total = roundMoney(
    input.intercityTransport +
      input.hotel +
      input.attractions +
      input.food +
      input.localTransport,
  )
  const budgetDifference =
    input.userBudget !== undefined ? roundMoney(total - input.userBudget) : undefined
  const isOverBudget = budgetDifference !== undefined ? budgetDifference > 0 : undefined
  const suggestions = isOverBudget
    ? [
        '优先用免费或低价景点替换高价景点',
        '将舒适型酒店调整为经济型酒店',
        '比较高铁与飞机的预计价格',
        '减少小吃加餐和出租车使用',
      ]
    : []

  return {
    intercityTransport: roundMoney(input.intercityTransport),
    hotel: roundMoney(input.hotel),
    attractions: roundMoney(input.attractions),
    food: roundMoney(input.food),
    localTransport: roundMoney(input.localTransport),
    total,
    perPerson: roundMoney(total / input.travelerCount),
    ...(input.userBudget !== undefined ? { userBudget: roundMoney(input.userBudget) } : {}),
    ...(budgetDifference !== undefined ? { budgetDifference, isOverBudget } : {}),
    suggestions,
    priceTypes: [...new Set(input.priceTypes)],
    assumptions: input.assumptions,
  }
}
