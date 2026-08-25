import type { HotelLevel, PriceType } from './pricing'

export type TravelPace = 'relaxed' | 'normal' | 'intensive'

export type CompanionType =
  | 'solo'
  | 'couple'
  | 'friends'
  | 'family'
  | 'parent-child'
  | 'colleagues'

export type TravelerCategory = 'child' | 'adult' | 'senior'

export interface Traveler {
  id: string
  age?: number
  category: TravelerCategory
}

export interface TravelerRequirement {
  total?: number
  people: Traveler[]
}

export interface TicketCategoryCalculation {
  category: TravelerCategory
  count: number
  pricePerTraveler: number
  subtotal: number
}

export interface TicketCalculation {
  adultPrice: number
  isFreeAttraction: boolean
  travelerCount: number
  breakdown: Record<TravelerCategory, TicketCategoryCalculation>
  total: number
}

export interface TravelBudgetRequirement {
  amount: number
  type: 'total' | 'per-person'
  currency: 'CNY'
}

export interface TripRequirement {
  destinations: string[]
  departureCity?: string
  startDate?: string
  duration?: number
  travelers: TravelerRequirement
  budget?: TravelBudgetRequirement
  hotelLevel: HotelLevel
  preferences: string[]
  pace?: TravelPace
  companion?: CompanionType
  constraints: string[]
}

export type RequiredTripField =
  | 'destinations'
  | 'startDate'
  | 'duration'
  | 'travelers'
  | 'travelerAges'

export type ConversationState =
  | 'INITIAL'
  | 'COLLECTING_REQUIREMENTS'
  | 'ASKING'
  | 'READY_TO_GENERATE'
  | 'GENERATING'
  | 'PLAN_GENERATED'
  | 'MODIFYING'
  | 'ERROR'

export interface TimelineItem {
  id: string
  time: string
  place: string
  description: string
  duration?: string
  transport?: string
  cost?: number
  attractionId?: string
  priceType?: PriceType
  activityType?: 'attraction' | 'meal' | 'rest'
  period?: 'morning' | 'noon' | 'afternoon' | 'evening'
  area?: string
}

export interface TripDay {
  day: number
  date?: string
  city: string
  title: string
  theme?: string
  activities: TimelineItem[]
  estimatedCost?: number
  transport?: string
  intensity: TravelPace
  area?: string
  constraints?: string[]
}

export interface Travelers {
  adults: number
  children: number
  seniors: number
}

export interface TripPlan {
  id: string
  title: string
  destinations: string[]
  startDate?: string
  endDate?: string
  days: number
  nights: number
  travelers: Travelers
  budget: {
    total?: number
    perPerson?: number
  }
  preferences: string[]
  pace: TravelPace
  itinerary: TripDay[]
}

export type MessageRole = 'assistant' | 'user'

export interface TextChatItem {
  id: string
  kind: 'message'
  role: MessageRole
  content: string
}

export interface SuggestionsChatItem {
  id: string
  kind: 'suggestions'
}

export interface PreferencesChatItem {
  id: string
  kind: 'preferences'
}

export interface LoadingChatItem {
  id: string
  kind: 'loading'
  content: string
}

export interface ItineraryChatItem {
  id: string
  kind: 'itinerary'
}

export interface TripUpdateChatItem {
  id: string
  kind: 'trip-update'
  title: string
  before?: string
  after: string
  impact: string
  targetDay?: number
}

export type ChatItem =
  | TextChatItem
  | SuggestionsChatItem
  | PreferencesChatItem
  | LoadingChatItem
  | ItineraryChatItem
  | TripUpdateChatItem
