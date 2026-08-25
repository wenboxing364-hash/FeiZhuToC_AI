import type { RefObject } from 'react'
import { preferenceOptions, welcomeSuggestions } from '../data/mockTrip'
import type { BudgetSummary } from '../types/pricing'
import type { ChatItem, TripPlan } from '../types/trip'
import { AssistantMessage, LoadingMessage, UserMessage } from './chat/MessageBubbles'
import { PreferenceChips, SuggestionChips } from './chat/SuggestionChips'
import { ItineraryCard } from './itinerary/ItineraryCard'
import { TripUpdateCard } from './itinerary/TripUpdateCard'

interface ChatMessageListProps {
  items: ChatItem[]
  tripPlan?: TripPlan
  budgetSummary?: BudgetSummary
  isProcessing: boolean
  selectedPreferences: string[]
  expandedDay: number | null
  endRef: RefObject<HTMLDivElement | null>
  onSuggestion: (value: string) => void
  onPreferenceToggle: (value: string) => void
  onPreferenceConfirm: () => void
  onExpandedDayChange: (day: number | null) => void
  onViewDay: (day: number) => void
  onViewRoute: () => void
  onAction: (message: string) => void
}
export function ChatMessageList({
  items,
  tripPlan,
  budgetSummary,
  isProcessing,
  selectedPreferences,
  expandedDay,
  endRef,
  onSuggestion,
  onPreferenceToggle,
  onPreferenceConfirm,
  onExpandedDayChange,
  onViewDay,
  onViewRoute,
  onAction,
}: ChatMessageListProps) {
  return (
    <main className="chat-scroll flex-1 overflow-y-auto bg-[#F5F7FA] px-3 pb-6 pt-4">
      <div className="space-y-3">
        {items.map((item) => {
          switch (item.kind) {
            case 'message':
              return item.role === 'assistant' ? (
                <AssistantMessage key={item.id} content={item.content} />
              ) : (
                <UserMessage key={item.id} content={item.content} />
              )
            case 'suggestions':
              return (
                <SuggestionChips
                  key={item.id}
                  options={welcomeSuggestions}
                  disabled={isProcessing}
                  onSelect={onSuggestion}
                />
              )
            case 'preferences':
              return (
                <PreferenceChips
                  key={item.id}
                  options={preferenceOptions}
                  selected={selectedPreferences}
                  disabled={isProcessing}
                  onToggle={onPreferenceToggle}
                  onConfirm={onPreferenceConfirm}
                />
              )
            case 'loading':
              return <LoadingMessage key={item.id} content={item.content} />
            case 'itinerary':
              return tripPlan ? (
                <ItineraryCard
                  key={item.id}
                  chatItemId={item.id}
                  tripPlan={tripPlan}
                  budgetSummary={budgetSummary}
                  expandedDay={expandedDay}
                  onExpandedDayChange={onExpandedDayChange}
                  onViewRoute={onViewRoute}
                  onAction={onAction}
                />
              ) : null
            case 'trip-update':
              return <TripUpdateCard key={item.id} update={item} onViewDay={onViewDay} />
          }
        })}
        <div ref={endRef} className="h-px" aria-hidden="true" />
      </div>
    </main>
  )
}
