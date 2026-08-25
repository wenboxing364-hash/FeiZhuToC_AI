import type { LocalTransportPrice } from '../../types/pricing'

export const localTransportPrices: LocalTransportPrice[] = [
  {
    id: 'local-bus',
    name: '公交',
    mode: 'bus',
    chargingUnit: 'per_person_ride',
    price: { amount: 2, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
  {
    id: 'local-metro',
    name: '地铁',
    mode: 'metro',
    chargingUnit: 'per_person_ride',
    price: { amount: 5, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
  },
  {
    id: 'local-taxi-short',
    name: '短途出租车',
    mode: 'taxi_short',
    chargingUnit: 'per_vehicle_ride',
    price: { amount: 20, currency: 'CNY', type: 'estimated', source: 'V0.2.4 Demo 估算' },
    vehicleCapacity: 4,
  },
  {
    id: 'local-taxi-medium',
    name: '中程出租车',
    mode: 'taxi_medium',
    chargingUnit: 'per_vehicle_ride',
    price: { amount: 40, currency: 'CNY', type: 'estimated', source: 'V0.2.4 Demo 估算' },
    vehicleCapacity: 4,
  },
]

export function findLocalTransport(id: string): LocalTransportPrice {
  const option = localTransportPrices.find((item) => item.id === id)
  if (!option) throw new Error(`未找到市内交通价格：${id}`)
  return option
}
