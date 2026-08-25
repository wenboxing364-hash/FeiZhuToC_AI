import type {
  TicketCalculation,
  Traveler,
  TravelerCategory,
  TravelerRequirement,
} from '../types/trip'

export const CHILD_MAX_AGE = 12
export const SENIOR_MIN_AGE = 65
export const CHILD_TICKET_RATE = 0.5

export function classifyTravelerAge(age: number): TravelerCategory {
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    throw new RangeError('游客年龄必须是 0 至 120 之间的整数')
  }
  if (age <= CHILD_MAX_AGE) return 'child'
  if (age >= SENIOR_MIN_AGE) return 'senior'
  return 'adult'
}

export function createTravelersFromAges(ages: number[]): Traveler[] {
  return ages.map((age, index) => ({
    id: `traveler-${index + 1}`,
    age,
    category: classifyTravelerAge(age),
  }))
}

export function createTravelersByCategory(
  adults: number,
  children: number,
  seniors: number,
  childAges: number[] = [],
  seniorAges: number[] = [],
  adultAges: number[] = [],
): Traveler[] {
  const travelers: Traveler[] = []
  const addTravelers = (count: number, category: TravelerCategory, ages: number[] = []) => {
    for (let index = 0; index < count; index += 1) {
      travelers.push({
        id: `traveler-${travelers.length + 1}`,
        ...(ages[index] !== undefined ? { age: ages[index] } : {}),
        category: ages[index] !== undefined ? classifyTravelerAge(ages[index]) : category,
      })
    }
  }

  addTravelers(adults, 'adult', adultAges)
  addTravelers(children, 'child', childAges)
  addTravelers(seniors, 'senior', seniorAges)
  return travelers
}

export function hasKnownTravelerStructure(travelers: TravelerRequirement): boolean {
  return Boolean(travelers.total && travelers.people.length === travelers.total)
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateTicketCost(
  adultPrice: number,
  travelers: Traveler[] | TravelerRequirement,
): TicketCalculation {
  if (!Number.isFinite(adultPrice) || adultPrice < 0) {
    throw new RangeError('成人门票价格必须是大于等于 0 的有效数字')
  }

  const people = Array.isArray(travelers) ? travelers : travelers.people
  const counts: Record<TravelerCategory, number> = {
    child: 0,
    adult: 0,
    senior: 0,
  }
  people.forEach((traveler) => {
    counts[traveler.category] += 1
  })

  const childPrice = roundMoney(adultPrice * CHILD_TICKET_RATE)
  const prices: Record<TravelerCategory, number> = {
    child: childPrice,
    adult: roundMoney(adultPrice),
    senior: 0,
  }
  const breakdown = Object.fromEntries(
    (Object.keys(counts) as TravelerCategory[]).map((category) => [
      category,
      {
        category,
        count: counts[category],
        pricePerTraveler: prices[category],
        subtotal: roundMoney(counts[category] * prices[category]),
      },
    ]),
  ) as TicketCalculation['breakdown']

  return {
    adultPrice: roundMoney(adultPrice),
    isFreeAttraction: adultPrice === 0,
    travelerCount: people.length,
    breakdown,
    total: roundMoney(
      breakdown.child.subtotal + breakdown.adult.subtotal + breakdown.senior.subtotal,
    ),
  }
}

export function buildTravelerSummary(travelers: TravelerRequirement): string {
  const counts = { child: 0, adult: 0, senior: 0 }
  travelers.people.forEach((traveler) => {
    counts[traveler.category] += 1
  })
  return `游客结构：成人 ${counts.adult} 人、儿童 ${counts.child} 人、老人 ${counts.senior} 人`
}

export function buildTicketCalculationSummary(
  travelers: TravelerRequirement,
  adultPrice = 40,
): string {
  const calculation = calculateTicketCost(adultPrice, travelers)
  const { adult, child, senior } = calculation.breakdown
  return [
    `门票试算（成人票 ¥${calculation.adultPrice}）：`,
    `成人：¥${adult.pricePerTraveler} × ${adult.count} = ¥${adult.subtotal}`,
    `儿童：¥${child.pricePerTraveler} × ${child.count} = ¥${child.subtotal}`,
    `老人：¥${senior.pricePerTraveler} × ${senior.count} = ¥${senior.subtotal}`,
    `总门票：¥${calculation.total}`,
    '以上为 Demo 默认规则，真实优惠政策以景区票务信息为准。',
  ].join('\n')
}
