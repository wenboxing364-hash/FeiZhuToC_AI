import type {
  CompanionType,
  RequiredTripField,
  TravelBudgetRequirement,
  Traveler,
  TravelPace,
  TripRequirement,
} from '../types/trip'
import type { HotelLevel } from '../types/pricing'
import {
  buildTravelerSummary,
  classifyTravelerAge,
  createTravelersByCategory,
  createTravelersFromAges,
  hasKnownTravelerStructure,
} from './travelerTickets'

interface TravelerRequirementPatch {
  total?: number
  people?: Traveler[]
  allAdults?: boolean
}

interface TripRequirementPatch {
  destinations?: string[]
  replaceDestinations?: boolean
  departureCity?: string
  startDate?: string
  duration?: number
  travelers?: TravelerRequirementPatch
  budget?: TravelBudgetRequirement
  hotelLevel?: HotelLevel
  preferences?: string[]
  pace?: TravelPace
  companion?: CompanionType
  constraints?: string[]
}

const KNOWN_DESTINATIONS = [
  '呼伦贝尔',
  '西双版纳',
  '张家界',
  '香格里拉',
  '乌鲁木齐',
  '神农架',
  '长白山',
  '三亚',
  '长沙',
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '南京',
  '苏州',
  '成都',
  '重庆',
  '武汉',
  '西安',
  '厦门',
  '青岛',
  '大连',
  '天津',
  '昆明',
  '丽江',
  '大理',
  '桂林',
  '贵阳',
  '哈尔滨',
  '沈阳',
  '长春',
  '郑州',
  '洛阳',
  '开封',
  '济南',
  '福州',
  '泉州',
  '南昌',
  '合肥',
  '太原',
  '兰州',
  '西宁',
  '银川',
  '拉萨',
  '珠海',
  '佛山',
  '日本',
  '东京',
  '大阪',
  '京都',
  '韩国',
  '首尔',
  '泰国',
  '曼谷',
  '清迈',
  '普吉岛',
  '新加坡',
  '马来西亚',
  '越南',
  '冰岛',
  '法国',
  '巴黎',
  '意大利',
] as const

const REQUIRED_FIELD_ORDER: RequiredTripField[] = [
  'destinations',
  'duration',
  'startDate',
  'travelers',
  'travelerAges',
]

const PREFERENCE_KEYWORDS: Record<string, string[]> = {
  美食: ['美食', '吃吃喝喝', '小吃', '探店'],
  历史文化: ['历史', '文化', '博物馆', '古迹', '人文'],
  自然风景: ['自然', '风景', '山水', '户外', '徒步'],
  购物: ['购物', '逛街', '买买买'],
  摄影: ['摄影', '拍照', '出片', '打卡'],
  亲子: ['亲子', '带娃', '小朋友', '孩子'],
  夜生活: ['夜生活', '酒吧', '夜市'],
}

const chineseDigits: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
}

export function createEmptyTripRequirement(): TripRequirement {
  return {
    destinations: [],
    travelers: { people: [] },
    hotelLevel: 'comfort',
    preferences: [],
    constraints: [],
  }
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function parseChineseNumber(value: string): number | undefined {
  if (/^\d+$/.test(value)) return Number(value)
  if (value === '十') return 10
  if (value.includes('十')) {
    const [tens, units] = value.split('十')
    const tensValue = tens ? chineseDigits[tens] : 1
    const unitsValue = units ? chineseDigits[units] : 0
    if (tensValue === undefined || unitsValue === undefined) return undefined
    return tensValue * 10 + unitsValue
  }
  return chineseDigits[value]
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createLocalDate(year: number, month: number, day: number): Date | undefined {
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined
  }
  return date
}

function nextWeekday(now: Date, weekday: number, forceNextWeek = false): Date {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let daysToAdd = (weekday - date.getDay() + 7) % 7
  if (forceNextWeek) {
    const daysUntilNextMonday = ((8 - date.getDay()) % 7) || 7
    daysToAdd = daysUntilNextMonday + (weekday === 0 ? 6 : weekday - 1)
  }
  date.setDate(date.getDate() + daysToAdd)
  return date
}

function extractDate(input: string, now: Date): string | undefined {
  const explicitDate = input.match(/(?:(\d{4})[年/.-])?(\d{1,2})[月/.-](\d{1,2})[日号]?/)
  if (explicitDate) {
    let year = explicitDate[1] ? Number(explicitDate[1]) : now.getFullYear()
    const month = Number(explicitDate[2])
    const day = Number(explicitDate[3])
    let date = createLocalDate(year, month, day)
    if (!explicitDate[1] && date) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (date < today) {
        year += 1
        date = createLocalDate(year, month, day)
      }
    }
    return date ? toIsoDate(date) : undefined
  }

  const relativeDays: Array<[RegExp, number]> = [
    [/大后天/, 3],
    [/后天/, 2],
    [/明天/, 1],
    [/今天|今日/, 0],
  ]
  for (const [pattern, offset] of relativeDays) {
    if (pattern.test(input)) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
      return toIsoDate(date)
    }
  }

  if (/国庆/.test(input)) {
    const year = now.getFullYear()
    let date = createLocalDate(year, 10, 1)!
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      date = createLocalDate(year + 1, 10, 1)!
    }
    return toIsoDate(date)
  }

  if (/下周末/.test(input)) return toIsoDate(nextWeekday(now, 6, true))
  if (/(?:这|本)?周末/.test(input)) return toIsoDate(nextWeekday(now, 6))

  const weekdayMatch = input.match(/(下周|这周|本周|周)([一二三四五六日天])/)
  if (weekdayMatch) {
    const weekdayMap: Record<string, number> = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      日: 0,
      天: 0,
    }
    return toIsoDate(nextWeekday(now, weekdayMap[weekdayMatch[2]], weekdayMatch[1] === '下周'))
  }

  return undefined
}

function extractDepartureCity(input: string): string | undefined {
  const knownDeparture = KNOWN_DESTINATIONS.find((city) =>
    new RegExp(`${city}\\s*出发`).test(input),
  )
  if (knownDeparture) return knownDeparture
  const match = input.match(/(?:从|出发地(?:是|为)?|出发城市(?:是|为)?)[\s：:]?([\u4e00-\u9fa5A-Za-z·]{2,12}?)(?=出发|去|到|前往|，|,|。|\s|$)/)
  return match?.[1]
}

function cleanDestination(value: string): string | undefined {
  const cleaned = value
    .replace(/^(?:想|要|准备|计划|打算)/, '')
    .replace(/(?:玩|旅游|旅行|度假|自由行|出差|待|住)$/, '')
    .trim()
  if (!cleaned || /哪里|哪儿|哪座|哪一个/.test(cleaned)) return undefined
  return cleaned
}

function extractDestinations(input: string, departureCity?: string): string[] {
  const found: string[] = KNOWN_DESTINATIONS.filter(
    (destination) => input.includes(destination) && destination !== departureCity,
  )

  const genericMatches = input.matchAll(
    /(?:目的地(?:是|为)?|(?:想|要|准备|计划|打算)?(?:去|到|前往)|(?:再|还)去|加上|换成|改成)[\s：:]?([\u4e00-\u9fa5A-Za-z·]{2,18}?)(?=玩|旅游|旅行|度假|自由行|出差|待|住|\d+[天日]|[一二两三四五六七八九十]+[天日]|，|,|。|！|!|？|\?|\s|$)/g,
  )
  for (const match of genericMatches) {
    const pieces = match[1].split(/[、和与及]/)
    for (const piece of pieces) {
      const destination = cleanDestination(piece)
      if (destination && destination !== departureCity) found.push(destination)
    }
  }

  return unique(found)
}

function extractDuration(input: string): number | undefined {
  const withoutDates = input
    .replace(/(?:(?:\d{4})[年/.-])?\d{1,2}[月/.-]\d{1,2}[日号]?/g, '')
    .replace(/第\s*[0-9一二两三四五六七八九十]+\s*天/g, '')
    .replace(/Day\s*\d+/gi, '')
  const match = withoutDates.match(
    /(?<![年月])([0-9一二两三四五六七八九十]{1,3})\s*(?:天|日)(?:\d+晚)?(?:游|行程)?/,
  )
  if (match) return parseChineseNumber(match[1])
  if (/(?:周末|双休日)/.test(withoutDates)) return 2
  return undefined
}

const COUNT_PATTERN = '[0-9一二两三四五六七八九十]+'

function matchCategoryCount(
  input: string,
  categoryPattern: string,
): { count: number; age?: number } | undefined {
  const match = input.match(
    new RegExp(
      `(${COUNT_PATTERN})\\s*(?:个|位)?\\s*(?:(\\d{1,3})\\s*岁(?:的)?\\s*)?(?:${categoryPattern})`,
    ),
  )
  if (!match) return undefined
  const count = parseChineseNumber(match[1])
  if (!count) return undefined
  const age = match[2] ? Number(match[2]) : undefined
  return { count, ...(age !== undefined ? { age } : {}) }
}

function extractAgeList(input: string): number[] {
  const explicitList = input.match(
    /(?:年龄(?:分别)?(?:是|为|：|:)?\s*)?((?:\d{1,3}\s*[、,，和及]\s*)+\d{1,3})\s*岁/,
  )
  if (explicitList) {
    return [...explicitList[1].matchAll(/\d{1,3}/g)]
      .map((match) => Number(match[0]))
      .filter((age) => age >= 0 && age <= 120)
  }

  const ages = [...input.matchAll(/(\d{1,3})\s*岁/g)]
    .map((match) => Number(match[1]))
    .filter((age) => age >= 0 && age <= 120)
  return ages.length > 1 ? ages : []
}

function updateExistingTravelerAge(
  input: string,
  current: TripRequirement['travelers'],
): Traveler[] | undefined {
  const exactChange = input.match(
    /(\d{1,3})\s*岁(?:的)?[^，。]{0,12}?(?:改成|改为|变成|调整为)\s*(\d{1,3})\s*岁/,
  )
  if (exactChange) {
    const previousAge = Number(exactChange[1])
    const nextAge = Number(exactChange[2])
    if (nextAge < 0 || nextAge > 120) return undefined
    let changed = false
    const people = current.people.map((traveler) => {
      if (!changed && traveler.age === previousAge) {
        changed = true
        return { ...traveler, age: nextAge, category: classifyTravelerAge(nextAge) }
      }
      return traveler
    })
    return changed ? people : undefined
  }

  const categoryChange = input.match(
    /(孩子|儿童|小孩|老人|长辈|成人|大人)(?:的)?(?:年龄)?[^，。]{0,8}?(?:改成|改为|变成|调整为)\s*(\d{1,3})\s*岁/,
  )
  if (!categoryChange) return undefined
  const nextAge = Number(categoryChange[2])
  if (nextAge < 0 || nextAge > 120) return undefined
  const targetCategory = /孩子|儿童|小孩/.test(categoryChange[1])
    ? 'child'
    : /老人|长辈/.test(categoryChange[1])
      ? 'senior'
      : 'adult'
  let changed = false
  const people = current.people.map((traveler) => {
    if (!changed && traveler.category === targetCategory) {
      changed = true
      return { ...traveler, age: nextAge, category: classifyTravelerAge(nextAge) }
    }
    return traveler
  })
  return changed ? people : undefined
}

function extractTravelers(
  input: string,
  current: TripRequirement['travelers'],
): TravelerRequirementPatch | undefined {
  const changedPeople = updateExistingTravelerAge(input, current)
  if (changedPeople) return { total: current.total ?? changedPeople.length, people: changedPeople }

  const familyMatch = input.match(new RegExp(`一家\\s*(${COUNT_PATTERN})\\s*口`))
  const peopleMatch = input.match(
    new RegExp(`(${COUNT_PATTERN})\\s*(?:个|位)?\\s*(?:人|游客)(?:一起|同行)?`),
  )
  const statedTotal = parseChineseNumber(familyMatch?.[1] ?? peopleMatch?.[1] ?? '')
  const isWaitingForAgeStructure = Boolean(
    current.total && current.people.length !== current.total,
  )
  const isContextualNegativeAnswer =
    isWaitingForAgeStructure &&
    /^(?:没有(?:的)?|没(?:有)?|无|都没有|一个都没有)[。！!？?\s]*$/.test(input.trim())
  const allAdults =
    isContextualNegativeAnswer ||
    /(?:都|全(?:部)?)(?:是)?(?:成人|成年人|大人)|没有[^。]*(?:儿童|孩子)[^。]*(?:老人|长辈)|没有(?:儿童|孩子|老人|长辈)|无(?:儿童|孩子|老人|长辈)/.test(
      input,
    )

  const compactMatch = input.match(
    new RegExp(`(${COUNT_PATTERN})\\s*大\\s*(${COUNT_PATTERN})\\s*小`),
  )
  if (compactMatch) {
    const adults = parseChineseNumber(compactMatch[1]) ?? 0
    const children = parseChineseNumber(compactMatch[2]) ?? 0
    return {
      total: adults + children,
      people: createTravelersByCategory(adults, children, 0),
    }
  }

  const adultGroup = matchCategoryCount(input, '大人|成人|成年人')
  const childGroup = matchCategoryCount(input, '孩子|儿童|小孩')
  const seniorGroup = matchCategoryCount(input, '老人|长辈')
  if (adultGroup || childGroup || seniorGroup) {
    let adults = adultGroup?.count ?? 0
    const children = childGroup?.count ?? 0
    const seniors = seniorGroup?.count ?? 0
    const specifiedTotal = adults + children + seniors
    if (!adultGroup && current.total && children + seniors <= current.total) {
      adults = current.total - children - seniors
    }
    const total = adults + children + seniors
    const adultAges =
      adultGroup?.age !== undefined ? Array(adultGroup.count).fill(adultGroup.age) : []
    const childAges =
      childGroup?.age !== undefined ? Array(childGroup.count).fill(childGroup.age) : []
    const seniorAges =
      seniorGroup?.age !== undefined ? Array(seniorGroup.count).fill(seniorGroup.age) : []
    if (total > 0 && (specifiedTotal > 0 || statedTotal)) {
      return {
        total,
        people: createTravelersByCategory(
          adults,
          children,
          seniors,
          childAges,
          seniorAges,
          adultAges,
        ),
      }
    }
  }

  const ages = extractAgeList(input)
  if (ages.length > 0) {
    return { total: ages.length, people: createTravelersFromAges(ages) }
  }

  if (allAdults) return { ...(statedTotal ? { total: statedTotal } : {}), allAdults: true }
  if (statedTotal) return { total: statedTotal }
  if (/情侣|夫妻|两口子/.test(input)) {
    return { total: 2, people: createTravelersByCategory(2, 0, 0) }
  }
  if (/我自己|独自|一个人|单人/.test(input)) {
    return { total: 1, people: createTravelersByCategory(1, 0, 0) }
  }
  return undefined
}

function extractBudget(input: string): TravelBudgetRequirement | undefined {
  const changedBudget = input.match(
    /(?:人均|每人|总预算|预算)[^。！？!?]{0,20}?(?:改成|改为|调整为|降到|提高到|控制在)\s*(\d+(?:\.\d+)?)\s*(万|千|k|K)?\s*(?:元|块)?(?:以内|左右|上下)?/,
  )
  const regularMatches = [
    ...input.matchAll(
      /(?:人均|每人|总共|总预算|预算)?\s*(?:预算)?\s*(?:控制在|大概|约|是|为)?\s*(\d+(?:\.\d+)?)\s*(万|千|k|K)?\s*(?:元|块)(?:以内|左右|上下)?/g,
    ),
  ]
  const match = changedBudget ?? regularMatches[regularMatches.length - 1]
  if (!match || !/(预算|人均|每人|元|块|以内)/.test(input)) return undefined
  const multiplier = match[2] === '万' ? 10_000 : match[2] && ['千', 'k', 'K'].includes(match[2]) ? 1_000 : 1
  return {
    amount: Number(match[1]) * multiplier,
    type: /人均|每人/.test(input) ? 'per-person' : 'total',
    currency: 'CNY',
  }
}

function extractPreferences(input: string): string[] {
  return Object.entries(PREFERENCE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => input.includes(keyword)))
    .map(([preference]) => preference)
}

function extractPace(input: string): TravelPace | undefined {
  if (/轻松|休闲|慢节奏|不要太赶|不想太赶|少走路|减少步行/.test(input)) return 'relaxed'
  if (/紧凑|充实|多安排|特种兵|尽量多玩/.test(input)) return 'intensive'
  if (/正常节奏|适中/.test(input)) return 'normal'
  return undefined
}

function extractHotelLevel(input: string): HotelLevel | undefined {
  const candidates: Array<{ level: HotelLevel; index: number }> = []
  const patterns: Array<[HotelLevel, RegExp]> = [
    ['budget', /经济型|经济酒店|便宜(?:点|一些)?的?酒店|住宿[^。]{0,8}(?:省钱|便宜)/g],
    ['comfort', /舒适型|舒适酒店|中档酒店/g],
    ['premium', /高档型|高端酒店|豪华酒店|住好一点/g],
  ]
  patterns.forEach(([level, pattern]) => {
    for (const match of input.matchAll(pattern)) candidates.push({ level, index: match.index })
  })
  return candidates.sort((left, right) => right.index - left.index)[0]?.level
}

function extractCompanion(input: string): CompanionType | undefined {
  if (/我自己|独自|一个人|单人/.test(input)) return 'solo'
  if (/情侣|夫妻|对象|爱人|伴侣/.test(input)) return 'couple'
  if (/亲子|带娃|孩子|小朋友/.test(input)) return 'parent-child'
  if (/家人|家庭|全家|一家/.test(input)) return 'family'
  if (/朋友|闺蜜|兄弟|同学/.test(input)) return 'friends'
  if (/同事|团建/.test(input)) return 'colleagues'
  return undefined
}

function extractConstraints(input: string): string[] {
  const constraints: string[] = []
  if (/不吃辣|不能吃辣|忌辣/.test(input)) constraints.push('不吃辣')
  if (/素食|吃素/.test(input)) constraints.push('素食')
  if (/老人|长辈/.test(input)) constraints.push('有老人同行')
  if (/轮椅|无障碍/.test(input)) constraints.push('需要无障碍设施')
  if (/少走路|减少步行|腿脚不便/.test(input)) constraints.push('减少步行')
  if (/不要爬山|不爬山|不想爬山|避免爬山|不安排爬山/.test(input)) constraints.push('不安排爬山')
  if (/不早起|不要早起/.test(input)) constraints.push('不安排早起')
  return constraints
}

export function parseTripRequirement(
  input: string,
  now = new Date(),
  currentTravelers: TripRequirement['travelers'] = { people: [] },
): TripRequirementPatch {
  const departureCity = extractDepartureCity(input)
  const replaceDestinations = /(?:目的地.{0,6}(?:改|换)|不去|改去|换去|改成|换成|改为|换为)/.test(
    input,
  )
  const destinationInput = replaceDestinations
    ? input.replace(/^.*(?:改去|换去|改成|换成|改为|换为)/, '')
    : input
  return {
    departureCity,
    destinations: extractDestinations(destinationInput, departureCity),
    replaceDestinations,
    startDate: extractDate(input, now),
    duration: extractDuration(input),
    travelers: extractTravelers(input, currentTravelers),
    budget: extractBudget(input),
    hotelLevel: extractHotelLevel(input),
    preferences: extractPreferences(input),
    pace: extractPace(input),
    companion: extractCompanion(input),
    constraints: extractConstraints(input),
  }
}

export function mergeTripRequirement(
  current: TripRequirement,
  patch: TripRequirementPatch,
): TripRequirement {
  const mergeTravelers = (): TripRequirement['travelers'] => {
    if (!patch.travelers) return current.travelers
    const total = patch.travelers.total ?? current.travelers.total
    if (patch.travelers.people) {
      return {
        total: total ?? patch.travelers.people.length,
        people: patch.travelers.people,
      }
    }
    if (patch.travelers.allAdults && total) {
      return { total, people: createTravelersByCategory(total, 0, 0) }
    }
    if (patch.travelers.total !== undefined && patch.travelers.total !== current.travelers.total) {
      return { total: patch.travelers.total, people: [] }
    }
    return { ...current.travelers, ...(total ? { total } : {}) }
  }

  return {
    ...current,
    ...(patch.departureCity ? { departureCity: patch.departureCity } : {}),
    destinations:
      patch.replaceDestinations && patch.destinations?.length
        ? unique(patch.destinations)
        : unique([...current.destinations, ...(patch.destinations ?? [])]),
    ...(patch.startDate ? { startDate: patch.startDate } : {}),
    ...(patch.duration ? { duration: patch.duration } : {}),
    travelers: mergeTravelers(),
    ...(patch.budget ? { budget: patch.budget } : {}),
    ...(patch.hotelLevel ? { hotelLevel: patch.hotelLevel } : {}),
    preferences: unique([...current.preferences, ...(patch.preferences ?? [])]),
    ...(patch.pace ? { pace: patch.pace } : {}),
    ...(patch.companion ? { companion: patch.companion } : {}),
    constraints: unique([...current.constraints, ...(patch.constraints ?? [])]),
  }
}

export function updateTripRequirement(
  current: TripRequirement,
  input: string,
  now = new Date(),
): TripRequirement {
  return mergeTripRequirement(current, parseTripRequirement(input, now, current.travelers))
}

export function getMissingRequirementFields(requirement: TripRequirement): RequiredTripField[] {
  const missing = new Set<RequiredTripField>()
  if (requirement.destinations.length === 0) missing.add('destinations')
  if (!requirement.startDate) missing.add('startDate')
  if (!requirement.duration) missing.add('duration')
  if (!requirement.travelers.total) missing.add('travelers')
  if (requirement.travelers.total && !hasKnownTravelerStructure(requirement.travelers)) {
    missing.add('travelerAges')
  }
  return REQUIRED_FIELD_ORDER.filter((field) => missing.has(field))
}

const SINGLE_FIELD_QUESTIONS: Record<RequiredTripField, string> = {
  destinations: '这次旅行想去哪里呢？',
  duration: '计划玩几天呢？',
  startDate: '大概什么时候出发？',
  travelers: '几个人一起出行呢？',
  travelerAges: '游客中有12岁及以下儿童或65岁及以上老人吗？这可能会影响景点门票预算。',
}

const TWO_FIELD_QUESTIONS: Partial<Record<string, string>> = {
  'destinations,duration': '想去哪里，以及计划玩几天呢？',
  'startDate,travelers': '大概什么时候出发？几个人一起呢？',
  'duration,startDate': '计划玩几天？大概什么时候出发呢？',
  'destinations,startDate': '想去哪里？大概什么时候出发呢？',
  'destinations,travelers': '想去哪里？几个人一起出行呢？',
  'duration,travelers': '计划玩几天？几个人一起出行呢？',
}

export function buildRequirementQuestion(
  missingFields: RequiredTripField[],
  requirement?: TripRequirement,
): string | undefined {
  const fields = missingFields.slice(0, 2)
  if (fields.length === 0) return undefined
  const questionFor = (field: RequiredTripField) =>
    field === 'travelerAges' && requirement?.travelers.total
      ? `${requirement.travelers.total}位游客中有12岁及以下儿童或65岁及以上老人吗？这可能会影响景点门票预算。`
      : SINGLE_FIELD_QUESTIONS[field]
  if (fields.length === 1) return questionFor(fields[0])
  return (
    TWO_FIELD_QUESTIONS[fields.join(',')] ??
    `${questionFor(fields[0])}${questionFor(fields[1])}`
  )
}

export function formatStartDate(startDate: string): string {
  const [year, month, day] = startDate.split('-').map(Number)
  return `${year}年${month}月${day}日`
}

export function buildRequirementSummary(requirement: TripRequirement): string {
  const details = [
    `目的地：${requirement.destinations.join('、')}`,
    requirement.departureCity ? `出发城市：${requirement.departureCity}` : undefined,
    requirement.startDate ? `出发日期：${formatStartDate(requirement.startDate)}` : undefined,
    requirement.duration ? `旅行天数：${requirement.duration}天` : undefined,
    requirement.travelers.total ? `出行人数：${requirement.travelers.total}人` : undefined,
    hasKnownTravelerStructure(requirement.travelers)
      ? buildTravelerSummary(requirement.travelers)
      : undefined,
    `酒店档位：${
      { budget: '经济型', comfort: '舒适型', premium: '高档型' }[requirement.hotelLevel]
    }`,
    requirement.preferences.length > 0 ? `旅行偏好：${requirement.preferences.join('、')}` : undefined,
    requirement.pace
      ? `旅行节奏：${{ relaxed: '轻松', normal: '适中', intensive: '紧凑' }[requirement.pace]}`
      : undefined,
    requirement.constraints.length > 0
      ? `特殊要求：${requirement.constraints.join('、')}`
      : undefined,
  ].filter(Boolean)

  return `旅行信息已收集完整：\n${details.join('\n')}`
}
