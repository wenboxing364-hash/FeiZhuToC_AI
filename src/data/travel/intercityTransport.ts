import type { IntercityTransportPrice } from '../../types/pricing'

export const intercityTransportPrices: IntercityTransportPrice[] = [
  {
    id: 'shanghai-changsha-high-speed-rail',
    departureCity: '上海',
    arrivalCity: '长沙',
    mode: 'high_speed_rail',
    pricePerPersonOneWay: {
      amount: 480,
      currency: 'CNY',
      type: 'estimated',
      source: 'V0.2.4 Demo 估算',
    },
  },
  {
    id: 'shanghai-changsha-flight',
    departureCity: '上海',
    arrivalCity: '长沙',
    mode: 'flight',
    pricePerPersonOneWay: {
      amount: 650,
      currency: 'CNY',
      type: 'estimated',
      source: 'V0.2.4 Demo 估算',
    },
  },
]

export function findIntercityTransport(
  departureCity: string | undefined,
  arrivalCity: string,
  mode: IntercityTransportPrice['mode'] = 'high_speed_rail',
): IntercityTransportPrice | undefined {
  if (!departureCity) return undefined
  return intercityTransportPrices.find(
    (item) =>
      item.departureCity === departureCity &&
      item.arrivalCity === arrivalCity &&
      item.mode === mode,
  )
}
