import { AlertTriangle, CheckCircle2, CircleDollarSign, Sparkles } from 'lucide-react'
import type { BudgetSummary } from '../../types/pricing'

interface BudgetSummaryPanelProps {
  summary: BudgetSummary
}

function money(value: number): string {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
}

export function BudgetSummaryPanel({ summary }: BudgetSummaryPanelProps) {
  const rows = [
    ['城际交通', summary.intercityTransport],
    ['酒店住宿', summary.hotel],
    ['景点门票', summary.attractions],
    ['餐饮', summary.food],
    ['市内交通', summary.localTransport],
  ] as const
  const overBudget = summary.isOverBudget === true

  return (
    <section className="border-t border-[#EEF0F3]" aria-label="预算总览">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1677FF]">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EAF3FF]">
              <CircleDollarSign size={12} />
            </span>
            行程预算
          </div>
          <span className="rounded-full bg-[#FFF7E8] px-2 py-1 text-[9px] font-medium text-[#B76B00]">
            Mock / 预计参考
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-[11px]">
              <span className="text-[#6E7883]">{label}</span>
              <span className="font-semibold text-[#20242A]">¥{money(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-y border-[#EEF0F3] bg-[#F7FAFF] px-4 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] text-[#8A949E]">当前行程预计总费用</p>
            <p className="mt-0.5 text-[20px] font-bold tracking-[-0.02em] text-[#1677FF]">
              ¥{money(summary.total)}
            </p>
          </div>
          <p className="pb-1 text-[10px] text-[#6E7883]">人均 ¥{money(summary.perPerson)}</p>
        </div>

        {summary.userBudget !== undefined && summary.budgetDifference !== undefined && (
          <div
            className={`mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2.5 ${
              overBudget ? 'bg-[#FFF1F0] text-[#C53B32]' : 'bg-[#EAF8F2] text-[#248A60]'
            }`}
          >
            {overBudget ? (
              <AlertTriangle className="mt-0.5 shrink-0" size={14} />
            ) : (
              <CheckCircle2 className="mt-0.5 shrink-0" size={14} />
            )}
            <div className="text-[10px] leading-4">
              <p className="font-semibold">用户预算 ¥{money(summary.userBudget)}</p>
              <p>
                {overBudget
                  ? `预计超出 ¥${money(summary.budgetDifference)}`
                  : `预计剩余 ¥${money(Math.abs(summary.budgetDifference))}`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2.5 px-4 py-3">
        <div>
          <p className="flex items-center gap-1 text-[9px] font-semibold text-[#6E7883]">
            <Sparkles size={10} /> 根据当前行程估算
          </p>
          <p className="mt-1 text-[9px] leading-4 text-[#8A949E]">
            {summary.assumptions.hotelLabel}；{summary.assumptions.intercityLabel}；
            {summary.assumptions.foodLabel}；{summary.assumptions.localTransportLabel}。
          </p>
          <p className="mt-1 text-[9px] leading-4 text-[#8A949E]">
            已按行程景点计算：{summary.assumptions.attractionNames.join('、')}
          </p>
        </div>

        {overBudget && summary.suggestions.length > 0 && (
          <div className="rounded-xl bg-[#FAFBFC] px-3 py-2.5">
            <p className="text-[9px] font-semibold text-[#4B5560]">预算优化建议</p>
            <ul className="mt-1 space-y-1 text-[9px] leading-4 text-[#6E7883]">
              {summary.suggestions.slice(0, 3).map((suggestion) => (
                <li key={suggestion}>· {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="border-t border-[#EEF0F3] pt-2.5 text-[8px] leading-3.5 text-[#A0A7B0]">
          当前价格为 AI 行程规划 Demo 使用的参考价格，仅用于预算估算，不代表景区、酒店、交通平台的实时售价，实际价格请以预订页面为准。
        </p>
      </div>
    </section>
  )
}
