import { Bus, Hotel, Info, Plane, Ticket, Utensils } from 'lucide-react'

const priceRules = [
  {
    title: '酒店（房费计算）',
    icon: Hotel,
    color: 'text-[#1677FF] bg-[#EAF3FF]',
    content: (
      <>
        <p>默认一间房最多入住 2 人，房间数 = Math.ceil(人数 / 2)。</p>
        <div className="mt-2 grid grid-cols-4 overflow-hidden rounded-lg border border-[#E7EBF0] text-center text-[10px]">
          {['1人\n1间', '2人\n1间', '3-4人\n2间', '5-6人\n3间'].map((value) => (
            <span key={value} className="whitespace-pre-line border-r border-[#E7EBF0] py-1.5 last:border-none">
              {value}
            </span>
          ))}
        </div>
      </>
    ),
  },
  {
    title: '景点门票',
    icon: Ticket,
    color: 'text-[#F59E0B] bg-[#FFF6DD]',
    content: <p>成人按标准价格；老人（≥ 65岁）免费；儿童（≤ 12岁）半价，按实际人数计算。</p>,
  },
  {
    title: '餐饮（每人每天参考）',
    icon: Utensils,
    color: 'text-[#F97316] bg-[#FFF0E8]',
    content: (
      <div className="grid grid-cols-4 text-center text-[11px]">
        {[
          ['早餐', '¥15'],
          ['午餐', '¥50'],
          ['晚餐', '¥80'],
          ['小吃', '¥40'],
        ].map(([label, price]) => (
          <span key={label}>
            <span className="block text-[#66717D]">{label}</span>
            <strong className="font-semibold text-[#20242A]">{price}</strong>
          </span>
        ))}
      </div>
    ),
  },
  {
    title: '市内交通',
    icon: Bus,
    color: 'text-[#20A76B] bg-[#E8F8F0]',
    content: <p>根据当天 Mock 交通方式累计费用，包括公交、地铁和出租车。</p>,
  },
  {
    title: '机票 / 火车票',
    icon: Plane,
    color: 'text-[#1677FF] bg-[#EAF3FF]',
    content: <p>使用固定 Mock 价格，暂时不接真实 OTA、12306 或航司接口。</p>,
  },
]

export function PriceRulesSheet() {
  return (
    <div className="settings-scroll min-h-0 flex-1 overflow-y-auto bg-[#F5F7FA] px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
      <div className="overflow-hidden rounded-2xl bg-white px-4 shadow-[0_1px_3px_rgba(31,41,55,0.03)]">
        {priceRules.map((rule) => {
          const Icon = rule.icon
          return (
            <section key={rule.title} className="flex gap-3 border-b border-[#EEF0F3] py-3.5 last:border-none">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${rule.color}`}>
                <Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold text-[#20242A]">{rule.title}</h3>
                <div className="mt-1 text-[11px] leading-[1.65] text-[#66717D]">{rule.content}</div>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-3 flex gap-2 rounded-xl border border-[#F5D77A] bg-[#FFF6D9] px-3 py-2.5 text-[10px] leading-4 text-[#7A5D12]">
        <Info size={15} className="mt-0.5 shrink-0" />
        <strong className="font-medium">
          当前价格为 Demo 模拟数据，仅用于旅行预算展示，不代表真实实时价格。
        </strong>
      </div>
    </div>
  )
}
