import { changshaAttractions, findChangshaAttraction } from '../../data/travel/attractions'
import type { Attraction } from '../../types/pricing'
import type {
  TimelineItem,
  TravelPace,
  TripDay,
  TripPlan,
  TripRequirement,
} from '../../types/trip'
import {
  getAttractionPlanningProfile,
  type AttractionPlanningProfile,
} from './planningProfiles'

export interface TripPlanModificationResult {
  plan: TripPlan
  changed: boolean
  description: string
  feedback?: string
  notice: {
    title: string
    before?: string
    after: string
    impact: string
    targetDay?: number
  }
}

const CATEGORY_DESCRIPTIONS: Record<Attraction['category'], string> = {
  landmark: '感受长沙城市地标与本地生活氛围',
  history: '了解长沙历史文化与人文故事',
  museum: '通过展览深入认识湖湘文化',
  nature: '放慢节奏，欣赏自然风景',
  shopping: '体验长沙热门商圈与街区',
  food_street: '品尝长沙特色小吃与本地风味',
  art: '参观艺术空间与当代展览',
  theme_park: '体验主题娱乐项目',
  family: '适合亲子共同体验的休闲项目',
  ancient_town: '漫游古镇街巷与传统建筑',
}

const TIME_SLOTS = ['09:30', '11:30', '14:00', '16:30', '19:00']

function activityFromAttraction(attraction: Attraction, day: number, index: number): TimelineItem {
  const profile = getAttractionPlanningProfile(attraction)
  const defaultPeriod = profile.periods[0]
  return {
    id: `d${day}-${attraction.id}`,
    attractionId: attraction.id,
    time: TIME_SLOTS[index] ?? `${9 + index * 2}:30`,
    place: attraction.name,
    description: attraction.description ?? CATEGORY_DESCRIPTIONS[attraction.category],
    duration: attraction.recommendedDuration
      ? `约 ${attraction.recommendedDuration} 小时`
      : undefined,
    cost: attraction.price.amount,
    priceType: attraction.price.type,
    activityType: 'attraction',
    period: defaultPeriod,
    area: profile.areaLabel,
  }
}

function travelerContext(requirement: TripRequirement) {
  return {
    hasChild: requirement.travelers.people.some((traveler) => traveler.category === 'child'),
    hasSenior: requirement.travelers.people.some((traveler) => traveler.category === 'senior'),
  }
}

function includesPreference(requirement: TripRequirement, pattern: RegExp): boolean {
  return requirement.preferences.some((preference) => pattern.test(preference))
}

function hasConstraint(requirement: TripRequirement, pattern: RegExp): boolean {
  return requirement.constraints.some((constraint) => pattern.test(constraint))
}

function mainActivityTarget(pace: TravelPace, hasSenior: boolean): number {
  const target = pace === 'relaxed' ? 3 : pace === 'normal' ? 4 : 5
  if (!hasSenior) return target
  return Math.min(target, pace === 'intensive' ? 4 : 3)
}

function perPersonDailyBudget(requirement: TripRequirement): number | undefined {
  if (!requirement.budget || !requirement.duration || !requirement.travelers.total) return undefined
  const perPerson = requirement.budget.type === 'per-person'
    ? requirement.budget.amount
    : requirement.budget.amount / requirement.travelers.total
  return perPerson / requirement.duration
}

function attractionScore(
  attraction: Attraction,
  requirement: TripRequirement,
  profile: AttractionPlanningProfile,
): number {
  const { hasChild, hasSenior } = travelerContext(requirement)
  let score = 10

  if (includesPreference(requirement, /美食/)) {
    if (attraction.category === 'food_street') score += 22
    if (attraction.category === 'shopping') score += 8
  }
  if (includesPreference(requirement, /历史|文化/)) {
    if (['history', 'museum', 'ancient_town'].includes(attraction.category)) score += 18
  }
  if (includesPreference(requirement, /自然|风景/)) {
    if (attraction.category === 'nature') score += 18
    if (attraction.category === 'landmark') score += 4
  }
  if (includesPreference(requirement, /购物/)) {
    if (['shopping', 'landmark'].includes(attraction.category)) score += 16
  }
  if (includesPreference(requirement, /摄影|拍照/)) {
    if (['art', 'nature', 'landmark'].includes(attraction.category)) score += 14
  }
  if (includesPreference(requirement, /亲子/)) {
    if (profile.childFriendly) score += 20
    if (['family', 'theme_park'].includes(attraction.category)) score += 18
  }
  if (includesPreference(requirement, /夜生活/)) {
    if (profile.periods.includes('evening')) score += 15
  }

  if (hasChild) {
    if (profile.childFriendly) score += 14
    if (['family', 'theme_park', 'nature'].includes(attraction.category)) score += 8
  }
  if (hasSenior) {
    if (profile.seniorFriendly) score += 12
    if (profile.walking === 'low') score += 7
    if (profile.walking === 'high') score -= 18
    if (profile.climbing) score -= 30
  }

  const dailyBudget = perPersonDailyBudget(requirement)
  if (dailyBudget !== undefined && dailyBudget < 500) {
    score += attraction.price.amount === 0 ? 10 : -attraction.price.amount / 18
  }
  return score
}

function isEligibleAttraction(
  attraction: Attraction,
  requirement: TripRequirement,
): boolean {
  const profile = getAttractionPlanningProfile(attraction)
  const { hasSenior } = travelerContext(requirement)
  if (hasSenior && profile.climbing) return false
  if (hasConstraint(requirement, /不.*爬山|不安排爬山|避免爬山/) && profile.climbing) return false
  if (hasConstraint(requirement, /减少步行|少走路|腿脚不便|无障碍/) && profile.walking === 'high') {
    return false
  }
  return true
}

function periodRank(profile: AttractionPlanningProfile): number {
  if (profile.periods.includes('morning')) return 0
  if (profile.periods.includes('afternoon')) return 1
  return 2
}

function scheduleAttractions(attractions: Attraction[], day: number): TimelineItem[] {
  const sorted = [...attractions].sort((left, right) => {
    const rankDifference = periodRank(getAttractionPlanningProfile(left)) - periodRank(getAttractionPlanningProfile(right))
    return rankDifference || left.id.localeCompare(right.id)
  })
  const slotsByCount: Record<number, string[]> = {
    1: ['09:30'],
    2: ['09:30', '14:30'],
    3: ['09:30', '14:30', '16:45'],
    4: ['09:00', '10:45', '14:30', '17:30'],
    5: ['09:00', '10:30', '14:00', '16:15', '19:00'],
  }
  const slots = slotsByCount[sorted.length] ?? TIME_SLOTS
  return sorted.map((attraction, index) => {
    const profile = getAttractionPlanningProfile(attraction)
    const isLastEveningActivity =
      index === sorted.length - 1 && profile.periods.includes('evening')
    const time = isLastEveningActivity ? '19:00' : (slots[index] ?? TIME_SLOTS[index])
    return {
      ...activityFromAttraction(attraction, day, index),
      time,
      period: time < '12:00' ? 'morning' : time < '18:00' ? 'afternoon' : 'evening',
    }
  })
}

function createLunchActivity(
  day: number,
  requirement: TripRequirement,
  areaLabel: string,
): TimelineItem {
  const { hasChild, hasSenior } = travelerContext(requirement)
  const foodFocused = includesPreference(requirement, /美食/)
  const description = hasSenior
    ? foodFocused
      ? '就近品尝长沙特色餐饮，并预留充足的午间休息时间'
      : '选择就近餐厅用餐，并预留充足的午间休息时间'
    : foodFocused
      ? '品尝长沙米粉、湘菜或本地特色小吃，并预留午间休息时间'
      : hasChild
        ? '安排适合儿童的本地午餐与午间休息'
        : '就近用餐并短暂休息，为下午行程补充体力'
  return {
    id: `d${day}-lunch`,
    time: '12:30',
    place: foodFocused ? '长沙特色餐饮与午休' : '午餐与休息',
    description,
    duration: '约 1 小时',
    activityType: 'meal',
    period: 'noon',
    area: areaLabel,
  }
}

function sortTimeline(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((left, right) => left.time.localeCompare(right.time))
}

function dateAtOffset(startDate: string | undefined, offset: number): string | undefined {
  if (!startDate) return undefined
  const [year, month, day] = startDate.split('-').map(Number)
  const date = new Date(year, month - 1, day + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildDynamicItinerary(
  requirement: TripRequirement,
  pace: TravelPace,
  previousPlan?: TripPlan,
): TripDay[] {
  const { hasSenior } = travelerContext(requirement)
  const targetCount = mainActivityTarget(pace, hasSenior)
  const usedAttractionIds = new Set<string>()
  const areaUsage = new Map<AttractionPlanningProfile['area'], number>()

  return Array.from({ length: requirement.duration ?? 0 }, (_, dayIndex) => {
    const inheritedConstraints = previousPlan?.itinerary.find(
      (day) => day.day === dayIndex + 1,
    )?.constraints ?? []
    const dayRequirement: TripRequirement = {
      ...requirement,
      constraints: [...new Set([...requirement.constraints, ...inheritedConstraints])],
    }
    const eligibleAttractions = changshaAttractions.filter((attraction) =>
      isEligibleAttraction(attraction, dayRequirement),
    )
    const remaining = eligibleAttractions.filter((attraction) => !usedAttractionIds.has(attraction.id))
    const source = remaining.length >= targetCount ? remaining : eligibleAttractions
    const grouped = new Map<AttractionPlanningProfile['area'], Attraction[]>()
    source.forEach((attraction) => {
      const area = getAttractionPlanningProfile(attraction).area
      grouped.set(area, [...(grouped.get(area) ?? []), attraction])
    })

    const areaCandidates = [...grouped.entries()].map(([area, attractions]) => {
      const ranked = [...attractions].sort((left, right) => {
        const scoreDifference =
          attractionScore(right, dayRequirement, getAttractionPlanningProfile(right)) -
          attractionScore(left, dayRequirement, getAttractionPlanningProfile(left))
        return scoreDifference || left.id.localeCompare(right.id)
      })
      const top = ranked.slice(0, targetCount)
      const insufficientPenalty = Math.max(targetCount - top.length, 0) * 35
      const reusePenalty = (areaUsage.get(area) ?? 0) * 16
      const score = top.reduce(
        (sum, attraction) =>
          sum + attractionScore(attraction, dayRequirement, getAttractionPlanningProfile(attraction)),
        0,
      ) - insufficientPenalty - reusePenalty
      return { area, attractions: ranked, score }
    })
    areaCandidates.sort((left, right) => right.score - left.score || left.area.localeCompare(right.area))
    const selectedArea = areaCandidates[0]
    const selected = selectedArea?.attractions.slice(0, targetCount) ?? []
    selected.forEach((attraction) => usedAttractionIds.add(attraction.id))
    if (selectedArea) areaUsage.set(selectedArea.area, (areaUsage.get(selectedArea.area) ?? 0) + 1)

    const firstProfile = selected[0]
      ? getAttractionPlanningProfile(selected[0])
      : getAttractionPlanningProfile(changshaAttractions[0])
    const dayPace: TravelPace = hasSenior
      ? pace === 'intensive'
        ? 'normal'
        : 'relaxed'
      : pace
    const scheduledAttractions = scheduleAttractions(selected, dayIndex + 1)
    const activities = sortTimeline([
      ...scheduledAttractions,
      createLunchActivity(dayIndex + 1, dayRequirement, firstProfile.areaLabel),
    ])
    const theme = selected.map((attraction) => attraction.name).join(' · ')
    return {
      day: dayIndex + 1,
      date: dateAtOffset(requirement.startDate, dayIndex),
      city: '长沙',
      title: `${firstProfile.areaLabel}${dayPace === 'relaxed' ? '轻松游' : '主题游'}`,
      theme,
      activities,
      estimatedCost: selected.reduce((sum, attraction) => sum + attraction.price.amount, 0),
      transport:
        hasSenior || hasConstraint(dayRequirement, /减少步行|少走路|腿脚不便/)
          ? '地铁 + 短途出租车，减少连续步行'
          : '地铁 + 步行 + 短途出租车',
      intensity: dayPace,
      area: firstProfile.areaLabel,
      constraints: inheritedConstraints,
    }
  })
}

export function generateDemoTripPlan(
  requirement: TripRequirement,
  previousPlan?: TripPlan,
): TripPlan | undefined {
  if (!requirement.destinations.includes('长沙') || !requirement.duration || !requirement.travelers.total) {
    return undefined
  }
  const pace = requirement.pace ?? 'normal'
  const itinerary = buildDynamicItinerary(requirement, pace, previousPlan)
  const travelers = { adults: 0, children: 0, seniors: 0 }
  requirement.travelers.people.forEach((traveler) => {
    if (traveler.category === 'child') travelers.children += 1
    else if (traveler.category === 'senior') travelers.seniors += 1
    else travelers.adults += 1
  })
  return {
    id: `changsha-${requirement.duration}d-${Date.now()}`,
    title: `${requirement.destinations.join(' → ')}${requirement.duration}天${Math.max(requirement.duration - 1, 0)}晚旅行`,
    destinations: requirement.destinations,
    startDate: requirement.startDate,
    endDate: dateAtOffset(requirement.startDate, requirement.duration - 1),
    days: requirement.duration,
    nights: Math.max(requirement.duration - 1, 0),
    travelers,
    budget: {},
    preferences: requirement.preferences.length > 0 ? requirement.preferences : ['城市漫游'],
    pace,
    itinerary,
  }
}

export function generateAlternativeDemoTripPlan(
  requirement: TripRequirement,
  previousPlan: TripPlan,
): TripPlan | undefined {
  const generated = generateDemoTripPlan(requirement, previousPlan)
  if (!generated || generated.itinerary.length < 2) return generated

  const rotatedDays = [...generated.itinerary.slice(1), generated.itinerary[0]]
  return {
    ...generated,
    id: `${generated.id}-replanned`,
    itinerary: rotatedDays.map((tripDay, index) => ({
      ...tripDay,
      day: index + 1,
      date: dateAtOffset(requirement.startDate, index),
      activities: tripDay.activities.map((activity, activityIndex) => ({
        ...activity,
        id: `d${index + 1}-${activity.attractionId ?? activityIndex + 1}`,
      })),
    })),
  }
}

function recalculateDay(day: TripDay): TripDay {
  return {
    ...day,
    estimatedCost: day.activities.reduce((sum, activity) => sum + (activity.cost ?? 0), 0),
  }
}

const CHINESE_DAY_DIGITS: Record<string, number> = {
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

const ATTRACTION_ALIASES: Partial<Record<string, string[]>> = {
  'changsha-ifs': ['IFS', '国金中心'],
  'changsha-dufu-pavilion': ['杜甫江阁'],
  'changsha-tianxin-pavilion': ['天心阁'],
  'changsha-bamboo-slips-museum': ['简牍博物馆'],
  'hunan-martyrs-park': ['烈士公园'],
  'changsha-yanghu-wetland': ['洋湖湿地'],
  'changsha-meixihu-arts-center': ['梅溪湖艺术中心', '梅溪湖'],
  'changsha-ecological-zoo': ['生态动物园'],
  'changsha-window-of-the-world': ['世界之窗'],
  'changsha-underwater-world': ['海底世界'],
  'changsha-tongguanyao-town': ['铜官窑古镇'],
}

function parseDayNumber(value: string): number | undefined {
  if (/^\d+$/.test(value)) return Number(value)
  if (value === '十') return 10
  if (value.includes('十')) {
    const [tens, units] = value.split('十')
    const tensValue = tens ? CHINESE_DAY_DIGITS[tens] : 1
    const unitsValue = units ? CHINESE_DAY_DIGITS[units] : 0
    return tensValue === undefined || unitsValue === undefined
      ? undefined
      : tensValue * 10 + unitsValue
  }
  return CHINESE_DAY_DIGITS[value]
}

function extractTargetDay(input: string): number | undefined {
  const match = input.match(/第\s*([0-9一二两三四五六七八九十]+)\s*天/i) ?? input.match(/Day\s*(\d+)/i)
  return match ? parseDayNumber(match[1]) : undefined
}

function extractMentionedAttractions(input: string): Attraction[] {
  const normalizedInput = input.replace(/\s+/g, '').toLowerCase()
  return changshaAttractions.filter((attraction) => {
    const terms = [attraction.name, ...(ATTRACTION_ALIASES[attraction.id] ?? [])]
    return terms.some((term) => normalizedInput.includes(term.replace(/\s+/g, '').toLowerCase()))
  })
}

function extractRemovedAttractions(input: string): Attraction[] {
  const removalSegments = [
    ...input.matchAll(/(?:不要|删除|移除|去掉|取消)([^，。；;！!？?]*)/g),
  ]
  const removed = removalSegments.flatMap((match) => extractMentionedAttractions(match[1]))
  return removed.filter(
    (attraction, index) => removed.findIndex((item) => item.id === attraction.id) === index,
  )
}

function attractionNames(activities: TimelineItem[]): string[] {
  return activities
    .filter((activity) => activity.activityType === 'attraction' || activity.attractionId)
    .map((activity) => activity.place)
}

function isClimbingActivity(activity: TimelineItem): boolean {
  if (!activity.attractionId) return false
  const attraction = findChangshaAttraction(activity.attractionId)
  return attraction ? Boolean(getAttractionPlanningProfile(attraction).climbing) : false
}

function limitMainActivities(activities: TimelineItem[], limit: number): TimelineItem[] {
  let attractionCount = 0
  return activities.filter((activity) => {
    if (!activity.attractionId) return true
    attractionCount += 1
    return attractionCount <= limit
  })
}

function updateDayRoute(
  day: TripDay,
  activities: TimelineItem[],
  intensity: TravelPace,
): TripDay {
  const attractionCount = activities.filter((activity) => activity.attractionId).length
  const slotsByCount: Record<number, string[]> = {
    1: ['09:30'],
    2: ['09:30', '14:30'],
    3: ['09:30', '14:30', '16:45'],
    4: ['09:00', '10:45', '14:30', '17:30'],
    5: ['09:00', '10:30', '14:00', '16:15', '19:00'],
  }
  const slots = slotsByCount[attractionCount] ?? TIME_SLOTS
  let attractionIndex = 0
  const timedActivities = sortTimeline(
    activities.map((activity) => {
      if (!activity.attractionId) return activity
      const time = slots[attractionIndex] ?? `${9 + attractionIndex * 2}:30`
      attractionIndex += 1
      return {
        ...activity,
        id: `d${day.day}-${activity.attractionId}`,
        time,
        period: time < '12:00' ? 'morning' : time < '18:00' ? 'afternoon' : 'evening',
      }
    }),
  )
  const names = attractionNames(timedActivities)
  const title = names.length
    ? `${names.slice(0, 2).join('与')}${intensity === 'relaxed' ? '轻松游' : '一日游'}`
    : '自由活动与休息'
  return recalculateDay({
    ...day,
    title,
    theme: names.join(' · ') || '自由活动',
    intensity,
    transport: intensity === 'relaxed' ? '地铁 + 短途出租车' : day.transport,
    activities: timedActivities,
  })
}

function sameDayPlan(left: TripDay, right: TripDay): boolean {
  return (
    left.intensity === right.intensity &&
    JSON.stringify(left.constraints ?? []) === JSON.stringify(right.constraints ?? []) &&
    left.activities.map((activity) => activity.attractionId ?? activity.place).join('|') ===
      right.activities.map((activity) => activity.attractionId ?? activity.place).join('|')
  )
}

function extractReplacementRequest(input: string): { from: Attraction[]; to: Attraction[] } {
  const match = input.match(/^(.*?)(?:换成|换为|更换成|更换为|替换成|替换为|改成|改为)(.*)$/)
  if (!match) return { from: [], to: [] }
  return {
    from: extractMentionedAttractions(match[1]),
    to: extractMentionedAttractions(match[2]),
  }
}

function chooseAutomaticReplacement(
  current: TripPlan,
  day: TripDay,
  source: Attraction,
  input: string,
): Attraction | undefined {
  const usedIds = new Set(
    current.itinerary.flatMap((tripDay) =>
      tripDay.activities.flatMap((activity) =>
        activity.attractionId ? [activity.attractionId] : [],
      ),
    ),
  )
  const sourceProfile = getAttractionPlanningProfile(source)
  const avoidsClimbing = day.constraints?.includes('不安排爬山') || /不要爬山|不爬山/.test(input)
  const scoreCandidate = (candidate: Attraction): number => {
    const profile = getAttractionPlanningProfile(candidate)
    let score = profile.area === sourceProfile.area ? 30 : 0
    if (candidate.category === source.category) score += 8
    if (/特色|本地|文化|历史|人文/.test(input)) {
      if (['history', 'museum', 'food_street', 'ancient_town'].includes(candidate.category)) {
        score += 18
      }
    }
    if (profile.walking === 'low') score += 3
    if (candidate.price.amount === 0) score += 2
    return score
  }
  const eligible = changshaAttractions.filter((candidate) => {
    if (candidate.id === source.id || usedIds.has(candidate.id)) return false
    return !(avoidsClimbing && getAttractionPlanningProfile(candidate).climbing)
  })
  const sameArea = eligible.filter(
    (candidate) => getAttractionPlanningProfile(candidate).area === sourceProfile.area,
  )
  const candidates = sameArea.length > 0 ? sameArea : eligible
  return [...candidates].sort(
    (left, right) => scoreCandidate(right) - scoreCandidate(left) || left.id.localeCompare(right.id),
  )[0]
}

export function applyDemoTripPlanModification(
  current: TripPlan,
  input: string,
): TripPlanModificationResult {
  const targetDay = extractTargetDay(input)
  const mentionedAttractions = extractMentionedAttractions(input)
  const removedAttractions = extractRemovedAttractions(input)
  const replacementRequest = extractReplacementRequest(input)
  const isReplacementIntent = /换|更换|替换|改成|改为/.test(input)
  const requestedPace: TravelPace | undefined = /轻松|少走路|减少步行|不要太赶/.test(input)
    ? 'relaxed'
    : /紧凑|充实|多安排/.test(input)
      ? 'intensive'
      : undefined
  let changed = false
  let description = '已根据你的要求更新行程，并同步重新计算预算。'
  let feedback: string | undefined
  let notice: TripPlanModificationResult['notice'] = {
    title: '行程已更新',
    after: '已按你的要求调整行程安排',
    impact: '行程与预算已同步更新',
  }
  let itinerary = current.itinerary.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({ ...activity })),
  }))

  if (replacementRequest.from.length > 0 && replacementRequest.to.length > 0) {
    const sourceIds = new Set(replacementRequest.from.map((attraction) => attraction.id))
    itinerary = itinerary.map((day) => {
      if (targetDay && day.day !== targetDay) return day
      const firstTargetIndex = day.activities.findIndex(
        (activity) => activity.attractionId && sourceIds.has(activity.attractionId),
      )
      if (firstTargetIndex < 0) return day
      const retainedActivities = day.activities.filter(
        (activity) => !activity.attractionId || !sourceIds.has(activity.attractionId),
      )
      const replacements = replacementRequest.to.map((attraction, index) =>
        activityFromAttraction(attraction, day.day, firstTargetIndex + index),
      )
      retainedActivities.splice(firstTargetIndex, 0, ...replacements)
      const updatedDay = updateDayRoute(day, retainedActivities, requestedPace ?? day.intensity)
      changed = true
      const oldNames = replacementRequest.from.map((attraction) => attraction.name).join('、')
      const newNames = replacementRequest.to.map((attraction) => attraction.name).join('、')
      description = `已把第 ${day.day} 天的${oldNames}替换为${newNames}，行程与预算已同步更新。`
      notice = {
        title: `Day ${day.day} 已更新`,
        before: `原安排：${attractionNames(day.activities).join('、')}`,
        after: `新安排：${attractionNames(updatedDay.activities).join('、')}`,
        impact: '已按指定景点完成替换，预算同步更新',
        targetDay: day.day,
      }
      return updatedDay
    })
    if (!changed) {
      const sourceNames = replacementRequest.from.map((attraction) => attraction.name).join('、')
      feedback = targetDay
        ? `当前 Day ${targetDay} 中没有找到${sourceNames}，请确认景点名称或目标日期。`
        : `当前行程中没有找到${sourceNames}，请确认景点名称。`
    }
  } else if (isReplacementIntent && mentionedAttractions.length > 0) {
    let locatedSource: Attraction | undefined
    itinerary = itinerary.map((day) => {
      if (targetDay && day.day !== targetDay) return day
      const targetIndex = day.activities.findIndex((activity) =>
        mentionedAttractions.some((attraction) => attraction.id === activity.attractionId),
      )
      if (targetIndex < 0) return day
      const source = mentionedAttractions.find(
        (attraction) => attraction.id === day.activities[targetIndex].attractionId,
      )
      if (!source) return day
      locatedSource = source
      const replacement = chooseAutomaticReplacement(current, day, source, input)
      if (!replacement) return day
      const activities = [...day.activities]
      activities[targetIndex] = {
        ...activityFromAttraction(replacement, day.day, targetIndex),
        time: activities[targetIndex].time,
      }
      const updatedDay = updateDayRoute(day, activities, requestedPace ?? day.intensity)
      changed = true
      description = `已自动定位到第 ${day.day} 天，并将${source.name}替换为${replacement.name}，行程与预算已同步更新。`
      notice = {
        title: `Day ${day.day} 已更新`,
        before: `原安排：${attractionNames(day.activities).join('、')}`,
        after: `新安排：${attractionNames(updatedDay.activities).join('、')}`,
        impact: '已自动定位原景点并优先选择同片区替代项，预算同步更新',
        targetDay: day.day,
      }
      return updatedDay
    })
    if (!changed) {
      const sourceNames = mentionedAttractions.map((attraction) => attraction.name).join('、')
      feedback = locatedSource
        ? `已定位到${locatedSource.name}，但当前没有符合当天约束且未重复的替代景点。`
        : targetDay
          ? `当前 Day ${targetDay} 中没有找到${sourceNames}，请确认景点名称或目标日期。`
          : `当前行程中没有找到${sourceNames}。你可以直接说“把某天的其他景点换掉”。`
    }
  } else if (
    targetDay &&
    (mentionedAttractions.length > 0 || requestedPace || /不要爬山|不爬山/.test(input))
  ) {
    itinerary = itinerary.map((day) => {
      if (day.day !== targetDay) return day
      const beforeNames = attractionNames(day.activities)
      const avoidsClimbing = /不要爬山|不爬山/.test(input)
      const hadClimbing = day.activities.some(isClimbingActivity)
      const isRemoval = removedAttractions.length > 0 || avoidsClimbing
      const isDayReplacement = /改成|改为|调整为|换成|换为|只安排|仅安排|只去|仅去/.test(input)
      const removedIds = new Set(removedAttractions.map((attraction) => attraction.id))
      const requestedAttractions = mentionedAttractions.filter(
        (attraction) => !removedIds.has(attraction.id),
      )
      const requestedIds = new Set(requestedAttractions.map((attraction) => attraction.id))
      let activities: TimelineItem[]

      if (isRemoval) {
        const retainedActivities = day.activities.filter(
          (activity) =>
            (!activity.attractionId || !removedIds.has(activity.attractionId)) &&
            !(avoidsClimbing && isClimbingActivity(activity)),
        )
        const requestedActivities = requestedAttractions.map((attraction, index) =>
          activityFromAttraction(attraction, day.day, index),
        )
        activities = [
          ...requestedActivities,
          ...retainedActivities.filter(
            (activity) => !activity.attractionId || !requestedIds.has(activity.attractionId),
          ),
        ]
      } else {
        const requestedActivities = requestedAttractions.map((attraction, index) =>
          activityFromAttraction(attraction, day.day, index),
        )
        activities = isDayReplacement
          ? [
              ...requestedActivities,
              ...day.activities.filter((activity) => !activity.attractionId),
            ]
          : [
              ...requestedActivities,
              ...day.activities.filter(
                (activity) => !activity.attractionId || !requestedIds.has(activity.attractionId),
              ),
            ]
      }

      if (requestedPace === 'relaxed') activities = limitMainActivities(activities, 3)
      const routedDay = updateDayRoute(day, activities, requestedPace ?? day.intensity)
      const updatedDay = avoidsClimbing
        ? {
            ...routedDay,
            constraints: [...new Set([...(day.constraints ?? []), '不安排爬山'])],
          }
        : routedDay
      if (sameDayPlan(day, updatedDay)) return day
      changed = true
      notice = {
        title: `Day ${day.day} 已更新`,
        before: `原安排：${beforeNames.join('、')}`,
        after: `新安排：${attractionNames(updatedDay.activities).join('、')}`,
        impact: isRemoval
          ? `${
              avoidsClimbing
                ? hadClimbing
                  ? '已移除爬山项目并锁定当天约束'
                  : '已锁定当天不安排爬山'
                : '已移除用户指定景点'
            }，预算同步更新`
          : requestedPace === 'relaxed'
            ? '已采用用户指定景点并调整为轻松节奏，预算同步更新'
            : '已采用用户指定景点，预算同步更新',
        targetDay: day.day,
      }
      const requestedNames = requestedAttractions.map((attraction) => attraction.name).join('、')
      const removedNames = removedAttractions.map((attraction) => attraction.name).join('、')
      const actionDescription = isRemoval
        ? [
            requestedNames ? `安排${requestedNames}` : '',
            avoidsClimbing && !hadClimbing
              ? '设置当天不爬山约束'
              : `移除${removedNames || '不适合的爬山项目'}`,
          ]
            .filter(Boolean)
            .join('，')
        : requestedNames
          ? `安排${requestedNames}`
          : '调整当天节奏'
      description = `已按你的要求更新第 ${day.day} 天：${actionDescription}${
        requestedPace === 'relaxed' ? '，并调整为轻松节奏' : ''
      }。预算已同步更新。`
      return updatedDay
    })
  } else if (/不要|删除|移除|去掉|取消/.test(input) && mentionedAttractions.length > 0) {
    const attractionsToRemove = removedAttractions.length > 0
      ? removedAttractions
      : mentionedAttractions
    const mentionedIds = new Set(attractionsToRemove.map((attraction) => attraction.id))
    itinerary = itinerary.map((day) => {
      const activities = day.activities.filter(
        (activity) => !activity.attractionId || !mentionedIds.has(activity.attractionId),
      )
      if (activities.length === day.activities.length) return day
      const updatedDay = updateDayRoute(day, activities, day.intensity)
      changed = true
      notice = {
        title: `Day ${day.day} 已更新`,
        before: `原安排：${attractionNames(day.activities).join('、')}`,
        after: `新安排：${attractionNames(updatedDay.activities).join('、') || '当日自由活动'}`,
        impact: '已移除指定景点，门票预算同步更新',
        targetDay: day.day,
      }
      return updatedDay
    })
    description = `已移除${attractionsToRemove.map((attraction) => attraction.name).join('、')}，并同步更新预算。`
  }

  return {
    plan: changed
      ? {
          ...current,
          pace: requestedPace && !targetDay ? requestedPace : current.pace,
          itinerary,
        }
      : current,
    changed,
    description,
    feedback,
    notice,
  }
}

export function getTripPlanAttractionIds(plan: TripPlan): string[] {
  return plan.itinerary.flatMap((day) =>
    day.activities.flatMap((activity) => (activity.attractionId ? [activity.attractionId] : [])),
  )
}
