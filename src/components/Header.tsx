import { ChevronLeft, MoreHorizontal } from 'lucide-react'

interface HeaderProps {
  onAction: (message: string) => void
}
export function Header({ onAction }: HeaderProps) {
  return (
    <header className="relative z-20 flex h-[66px] shrink-0 items-center border-b border-[#E8EBEF]/80 bg-white px-3 pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        className="icon-button"
        aria-label="返回"
        onClick={() => onAction('当前已经是 Demo 首页')}
      >
        <ChevronLeft size={23} />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[46%] flex-col items-center">
        <h1 className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.01em] text-[#20242A]">
          AI 旅行助手
        </h1>
        <div className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-[#37B27C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#37B27C] shadow-[0_0_0_3px_rgba(55,178,124,0.12)]" />
          AI智能规划中
        </div>
      </div>

      <button
        type="button"
        className="icon-button ml-auto"
        aria-label="更多"
        onClick={() => onAction('更多功能即将开放')}
      >
        <MoreHorizontal size={22} />
      </button>
    </header>
  )
}
