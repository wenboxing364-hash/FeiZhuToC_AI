import { calculateTicketCost } from '../../domain/travelerTickets'
import type { Attraction, AttractionTicketCost } from '../../types/pricing'
import type { TravelerRequirement } from '../../types/trip'

export function calculateAttractionTicketCost(
  attraction: Attraction,
  travelers: TravelerRequirement,
): AttractionTicketCost {
  return {
    attraction,
    calculation: calculateTicketCost(attraction.price.amount, travelers),
  }
}

export function calculateAttractionsTicketCost(
  attractions: Attraction[],
  travelers: TravelerRequirement,
): { items: AttractionTicketCost[]; total: number } {
  const items = attractions.map((attraction) =>
    calculateAttractionTicketCost(attraction, travelers),
  )
  return {
    items,
    total: Math.round(items.reduce((sum, item) => sum + item.calculation.total, 0) * 100) / 100,
  }
}
