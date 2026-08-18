import { ArrowUp, Plus } from 'lucide-react'
import { quickActions } from '../data/mockTrip'

interface ChatInputBarProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: () => void
  onQuickAction: (action: string) => void
  onAdd: () => void
}
export function ChatInputBar({
  value,
  disabled = false,
  onChange,
  onSend,
  onQuickAction,
  onAdd,
}: ChatInputBarProps) {
  const canSend = value.trim().length > 0 && !disabled

  return (
    <footer className="relative z-20 shrink-0 border-t border-[#E8EBEF] bg-white/95 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-2">
        {quickActions.map((action) => (
          <button
            key={action}
            type="button"
            className="shrink-0 rounded-full border border-[#E8EBEF] bg-white px-3 py-1.5 text-[11px] text-[#6E7883] transition hover:border-[#B8D6FF] hover:text-[#1677FF] active:scale-95"
            onClick={() => onQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="mx-3 flex h-11 items-center gap-2 rounded-[22px] border border-[#E3E7EC] bg-[#F7F8FA] p-1 shadow-[inset_0_1px_2px_rgba(31,41,55,0.02)] focus-within:border-[#A9CCFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1677FF]/10">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#4B5560] transition hover:bg-white active:scale-90"
          aria-label="添加内容"
          onClick={onAdd}
        >
          <Plus size={21} />
        </button>
        <input
          type="text"
          value={value}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#20242A] outline-none placeholder:text-[#A3ABB4] disabled:cursor-not-allowed"
          placeholder={disabled ? 'AI 正在思考...' : '告诉AI你的旅行需求...'}
          aria-label="告诉 AI 你的旅行需求"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && canSend) {
              event.preventDefault()
              onSend()
            }
          }}
        />
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9DEE5] text-white transition enabled:bg-[#1677FF] enabled:shadow-[0_4px_10px_rgba(22,119,255,0.25)] enabled:hover:bg-[#0868E8] enabled:active:scale-90"
          aria-label="发送"
          disabled={!canSend}
          onClick={onSend}
        >
          <ArrowUp size={19} strokeWidth={2.5} />
        </button>
      </div>
    </footer>
  )
}
