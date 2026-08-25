import type { Attraction } from '../../types/pricing'

export type DayPeriod = 'morning' | 'afternoon' | 'evening'
export type WalkingIntensity = 'low' | 'medium' | 'high'

export interface AttractionPlanningProfile {
  area: 'city-center' | 'north-east' | 'yuelu-west' | 'south-family' | 'west-daytrip' | 'outskirts'
  areaLabel: string
  periods: DayPeriod[]
  walking: WalkingIntensity
  climbing?: boolean
  childFriendly?: boolean
  seniorFriendly?: boolean
}

function profile(
  area: AttractionPlanningProfile['area'],
  areaLabel: string,
  periods: DayPeriod[],
  walking: WalkingIntensity,
  options: Pick<
    AttractionPlanningProfile,
    'climbing' | 'childFriendly' | 'seniorFriendly'
  > = {},
): AttractionPlanningProfile {
  return { area, areaLabel, periods, walking, ...options }
}

const CENTER = '五一广场与长沙老城'
const NORTH_EAST = '开福与城市东北片区'
const YUELU = '湘江西岸文化艺术区'
const SOUTH = '长沙南部休闲娱乐区'
const WEST = '长沙西部与古镇方向'
const OUTSKIRTS = '长沙近郊自然线'

export const attractionPlanningProfiles: Record<string, AttractionPlanningProfile> = {
  'changsha-wuyi-square': profile('city-center', CENTER, ['afternoon', 'evening'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-huangxing-road': profile('city-center', CENTER, ['afternoon', 'evening'], 'medium', {
    childFriendly: true,
  }),
  'changsha-taiping-street': profile('city-center', CENTER, ['afternoon', 'evening'], 'medium', {
    seniorFriendly: true,
  }),
  'changsha-pozi-street': profile('city-center', CENTER, ['afternoon', 'evening'], 'medium', {
    childFriendly: true,
  }),
  'changsha-chaozong-street': profile('city-center', CENTER, ['morning', 'afternoon'], 'medium', {
    seniorFriendly: true,
  }),
  'changsha-ifs': profile('city-center', CENTER, ['afternoon', 'evening'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-dufu-pavilion': profile('city-center', CENTER, ['afternoon', 'evening'], 'low', {
    seniorFriendly: true,
  }),
  'changsha-tianxin-pavilion': profile('city-center', CENTER, ['morning', 'afternoon'], 'medium', {
    seniorFriendly: true,
  }),
  'changsha-baisha-well': profile('city-center', CENTER, ['morning', 'afternoon'], 'low', {
    seniorFriendly: true,
  }),
  'changsha-bamboo-slips-museum': profile('city-center', CENTER, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),

  'changsha-museum': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'hunan-museum': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'hunan-martyrs-park': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-window-of-the-world': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'high', {
    childFriendly: true,
  }),
  'changsha-underwater-world': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-garden-ecological-park': profile('north-east', NORTH_EAST, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),

  'changsha-yuelu-mountain': profile('yuelu-west', YUELU, ['morning'], 'high', {
    climbing: true,
  }),
  'changsha-yuelu-academy': profile('yuelu-west', YUELU, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-aiwan-pavilion': profile('yuelu-west', YUELU, ['morning', 'afternoon'], 'high', {
    climbing: true,
  }),
  'changsha-orange-isle': profile('yuelu-west', YUELU, ['afternoon', 'evening'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-houhu-art-zone': profile('yuelu-west', YUELU, ['afternoon', 'evening'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-li-zijian-art-museum': profile('yuelu-west', YUELU, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-xie-zilong-photo-museum': profile('yuelu-west', YUELU, ['morning', 'afternoon'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-yanghu-wetland': profile('yuelu-west', YUELU, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-meixihu-arts-center': profile('yuelu-west', YUELU, ['afternoon', 'evening'], 'low', {
    childFriendly: true,
    seniorFriendly: true,
  }),

  'changsha-ecological-zoo': profile('south-family', SOUTH, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
  }),
  'changsha-huayi-movie-town': profile('south-family', SOUTH, ['afternoon', 'evening'], 'medium', {
    childFriendly: true,
  }),
  'changsha-happy-snow-world': profile('south-family', SOUTH, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
  }),
  'changsha-happy-water-park': profile('south-family', SOUTH, ['morning', 'afternoon'], 'high', {
    childFriendly: true,
  }),
  'changsha-shiyan-lake': profile('south-family', SOUTH, ['morning', 'afternoon'], 'high', {
    childFriendly: true,
  }),

  'changsha-tongguanyao-town': profile('west-daytrip', WEST, ['morning', 'afternoon', 'evening'], 'medium', {
    childFriendly: true,
  }),
  'changsha-jinggang-town': profile('west-daytrip', WEST, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
    seniorFriendly: true,
  }),
  'changsha-fantawild': profile('west-daytrip', WEST, ['morning', 'afternoon'], 'high', {
    childFriendly: true,
  }),
  'changsha-huaminglou': profile('west-daytrip', WEST, ['morning', 'afternoon'], 'medium', {
    seniorFriendly: true,
  }),
  'changsha-liushaoqi-hometown': profile('west-daytrip', WEST, ['morning', 'afternoon'], 'medium', {
    seniorFriendly: true,
  }),
  'changsha-tanhe-ancient-city': profile('west-daytrip', WEST, ['morning', 'afternoon'], 'medium', {
    childFriendly: true,
  }),

  'changsha-daweishan-forest-park': profile('outskirts', OUTSKIRTS, ['morning', 'afternoon'], 'high', {
    climbing: true,
  }),
  'changsha-heimifeng-forest-park': profile('outskirts', OUTSKIRTS, ['morning', 'afternoon'], 'high', {
    climbing: true,
  }),
}

export function getAttractionPlanningProfile(
  attraction: Attraction,
): AttractionPlanningProfile {
  return (
    attractionPlanningProfiles[attraction.id] ??
    profile('city-center', CENTER, ['morning', 'afternoon'], 'medium')
  )
}
