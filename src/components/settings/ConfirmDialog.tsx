import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div
      className="settings-backdrop-enter absolute inset-0 z-[70] flex items-end bg-[#111827]/45"
      role="presentation"
      onClick={(event) => {
        if (event.currentTarget === event.target) onCancel()
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="confirm-panel-enter w-full rounded-t-[22px] bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(17,24,39,0.18)]"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[#D8DDE4]" />
        <h2 id="confirm-dialog-title" className="mt-6 text-center text-[17px] font-bold text-[#20242A]">
          {title}
        </h2>
        <div className="mx-auto mt-3 max-w-[330px] text-center text-[12px] leading-5 text-[#78828D]">
          {description}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-11 rounded-xl border border-[#E1E7EE] bg-white text-[14px] font-semibold text-[#39424C] transition active:scale-[0.98] active:bg-[#F5F7FA]"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className={`h-11 rounded-xl text-[14px] font-semibold text-white shadow-sm transition active:scale-[0.98] ${
              danger ? 'bg-[#FF334D] active:bg-[#E52640]' : 'bg-[#1677FF] active:bg-[#0967E3]'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
