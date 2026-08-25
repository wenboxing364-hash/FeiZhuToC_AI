export interface AttractionImageAsset {
  attractionId: string
  imageSrc: string
  alt: string
  sourceName: string
  sourceUrl: string
}

// These images are cached from public official attraction or government pages
// for the V0.2 Demo. A public page is not, by itself, a redistribution licence.
// Before production release, replace them with an authorised Fliggy/internal
// image feed or confirm the individual commercial usage rights.
export const changshaAttractionImages: AttractionImageAsset[] = [
  {
    attractionId: 'changsha-wuyi-square',
    imageSrc: '/images/attractions/changsha-wuyi-square.jpg',
    alt: '长沙五一广场城市夜景',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/news/mtjj/201912/t20191227_11018568.html',
  },
  {
    attractionId: 'changsha-huangxing-road',
    imageSrc: '/images/attractions/changsha-huangxing-road.png',
    alt: '长沙黄兴路步行街',
    sourceName: '湖南省住房和城乡建设厅',
    sourceUrl: 'https://zjt.hunan.gov.cn/zjt/gzdt/dfdt/zjfc1/202110/t20211027_33961988.html',
  },
  {
    attractionId: 'changsha-taiping-street',
    imageSrc: '/images/attractions/changsha-taiping-street.jpg',
    alt: '长沙太平老街',
    sourceName: '湖南省科学技术厅',
    sourceUrl: 'https://kjt.hunan.gov.cn/kjt/xxgk/gzdt/tpxw_2/202304/t20230407_29307426.html',
  },
  {
    attractionId: 'changsha-pozi-street',
    imageSrc: '/images/attractions/changsha-pozi-street.jpg',
    alt: '长沙坡子街游览人群',
    sourceName: '湖南省人民政府门户网站',
    sourceUrl: 'https://www.hunan.gov.cn/hnszf/hnyw/jdt2/202510/t20251006_33820051.html',
  },
  {
    attractionId: 'changsha-chaozong-street',
    imageSrc: '/images/attractions/changsha-chaozong-street.jpg',
    alt: '长沙潮宗街历史文化街区入口',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/news/mtjj/202106/t20210622_19718642.html',
  },
  {
    attractionId: 'changsha-ifs',
    imageSrc: '/images/attractions/changsha-ifs.jpg',
    alt: '长沙 IFS 国金中心城市天际线',
    sourceName: '长沙 IFS 官方网站',
    sourceUrl: 'https://www.csifs.cn/',
  },
  {
    attractionId: 'changsha-dufu-pavilion',
    imageSrc: '/images/attractions/changsha-dufu-pavilion.jpg',
    alt: '长沙杜甫江阁',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/sxxw/201909/t20190910_5475088.html',
  },
  {
    attractionId: 'changsha-tianxin-pavilion',
    imageSrc: '/images/attractions/changsha-tianxin-pavilion.jpg',
    alt: '长沙天心阁夜景',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-baisha-well',
    imageSrc: '/images/attractions/changsha-baisha-well.jpg',
    alt: '长沙白沙古井入口',
    sourceName: '中央纪委国家监委网站',
    sourceUrl: 'https://m.ccdi.gov.cn/content/92/e6/9941.html',
  },
  {
    attractionId: 'changsha-bamboo-slips-museum',
    imageSrc: '/images/attractions/changsha-bamboo-slips-museum.jpg',
    alt: '长沙简牍博物馆馆藏展陈',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/sxxw/201909/t20190910_5475088.html',
  },
  {
    attractionId: 'changsha-museum',
    imageSrc: '/images/attractions/changsha-museum.png',
    alt: '长沙博物馆建筑夜景',
    sourceName: '长沙博物馆官方网站',
    sourceUrl: 'https://www.csm.hn.cn/',
  },
  {
    attractionId: 'hunan-museum',
    imageSrc: '/images/attractions/hunan-museum.jpg',
    alt: '湖南博物院建筑外观',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'hunan-martyrs-park',
    imageSrc: '/images/attractions/hunan-martyrs-park.jpg',
    alt: '湖南烈士公园湖景',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/mtjj/202304/t20230421_29319810.html',
  },
  {
    attractionId: 'changsha-yuelu-mountain',
    imageSrc: '/images/attractions/changsha-yuelu-mountain.jpg',
    alt: '长沙岳麓山城市山景',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-yuelu-academy',
    imageSrc: '/images/attractions/changsha-yuelu-academy.jpg',
    alt: '长沙岳麓书院入口',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-aiwan-pavilion',
    imageSrc: '/images/attractions/changsha-aiwan-pavilion.png',
    alt: '岳麓山爱晚亭秋景',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/hneng/Tourism/TourHunan/Changsha_55545/TouristAttractions/202606/t20260611_33999264.html',
  },
  {
    attractionId: 'changsha-orange-isle',
    imageSrc: '/images/attractions/changsha-orange-isle.png',
    alt: '长沙橘子洲航拍景观',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-houhu-art-zone',
    imageSrc: '/images/attractions/changsha-houhu-art-zone.jpg',
    alt: '长沙后湖国际艺术区湖景',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/sxxw/201812/t20181211_5377468.html',
  },
  {
    attractionId: 'changsha-li-zijian-art-museum',
    imageSrc: '/images/attractions/changsha-li-zijian-art-museum.jpg',
    alt: '长沙李自健美术馆建筑外观',
    sourceName: '湖南湘江新区管理委员会',
    sourceUrl: 'https://xjxq.hunan.gov.cn/hnxjxq/sytpxw/202003/t20200304_11640662.html',
  },
  {
    attractionId: 'changsha-xie-zilong-photo-museum',
    imageSrc: '/images/attractions/changsha-xie-zilong-photo-museum.jpg',
    alt: '长沙谢子龙影像艺术馆建筑外观',
    sourceName: '湖南湘江新区管理委员会',
    sourceUrl: 'https://xjxq.hunan.gov.cn/hnxjxq/sytpxw/202003/t20200318_11814798.html',
  },
  {
    attractionId: 'changsha-yanghu-wetland',
    imageSrc: '/images/attractions/changsha-yanghu-wetland.jpg',
    alt: '长沙洋湖国家湿地公园白鹭塔',
    sourceName: '湖南湘江新区管理委员会',
    sourceUrl: 'https://xjxq.hunan.gov.cn/hnxjxq/sytpxw/202005/t20200526_12173872.html',
  },
  {
    attractionId: 'changsha-meixihu-arts-center',
    imageSrc: '/images/attractions/changsha-meixihu-arts-center.jpg',
    alt: '长沙梅溪湖国际文化艺术中心室内空间',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/news/mtjj/201911/t20191111_10516927.html',
  },
  {
    attractionId: 'changsha-ecological-zoo',
    imageSrc: '/images/attractions/changsha-ecological-zoo.png',
    alt: '长沙生态动物园入口景观',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/hneng/Tourism/TourHunan/Changsha_55545/TouristAttractions/202303/t20230309_29268464.html',
  },
  {
    attractionId: 'changsha-window-of-the-world',
    imageSrc: '/images/attractions/changsha-window-of-the-world.jpg',
    alt: '长沙世界之窗游园活动',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://enghunan.gov.cn/hneng/News/Localnews/202402/t20240215_32860810.html',
  },
  {
    attractionId: 'changsha-underwater-world',
    imageSrc: '/images/attractions/changsha-underwater-world.jpg',
    alt: '长沙海底世界官方主题视觉',
    sourceName: '长沙海底世界官方网站',
    sourceUrl: 'https://www.cshdsj.com.cn/',
  },
  {
    attractionId: 'changsha-fantawild',
    imageSrc: '/images/attractions/changsha-fantawild.jpg',
    alt: '长沙方特东方神画园区全景',
    sourceName: '华强方特官方网站',
    sourceUrl: 'https://www.fantawild.com/newslist/show/7681.htm',
  },
  {
    attractionId: 'changsha-huayi-movie-town',
    imageSrc: '/images/attractions/changsha-huayi-movie-town.jpg',
    alt: '华谊兄弟长沙电影小镇夜景',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/news/mtjj/201908/t20190807_5410840.html',
  },
  {
    attractionId: 'changsha-happy-snow-world',
    imageSrc: '/images/attractions/changsha-happy-snow-world.jpg',
    alt: '湘江欢乐城欢乐雪域室内雪景',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/mtjj/201912/t20191204_10788146.html',
  },
  {
    attractionId: 'changsha-happy-water-park',
    imageSrc: '/images/attractions/changsha-happy-water-park.jpg',
    alt: '湘江欢乐城欢乐水寨园区全景',
    sourceName: 'FORREC 项目官网',
    sourceUrl: 'https://forrec.com/cn/projects/xiangjiang-joy-city-happy-water-village/',
  },
  {
    attractionId: 'changsha-tongguanyao-town',
    imageSrc: '/images/attractions/changsha-tongguanyao-town.jpg',
    alt: '长沙铜官窑古镇航拍景观',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-jinggang-town',
    imageSrc: '/images/attractions/changsha-jinggang-town.png',
    alt: '长沙靖港古镇滨水全景',
    sourceName: '靖港古镇景区官方网站',
    sourceUrl: 'https://www.csjinggang.com/',
  },
  {
    attractionId: 'changsha-huaminglou',
    imageSrc: '/images/attractions/changsha-huaminglou.png',
    alt: '长沙花明楼景区湖景',
    sourceName: '湖南省人民政府台湾事务办公室',
    sourceUrl: 'https://www.hnstb.gov.cn/plus/view-544-1.html',
  },
  {
    attractionId: 'changsha-liushaoqi-hometown',
    imageSrc: '/images/attractions/changsha-liushaoqi-hometown.png',
    alt: '刘少奇故居建筑外观',
    sourceName: '湖南省人民政府台湾事务办公室',
    sourceUrl: 'https://www.hnstb.gov.cn/plus/view-544-1.html',
  },
  {
    attractionId: 'changsha-tanhe-ancient-city',
    imageSrc: '/images/attractions/changsha-tanhe-ancient-city.jpg',
    alt: '长沙炭河古城标志景观',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-daweishan-forest-park',
    imageSrc: '/images/attractions/changsha-daweishan-forest-park.jpg',
    alt: '大围山国家森林公园山景',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/Tourism/TourHunan/Changsha_55545/TouristAttractions/index.html',
  },
  {
    attractionId: 'changsha-heimifeng-forest-park',
    imageSrc: '/images/attractions/changsha-heimifeng-forest-park.jpg',
    alt: '黑麋峰国家森林公园山顶湖景',
    sourceName: '湖南省人民政府英文门户网站',
    sourceUrl: 'https://www.enghunan.gov.cn/hneng/Services/Live/Community/ParksForests2018/201809/t20180907_5090194.html',
  },
  {
    attractionId: 'changsha-shiyan-lake',
    imageSrc: '/images/attractions/changsha-shiyan-lake.jpg',
    alt: '长沙石燕湖旅游区航拍景观',
    sourceName: '湖南省人民政府门户网站',
    sourceUrl: 'https://www.hunan.gov.cn/hnszf/hnyw/zwdt/202308/t20230815_29459019.html',
  },
  {
    attractionId: 'changsha-garden-ecological-park',
    imageSrc: '/images/attractions/changsha-garden-ecological-park.jpg',
    alt: '长沙园林生态园入口花境',
    sourceName: '湖南省文化和旅游厅',
    sourceUrl: 'https://whhlyt.hunan.gov.cn/whhlyt/news/mtjj/202003/t20200303_11345622.html',
  },
]

const imageByAttractionId = new Map(
  changshaAttractionImages.map((asset) => [asset.attractionId, asset]),
)

export function findAttractionImage(attractionId: string): AttractionImageAsset | undefined {
  return imageByAttractionId.get(attractionId)
}
