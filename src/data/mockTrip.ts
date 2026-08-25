import type { TripPlan } from '../types/trip'

export const welcomeMessage =
  '你好，我是飞猪 AI 旅行助手。\n告诉我你想去哪里、玩几天，我可以帮你快速规划旅行。'

export const welcomeSuggestions = [
  '帮我规划长沙3日游',
  '周末适合去哪里？',
  '帮我规划一场亲子旅行',
]

export const preferenceOptions = ['美食', '历史文化', '自然风景', '轻松休闲']

export const quickActions = ['修改行程', '换一个景点', '控制预算', '安排更轻松']

export const mockTripPlan: TripPlan = {
  id: 'changsha-relaxed-3d2n',
  title: '长沙3天2晚轻松旅行',
  destinations: ['长沙'],
  days: 3,
  nights: 2,
  travelers: {
    adults: 2,
    children: 0,
    seniors: 0,
  },
  budget: {
    total: 4000,
    perPerson: 2000,
  },
  preferences: ['美食', '历史'],
  pace: 'relaxed',
  itinerary: [
    {
      day: 1,
      city: '长沙',
      title: '长沙老城与夜生活',
      theme: '老城漫游 · 地标打卡 · 夜市小吃',
      estimatedCost: 350,
      intensity: 'relaxed',
      activities: [
        {
          id: 'd1-wuyi-square',
          attractionId: 'changsha-wuyi-square',
          time: '10:00',
          place: '五一广场',
          description: '长沙核心商圈，适合作为第一站',
          activityType: 'attraction',
        },
        {
          id: 'd1-taiping-street',
          attractionId: 'changsha-taiping-street',
          time: '11:30',
          place: '太平老街',
          description: '体验长沙老城区和当地美食',
          activityType: 'attraction',
        },
        {
          id: 'd1-ifs',
          attractionId: 'changsha-ifs',
          time: '14:00',
          place: 'IFS国金中心',
          description: '长沙地标建筑和商业中心',
          activityType: 'attraction',
        },
        {
          id: 'd1-dufu-pavilion',
          attractionId: 'changsha-dufu-pavilion',
          time: '17:30',
          place: '杜甫江阁',
          description: '傍晚欣赏湘江风景',
          activityType: 'attraction',
        },
        {
          id: 'd1-huangxing-road',
          attractionId: 'changsha-huangxing-road',
          time: '19:00',
          place: '黄兴路步行街',
          description: '体验长沙夜生活和本地小吃',
          activityType: 'attraction',
        },
      ],
    },
    {
      day: 2,
      city: '长沙',
      title: '历史文化',
      theme: '岳麓山 · 湖南大学 · 橘子洲周边',
      estimatedCost: 260,
      transport: '地铁 + 短途步行',
      intensity: 'relaxed',
      activities: [
        {
          id: 'd2-yuelu-mountain',
          attractionId: 'changsha-yuelu-mountain',
          time: '09:30',
          place: '岳麓山',
          description: '乘观光车上山，轻松感受山林与古迹',
          activityType: 'attraction',
        },
        {
          id: 'd2-hunan-university',
          time: '13:30',
          place: '湖南大学',
          description: '漫步开放式校园，感受近现代建筑',
        },
        {
          id: 'd2-orange-isle',
          attractionId: 'changsha-orange-isle',
          time: '16:30',
          place: '橘子洲周边',
          description: '沿江慢游，在日落前结束当天行程',
          activityType: 'attraction',
        },
      ],
    },
    {
      day: 3,
      city: '长沙',
      title: '城市慢游',
      theme: '潮宗街 · 烈士公园 · 湖南米粉',
      estimatedCost: 220,
      intensity: 'relaxed',
      activities: [
        {
          id: 'd3-chaizong-street',
          attractionId: 'changsha-chaozong-street',
          time: '10:00',
          place: '潮宗街',
          description: '在历史街区的咖啡馆慢慢开启一天',
          activityType: 'attraction',
        },
        {
          id: 'd3-martyrs-park',
          attractionId: 'hunan-martyrs-park',
          time: '13:30',
          place: '烈士公园',
          description: '湖边散步，感受本地人的休闲生活',
          activityType: 'attraction',
        },
        {
          id: 'd3-rice-noodles',
          time: '17:00',
          place: '本地米粉店',
          description: '用一碗长沙米粉结束轻松旅程',
          activityType: 'meal',
        },
      ],
    },
  ],
}
