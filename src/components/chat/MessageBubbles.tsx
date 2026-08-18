import { AssistantAvatar } from '../AssistantAvatar'

interface MessageProps {
  content: string
}
export function AssistantMessage({ content }: MessageProps) {
  return (
    <div className="message-enter flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="max-w-[calc(100%-42px)] whitespace-pre-line rounded-[12px] rounded-tl-[4px] border border-[#E8EBEF] bg-white px-3.5 py-3 text-[14px] leading-[1.65] text-[#20242A] shadow-[0_2px_8px_rgba(31,41,55,0.04)]">
        {content}
      </div>
    </div>
  )
}

export function UserMessage({ content }: MessageProps) {
  return (
    <div className="message-enter flex justify-end pl-12">
      <div className="max-w-[90%] whitespace-pre-line rounded-[12px] rounded-tr-[4px] bg-[#EAF5FF] px-3.5 py-3 text-[14px] leading-[1.65] text-[#205786]">
        {content}
      </div>
    </div>
  )
}

export function LoadingMessage({ content }: MessageProps) {
  return (
    <div className="message-enter flex items-start gap-2.5" role="status" aria-live="polite">
      <AssistantAvatar />
      <div className="flex items-center gap-2 rounded-[12px] rounded-tl-[4px] border border-[#E8EBEF] bg-white px-3.5 py-3 text-[13px] text-[#8A949E] shadow-[0_2px_8px_rgba(31,41,55,0.04)]">
        <span>{content}</span>
        <span className="loading-dots" aria-label="加载中">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  )
}
