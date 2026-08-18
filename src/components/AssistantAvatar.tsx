import { Sparkles } from 'lucide-react'

export function AssistantAvatar() {
  return (
    <div
      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#1677FF]"
      aria-hidden="true"
    >
      <Sparkles size={17} strokeWidth={2.2} />
    </div>
  )
}
