import type { Attraction, AttractionCategory, BudgetLevel } from '../../types/pricing'
import { findAttractionImage } from './attractionImages'

function budgetLevelFor(amount: number): BudgetLevel {
  if (amount === 0) return 'free'
  if (amount <= 50) return 'low'
  if (amount <= 150) return 'medium'
  return 'high'
}

function attraction(
  id: string,
  name: string,
  category: AttractionCategory,
  amount: number,
  recommendedDuration = 2,
  bookingRequired = false,
): Attraction {
  const image = findAttractionImage(id)
  return {
    id,
    name,
    city: '长沙',
    category,
    price: { amount, currency: 'CNY', type: 'mock', source: 'V0.2.4 Demo 数据' },
    budgetLevel: budgetLevelFor(amount),
    recommendedDuration,
    bookingRequired,
    images: image ? { cover: image.imageSrc } : undefined,
  }
}

export const changshaAttractions: Attraction[] = [
  attraction('changsha-wuyi-square', '五一广场', 'landmark', 0, 1.5),
  attraction('changsha-huangxing-road', '黄兴路步行街', 'shopping', 0, 2),
  attraction('changsha-taiping-street', '太平老街', 'history', 0, 1.5),
  attraction('changsha-pozi-street', '坡子街', 'food_street', 0, 1.5),
  attraction('changsha-chaozong-street', '潮宗街', 'history', 0, 2),
  attraction('changsha-ifs', '长沙 IFS 国金中心', 'landmark', 0, 2),
  attraction('changsha-dufu-pavilion', '杜甫江阁', 'history', 11, 1.5),
  attraction('changsha-tianxin-pavilion', '天心阁', 'history', 32, 2),
  attraction('changsha-baisha-well', '白沙古井', 'history', 0, 1),
  attraction('changsha-bamboo-slips-museum', '长沙简牍博物馆', 'museum', 0, 2, true),
  attraction('changsha-museum', '长沙博物馆', 'museum', 0, 2.5, true),
  attraction('hunan-museum', '湖南博物院', 'museum', 0, 3, true),
  attraction('hunan-martyrs-park', '湖南烈士公园', 'nature', 0, 2),

  attraction('changsha-yuelu-mountain', '岳麓山', 'nature', 0, 3),
  attraction('changsha-yuelu-academy', '岳麓书院', 'history', 40, 2),
  attraction('changsha-aiwan-pavilion', '爱晚亭', 'history', 0, 1),
  attraction('changsha-orange-isle', '橘子洲', 'landmark', 0, 3),
  attraction('changsha-houhu-art-zone', '后湖国际艺术区', 'art', 0, 2),
  attraction('changsha-li-zijian-art-museum', '李自健美术馆', 'art', 0, 2, true),
  attraction('changsha-xie-zilong-photo-museum', '谢子龙影像艺术馆', 'art', 60, 2, true),
  attraction('changsha-yanghu-wetland', '洋湖国家湿地公园', 'nature', 0, 3),
  attraction('changsha-meixihu-arts-center', '梅溪湖国际文化艺术中心', 'landmark', 0, 2),

  attraction('changsha-ecological-zoo', '长沙生态动物园', 'family', 40, 4),
  attraction('changsha-window-of-the-world', '长沙世界之窗', 'theme_park', 200, 6),
  attraction('changsha-underwater-world', '长沙海底世界', 'family', 150, 4),
  attraction('changsha-fantawild', '长沙方特东方神画', 'theme_park', 280, 7),
  attraction('changsha-huayi-movie-town', '华谊兄弟（长沙）电影小镇', 'theme_park', 150, 5),
  attraction('changsha-happy-snow-world', '湘江欢乐城欢乐雪域', 'family', 218, 4),
  attraction('changsha-happy-water-park', '湘江欢乐城欢乐水寨', 'theme_park', 160, 5),
  attraction('changsha-tongguanyao-town', '长沙铜官窑古镇', 'ancient_town', 168, 5),

  attraction('changsha-jinggang-town', '靖港古镇', 'ancient_town', 0, 3),
  attraction('changsha-huaminglou', '花明楼景区', 'history', 0, 3),
  attraction('changsha-liushaoqi-hometown', '刘少奇故里景区', 'history', 0, 3),
  attraction('changsha-tanhe-ancient-city', '炭河古城', 'ancient_town', 60, 4),
  attraction('changsha-daweishan-forest-park', '大围山国家森林公园', 'nature', 68, 5),
  attraction('changsha-heimifeng-forest-park', '黑麋峰国家森林公园', 'nature', 27, 4),
  attraction('changsha-shiyan-lake', '石燕湖旅游区', 'nature', 160, 5),
  attraction('changsha-garden-ecological-park', '长沙园林生态园', 'nature', 15, 3),
]

export function findChangshaAttraction(idOrName: string): Attraction | undefined {
  const normalized = idOrName.replace(/\s+/g, '').replace('周边', '')
  return changshaAttractions.find(
    (item) =>
      item.id === idOrName ||
      item.name.replace(/\s+/g, '') === normalized ||
      (normalized === 'IFS国金中心' && item.id === 'changsha-ifs') ||
      (normalized === '烈士公园' && item.id === 'hunan-martyrs-park'),
  )
}
