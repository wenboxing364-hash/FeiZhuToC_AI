import { ArrowLeft } from 'lucide-react'

interface RouteHeaderProps {
  onBack: () => void
}

export function RouteHeader({ onBack }: RouteHeaderProps) {
  return (
    <header className="route-page-header">
      <button type="button" onClick={onBack} aria-label="返回 AI 旅行助手">
        <ArrowLeft size={23} strokeWidth={2} />
      </button>
      <h1>行程路线</h1>
      <span aria-hidden="true" />
    </header>
  )
}
