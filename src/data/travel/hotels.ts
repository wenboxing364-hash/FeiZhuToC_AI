import type { Hotel } from '../../types/pricing'

export const changshaHotels: Hotel[] = [
  {
    id: 'changsha-budget-hotel',
    name: '长沙经济型酒店',
    city: '长沙',
    level: 'budget',
    nightlyPrice: { amount: 250, currency: 'CNY', type: 'mock', source: 'V0.2.3 Demo 规则' },
    maxGuestsPerRoom: 2,
  },
  {
    id: 'changsha-comfort-hotel',
    name: '长沙舒适型酒店',
    city: '长沙',
    level: 'comfort',
    nightlyPrice: { amount: 400, currency: 'CNY', type: 'mock', source: 'V0.2.3 Demo 规则' },
    maxGuestsPerRoom: 2,
  },
  {
    id: 'changsha-premium-hotel',
    name: '长沙高品质酒店',
    city: '长沙',
    level: 'premium',
    nightlyPrice: { amount: 650, currency: 'CNY', type: 'mock', source: 'V0.2.3 Demo 规则' },
    maxGuestsPerRoom: 2,
  },
]

export const defaultChangshaHotel = changshaHotels[1]

export function findChangshaHotel(level: Hotel['level']): Hotel {
  const hotel = changshaHotels.find((item) => item.level === level)
  if (!hotel) throw new Error(`未找到长沙酒店档位：${level}`)
  return hotel
}
