import type {
  IntercityTransportCost,
  IntercityTransportPrice,
  LocalTransportCost,
  LocalTransportUsage,
} from '../../types/pricing'

export function calculateLocalTransportCost(
  usages: LocalTransportUsage[],
  travelerCount: number,
): LocalTransportCost {
  if (!Number.isInteger(travelerCount) || travelerCount < 1) {
    throw new RangeError('游客人数必须是大于 0 的整数')
  }
  const items = usages.map((usage) => {
    const multiplier =
      usage.option.chargingUnit === 'per_person_ride'
        ? travelerCount
        : (usage.vehicles ??
          Math.ceil(travelerCount / (usage.option.vehicleCapacity ?? travelerCount)))
    return {
      usage,
      subtotal: usage.option.price.amount * usage.rides * multiplier,
    }
  })
  return { items, total: items.reduce((sum, item) => sum + item.subtotal, 0) }
}

export function calculateIntercityTransportCost(
  option: IntercityTransportPrice | undefined,
  travelerCount: number,
  roundTrip = true,
): IntercityTransportCost {
  if (!Number.isInteger(travelerCount) || travelerCount < 1) {
    throw new RangeError('游客人数必须是大于 0 的整数')
  }
  const directions: 0 | 1 | 2 = option ? (roundTrip ? 2 : 1) : 0
  return {
    option,
    travelerCount,
    directions,
    total: option ? option.pricePerPersonOneWay.amount * travelerCount * directions : 0,
  }
}
