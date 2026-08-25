import type { Hotel, HotelCost } from '../../types/pricing'

export function calculateRequiredRooms(travelerCount: number, maxGuestsPerRoom = 2): number {
  if (!Number.isInteger(travelerCount) || travelerCount < 1) {
    throw new RangeError('游客人数必须是大于 0 的整数')
  }
  if (!Number.isInteger(maxGuestsPerRoom) || maxGuestsPerRoom < 1) {
    throw new RangeError('每间房入住人数必须是大于 0 的整数')
  }
  return Math.ceil(travelerCount / maxGuestsPerRoom)
}

export function calculateHotelCost(
  hotel: Hotel,
  travelerCount: number,
  nights: number,
): HotelCost {
  if (!Number.isInteger(nights) || nights < 0) {
    throw new RangeError('入住晚数必须是大于等于 0 的整数')
  }
  const rooms = calculateRequiredRooms(travelerCount, hotel.maxGuestsPerRoom)
  return {
    hotel,
    travelerCount,
    rooms,
    nights,
    total: hotel.nightlyPrice.amount * rooms * nights,
  }
}
