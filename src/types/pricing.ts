import type { TicketCalculation, TravelerRequirement } from './trip'

export type PriceType = 'mock' | 'estimated' | 'realtime'
export type BudgetLevel = 'free' | 'low' | 'medium' | 'high'
export type HotelLevel = 'budget' | 'comfort' | 'premium'

export interface PriceInfo {
  amount: number
  currency: 'CNY'
  type: PriceType
  source?: string
  updatedAt?: string
}

export type AttractionCategory =
  | 'landmark'
  | 'history'
  | 'museum'
  | 'nature'
  | 'shopping'
  | 'food_street'
  | 'art'
  | 'theme_park'
  | 'family'
  | 'ancient_town'

export interface AttractionImages {
  cover?: string
  gallery?: string[]
}

export interface Attraction {
  id: string
  name: string
  city: string
  category: AttractionCategory
  price: PriceInfo
  budgetLevel: BudgetLevel
  recommendedDuration?: number
  bookingRequired?: boolean
  description?: string
  latitude?: number
  longitude?: number
  coordinateSystem?: 'GCJ02' | 'WGS84' | 'BD09'
  images?: AttractionImages
}

export interface Hotel {
  id: string
  name: string
  city: string
  level: HotelLevel
  nightlyPrice: PriceInfo
  maxGuestsPerRoom: number
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface FoodPrice {
  id: string
  name: string
  mealType: MealType
  pricePerPerson: PriceInfo
}

export type LocalTransportMode = 'bus' | 'metro' | 'taxi_short' | 'taxi_medium'

export interface LocalTransportPrice {
  id: string
  name: string
  mode: LocalTransportMode
  chargingUnit: 'per_person_ride' | 'per_vehicle_ride'
  price: PriceInfo
  vehicleCapacity?: number
}

export type IntercityTransportMode = 'high_speed_rail' | 'flight'

export interface IntercityTransportPrice {
  id: string
  departureCity: string
  arrivalCity: string
  mode: IntercityTransportMode
  pricePerPersonOneWay: PriceInfo
}

export interface AttractionTicketCost {
  attraction: Attraction
  calculation: TicketCalculation
}

export interface HotelCost {
  hotel: Hotel
  travelerCount: number
  rooms: number
  nights: number
  total: number
}

export interface FoodCost {
  travelerCount: number
  days: number
  breakdown: Record<MealType, number>
  total: number
}

export interface LocalTransportUsage {
  option: LocalTransportPrice
  rides: number
  vehicles?: number
}

export interface LocalTransportCost {
  items: Array<{ usage: LocalTransportUsage; subtotal: number }>
  total: number
}

export interface IntercityTransportCost {
  option?: IntercityTransportPrice
  travelerCount: number
  directions: 0 | 1 | 2
  total: number
}

export interface BudgetSummary {
  intercityTransport: number
  hotel: number
  attractions: number
  food: number
  localTransport: number
  total: number
  perPerson: number
  userBudget?: number
  budgetDifference?: number
  isOverBudget?: boolean
  suggestions: string[]
  priceTypes: PriceType[]
  assumptions: {
    attractionNames: string[]
    hotelLabel: string
    intercityLabel: string
    foodLabel: string
    localTransportLabel: string
  }
}

export interface DemoBudgetEstimateInput {
  travelers: TravelerRequirement
  durationDays: number
  departureCity?: string
  destination: string
  hotelLevel: HotelLevel
  userBudget?: {
    amount: number
    type: 'total' | 'per-person'
  }
  preferences?: string[]
  attractionIds?: string[]
}
