import { findChangshaAttraction } from '../../data/travel/attractions'
import { findChangshaHotel } from '../../data/travel/hotels'
import { findIntercityTransport } from '../../data/travel/intercityTransport'
import { findLocalTransport } from '../../data/travel/localTransport'
import type { BudgetSummary, DemoBudgetEstimateInput, PriceType } from '../../types/pricing'
import { calculateBudgetSummary } from './budgetCalculator'
import { calculateFoodCost } from './foodCalculator'
import { calculateHotelCost } from './hotelCalculator'
import { calculateAttractionsTicketCost } from './ticketCalculator'
import {
  calculateIntercityTransportCost,
  calculateLocalTransportCost,
} from './transportCalculator'

const REFERENCE_ATTRACTION_IDS = [
  'changsha-yuelu-mountain',
  'changsha-yuelu-academy',
  'changsha-orange-isle',
  'changsha-dufu-pavilion',
  'changsha-window-of-the-world',
]

export function createDemoBudgetEstimate(
  input: DemoBudgetEstimateInput,
): BudgetSummary | undefined {
  const travelerCount = input.travelers.total
  if (input.destination !== '长沙' || !travelerCount || input.travelers.people.length !== travelerCount) {
    return undefined
  }

  const attractionIds = input.attractionIds ?? REFERENCE_ATTRACTION_IDS
  const attractions = attractionIds.map(findChangshaAttraction).filter(
    (item) => item !== undefined,
  )
  const attractionCost = calculateAttractionsTicketCost(attractions, input.travelers)
  const nights = Math.max(input.durationDays - 1, 0)
  const selectedHotel = findChangshaHotel(input.hotelLevel)
  const hotelCost = calculateHotelCost(selectedHotel, travelerCount, nights)
  const foodCost = calculateFoodCost(travelerCount, input.durationDays, {
    snackSessions: input.preferences?.includes('美食') ? 1 : 0,
  })
  const localCost = calculateLocalTransportCost(
    [
      { option: findLocalTransport('local-metro'), rides: input.durationDays * 4 },
      { option: findLocalTransport('local-taxi-medium'), rides: input.durationDays },
    ],
    travelerCount,
  )
  const intercityOption = findIntercityTransport(
    input.departureCity,
    input.destination,
    'high_speed_rail',
  )
  const intercityCost = calculateIntercityTransportCost(intercityOption, travelerCount, true)
  const userBudget = input.userBudget
    ? input.userBudget.type === 'per-person'
      ? input.userBudget.amount * travelerCount
      : input.userBudget.amount
    : undefined
  const priceTypes: PriceType[] = [
    ...attractions.map((item) => item.price.type),
    selectedHotel.nightlyPrice.type,
    ...localCost.items.map((item) => item.usage.option.price.type),
    ...(intercityOption ? [intercityOption.pricePerPersonOneWay.type] : []),
    'mock',
  ]

  return calculateBudgetSummary({
    intercityTransport: intercityCost.total,
    hotel: hotelCost.total,
    attractions: attractionCost.total,
    food: foodCost.total,
    localTransport: localCost.total,
    travelerCount,
    userBudget,
    priceTypes,
    assumptions: {
      attractionNames: attractions.map((item) => item.name),
      hotelLabel: `${selectedHotel.name} ¥${selectedHotel.nightlyPrice.amount}/间/晚，${hotelCost.rooms}间 × ${hotelCost.nights}晚`,
      intercityLabel: intercityOption
        ? `${input.departureCity}往返长沙高铁，¥${intercityOption.pricePerPersonOneWay.amount}/人/单程`
        : '未识别到固定城际线路，本次暂未计入城际交通',
      foodLabel: `每日早餐、午餐、晚餐${input.preferences?.includes('美食') ? '，另含 1 次小吃体验' : ''}`,
      localTransportLabel: `每日 4 次地铁 + 1 次中程出租车`,
    },
  })
}
