export type TravelPace = 'relaxed' | 'normal' | 'intensive'

export interface TimelineItem {
  id: string
  time: string
  place: string
  description: string
  duration?: string
  transport?: string
  cost?: number
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
}

export interface TripPlan {
  id: string
  title: string
  destinations: string[]
  startDate?: string
  endDate?: string
  days: number
  nights: number
  travelers: number
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
}

export type ChatItem =
  | TextChatItem
  | SuggestionsChatItem
  | PreferencesChatItem
  | LoadingChatItem
  | ItineraryChatItem
  | TripUpdateChatItem
