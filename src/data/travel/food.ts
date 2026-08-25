import type { FoodPrice } from '../../types/pricing'

export const foodPrices: FoodPrice[] = [
  {
    id: 'meal-breakfast',
    name: '早餐',
    mealType: 'breakfast',
    pricePerPerson: { amount: 15, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
  {
    id: 'meal-lunch',
    name: '午餐',
    mealType: 'lunch',
    pricePerPerson: { amount: 50, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
  {
    id: 'meal-dinner',
    name: '晚餐',
    mealType: 'dinner',
    pricePerPerson: { amount: 80, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
  {
    id: 'meal-snack',
    name: '长沙小吃体验',
    mealType: 'snack',
    pricePerPerson: { amount: 40, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
]
