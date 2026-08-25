import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { TripPlan } from '../../types/trip'
import { PriceRulesSheet } from './PriceRulesSheet'
import { ReplanConfirmDialog } from './ReplanConfirmDialog'
import { RestartConfirmDialog } from './RestartConfirmDialog'
import {
  TripInfoSettings,
  type TripInfoSettingsValue,
} from './TripInfoSettings'
import {
  TripPreferenceSettings,
  type TripPreferenceSettingsValue,
} from './TripPreferenceSettings'

export type SettingsView = 'menu' | 'trip-info' | 'preferences' | 'price-rules'
type ConfirmView = 'replan' | 'restart' | null
type ViewDirection = 'forward' | 'back'

interface DragSession {
  pointerId: number
  startY: number
  lastY: number
  lastTime: number
  velocityY: number
  initialOffset: number
  initialScrollTop: number
  scrollElement?: HTMLElement
  originalTouchAction?: string
  dragged: boolean
}

const DISMISS_DISTANCE_RATIO = 0.22
const DISMISS_VELOCITY = 700

function readTranslateY(element: HTMLElement): number {
  const transform = window.getComputedStyle(element).transform
  if (!transform || transform === 'none') return 0
  try {
    return new DOMMatrixReadOnly(transform).m42
  } catch {
    return 0
  }
}

interface TripSettingsSheetProps {
  tripPlan?: TripPlan
  onClose: () => void
  onSaveTripInfo: (value: TripInfoSettingsValue) => void
  onSavePreferences: (value: TripPreferenceSettingsValue) => void
  onReplan: () => void
  onRestart: () => void
}

interface MenuItemProps {
  icon: LucideIcon
  title: string
  description: string
  tone: 'blue' | 'green' | 'amber' | 'violet' | 'danger'
  disabled?: boolean
  onClick: () => void
}

const menuToneClasses = {
  blue: 'bg-[#E8F2FF] text-[#1677FF]',
  green: 'bg-[#E5F8EE] text-[#20A76B]',
  amber: 'bg-[#FFF2D8] text-[#F59E0B]',
  violet: 'bg-[#F0E9FF] text-[#7C4DFF]',
  danger: 'bg-[#FFE8EC] text-[#F02E4C]',
}

function MenuItem({ icon: Icon, title, description, tone, disabled = false, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`group flex w-full items-center gap-3 rounded-2xl border border-[#EEF1F5] bg-white px-3 py-3 text-left shadow-[0_2px_8px_rgba(31,41,55,0.025)] transition active:scale-[0.985] disabled:opacity-45 ${
        tone === 'danger' ? 'text-[#F02E4C]' : 'text-[#20242A]'
      }`}
      onClick={onClick}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${menuToneClasses[tone]}`}>
        <Icon size={20} strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">{title}</span>
        <span className={`mt-0.5 block text-[10px] leading-4 ${tone === 'danger' ? 'text-[#E55A6E]' : 'text-[#8A949E]'}`}>
          {description}
        </span>
      </span>
      <ChevronRight size={18} className={tone === 'danger' ? 'text-[#F02E4C]' : 'text-[#A6AFB9]'} />
    </button>
  )
}

const viewTitles: Record<SettingsView, string> = {
  menu: '旅行设置',
  'trip-info': '旅行信息设置',
  preferences: '行程偏好设置',
  'price-rules': '价格规则说明',
}

export function TripSettingsSheet({
  tripPlan,
  onClose,
  onSaveTripInfo,
  onSavePreferences,
  onReplan,
  onRestart,
}: TripSettingsSheetProps) {
  const [view, setView] = useState<SettingsView>('menu')
  const [viewDirection, setViewDirection] = useState<ViewDirection>('forward')
  const [confirmView, setConfirmView] = useState<ConfirmView>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const dragSessionRef = useRef<DragSession | undefined>(undefined)
  const dragOffsetRef = useRef(0)
  const closingRef = useRef(false)
  const suppressClickRef = useRef(false)
  const closeTimerRef = useRef<number | undefined>(undefined)
  const visualAnimationsRef = useRef<Animation[]>([])

  const cancelVisualAnimations = useCallback(() => {
    visualAnimationsRef.current.forEach((animation) => animation.cancel())
    visualAnimationsRef.current = []
    sheetRef.current?.getAnimations().forEach((animation) => animation.cancel())
    backdropRef.current?.getAnimations().forEach((animation) => animation.cancel())
  }, [])

  const setDragVisuals = useCallback((rawOffset: number) => {
    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet || !backdrop) return

    const offset = rawOffset >= 0 ? rawOffset : rawOffset * 0.06
    const sheetHeight = Math.max(sheet.getBoundingClientRect().height, 1)
    const dragProgress = Math.min(Math.max(offset, 0) / sheetHeight, 1)
    dragOffsetRef.current = offset
    sheet.style.transform = `translate3d(0, ${offset}px, 0)`
    backdrop.style.opacity = String(1 - dragProgress)
  }, [])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet || !backdrop) {
      onClose()
      return
    }

    closingRef.current = true
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reducedMotion ? 0 : 300
    const currentTransform = window.getComputedStyle(sheet).transform
    const currentBackdropOpacity = Number(window.getComputedStyle(backdrop).opacity)
    const exitDistance = Math.max(sheet.getBoundingClientRect().height + 32, window.innerHeight * 0.55)
    cancelVisualAnimations()

    if (duration === 0) {
      onClose()
      return
    }

    const sheetAnimation = sheet.animate(
      [
        { transform: currentTransform === 'none' ? 'translate3d(0, 0, 0)' : currentTransform },
        { transform: `translate3d(0, ${exitDistance}px, 0)` },
      ],
      { duration, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' },
    )
    const backdropAnimation = backdrop.animate(
      [{ opacity: currentBackdropOpacity }, { opacity: 0 }],
      { duration, easing: 'ease-out', fill: 'forwards' },
    )
    visualAnimationsRef.current = [sheetAnimation, backdropAnimation]
    closeTimerRef.current = window.setTimeout(onClose, duration)
  }, [cancelVisualAnimations, onClose])

  const snapBack = useCallback(() => {
    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet || !backdrop) return

    const offset = Math.max(dragOffsetRef.current, 0)
    if (offset < 1) {
      setDragVisuals(0)
      return
    }

    cancelVisualAnimations()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setDragVisuals(0)
      return
    }

    const currentBackdropOpacity = Number(window.getComputedStyle(backdrop).opacity)
    const sheetAnimation = sheet.animate(
      [
        { transform: `translate3d(0, ${offset}px, 0)`, offset: 0 },
        { transform: `translate3d(0, ${offset * 0.56}px, 0)`, offset: 0.34 },
        { transform: `translate3d(0, ${offset * 0.2}px, 0)`, offset: 0.7 },
        { transform: 'translate3d(0, 0, 0)', offset: 1 },
      ],
      { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    )
    const backdropAnimation = backdrop.animate(
      [{ opacity: currentBackdropOpacity }, { opacity: 1 }],
      { duration: 300, easing: 'ease-out', fill: 'forwards' },
    )
    visualAnimationsRef.current = [sheetAnimation, backdropAnimation]
    sheetAnimation.onfinish = () => {
      sheet.style.transform = 'translate3d(0, 0, 0)'
      backdrop.style.opacity = '1'
      dragOffsetRef.current = 0
      sheetAnimation.cancel()
      backdropAnimation.cancel()
      visualAnimationsRef.current = []
    }
  }, [cancelVisualAnimations, setDragVisuals])

  const releaseDragSession = useCallback((pointerId: number) => {
    const session = dragSessionRef.current
    const sheet = sheetRef.current
    if (!session || session.pointerId !== pointerId) return undefined
    if (session.scrollElement) {
      session.scrollElement.style.touchAction = session.originalTouchAction ?? ''
    }
    if (sheet?.hasPointerCapture(pointerId)) sheet.releasePointerCapture(pointerId)
    dragSessionRef.current = undefined
    return session
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (closingRef.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    const target = event.target as HTMLElement
    const isHandle = Boolean(target.closest('[data-drag-handle]'))
    const scrollElement = target.closest<HTMLElement>('.settings-scroll') ?? undefined
    if (!isHandle && (!scrollElement || event.pointerType === 'mouse')) {
      return
    }

    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet || !backdrop) return
    const currentOffset = readTranslateY(sheet)
    const currentBackdropOpacity = window.getComputedStyle(backdrop).opacity
    cancelVisualAnimations()
    sheet.style.transform = `translate3d(0, ${currentOffset}px, 0)`
    backdrop.style.opacity = currentBackdropOpacity
    dragOffsetRef.current = currentOffset
    const now = performance.now()
    const originalTouchAction = scrollElement?.style.touchAction
    if (scrollElement) scrollElement.style.touchAction = 'none'
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: now,
      velocityY: 0,
      initialOffset: currentOffset,
      initialScrollTop: scrollElement?.scrollTop ?? 0,
      scrollElement,
      originalTouchAction,
      dragged: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId || closingRef.current) return
    const deltaY = event.clientY - session.startY
    const now = performance.now()
    const elapsed = Math.max(now - session.lastTime, 1)
    const instantVelocity = ((event.clientY - session.lastY) / elapsed) * 1000
    session.velocityY = session.velocityY * 0.55 + instantVelocity * 0.45
    session.lastY = event.clientY
    session.lastTime = now

    if (Math.abs(deltaY) > 4) {
      session.dragged = true
      suppressClickRef.current = true
    }

    if (session.scrollElement) {
      const desiredScrollTop = session.initialScrollTop - deltaY
      if (desiredScrollTop > 0 || deltaY < 0) {
        const maxScrollTop = Math.max(
          session.scrollElement.scrollHeight - session.scrollElement.clientHeight,
          0,
        )
        session.scrollElement.scrollTop = Math.min(Math.max(desiredScrollTop, 0), maxScrollTop)
        setDragVisuals(session.initialOffset)
        if (event.cancelable) event.preventDefault()
        return
      }

      const sheetDelta = Math.max(deltaY - session.initialScrollTop, 0)
      setDragVisuals(session.initialOffset + sheetDelta)
    } else {
      setDragVisuals(session.initialOffset + deltaY)
    }
    if (event.cancelable) event.preventDefault()
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const session = releaseDragSession(event.pointerId)
    if (!session) return
    const sheetHeight = Math.max(sheetRef.current?.getBoundingClientRect().height ?? 0, 1)
    const shouldDismiss =
      dragOffsetRef.current > sheetHeight * DISMISS_DISTANCE_RATIO ||
      (dragOffsetRef.current > 0 && session.velocityY > DISMISS_VELOCITY)
    if (shouldDismiss) requestClose()
    else snapBack()
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    const session = releaseDragSession(event.pointerId)
    if (session) {
      suppressClickRef.current = false
      snapBack()
    }
  }

  const navigateTo = (nextView: SettingsView) => {
    setViewDirection(nextView === 'menu' ? 'back' : 'forward')
    setView(nextView)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmView) setConfirmView(null)
        else requestClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmView, requestClose])

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow
    const bodyOverscrollBehavior = document.body.style.overscrollBehavior
    const chatScroll = document.querySelector<HTMLElement>('.chat-scroll')
    const chatOverflow = chatScroll?.style.overflow
    const chatTouchAction = chatScroll?.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    if (chatScroll) {
      chatScroll.style.overflow = 'hidden'
      chatScroll.style.touchAction = 'none'
    }
    return () => {
      document.body.style.overflow = bodyOverflow
      document.body.style.overscrollBehavior = bodyOverscrollBehavior
      if (chatScroll) {
        chatScroll.style.overflow = chatOverflow ?? ''
        chatScroll.style.touchAction = chatTouchAction ?? ''
      }
    }
  }, [])

  useEffect(
    () => () => {
      if (closeTimerRef.current !== undefined) window.clearTimeout(closeTimerRef.current)
      visualAnimationsRef.current.forEach((animation) => animation.cancel())
    },
    [],
  )

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-50 flex items-end"
      role="presentation"
    >
      {!confirmView && (
        <>
          <div
            ref={backdropRef}
            className="settings-backdrop-layer settings-backdrop-layer-enter absolute inset-0"
            aria-hidden="true"
            onClick={requestClose}
            onWheel={(event) => event.preventDefault()}
          />
          <section
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-settings-title"
            data-view={view}
            className="trip-settings-sheet settings-sheet-enter relative z-10 flex w-full flex-col overflow-hidden rounded-t-[26px] bg-[#F7F8FA] shadow-[0_-12px_40px_rgba(17,24,39,0.16)]"
            onClick={(event) => event.stopPropagation()}
            onClickCapture={(event) => {
              if (!suppressClickRef.current) return
              suppressClickRef.current = false
              event.preventDefault()
              event.stopPropagation()
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <div
              data-drag-handle
              className="settings-drag-zone flex h-9 shrink-0 items-start justify-center pt-[11px]"
              aria-hidden="true"
            >
              <div className="h-[5px] w-11 rounded-full bg-[#D6DCE3]" />
            </div>
            <div className="relative flex h-11 shrink-0 items-center justify-center bg-white px-3">
              {view !== 'menu' && (
                <button
                  type="button"
                  aria-label="返回旅行设置"
                  className="icon-button absolute left-3 h-11 w-11"
                  onClick={() => navigateTo('menu')}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 id="trip-settings-title" className="text-[16px] font-bold text-[#20242A]">
                {viewTitles[view]}
              </h2>
              <button
                type="button"
                aria-label="关闭旅行设置"
                className="icon-button absolute right-3 h-11 w-11"
                onClick={requestClose}
              >
                <X size={21} />
              </button>
            </div>

            <div
              key={view}
              className={`settings-view-enter flex min-h-0 flex-1 flex-col ${
                viewDirection === 'back' ? 'settings-view-enter-back' : 'settings-view-enter-forward'
              }`}
            >
              {view === 'menu' && (
                <div className="settings-scroll min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#F7F8FA] px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-2">
                  {!tripPlan && (
                    <p className="rounded-xl bg-[#EEF5FF] px-3 py-2 text-[11px] leading-4 text-[#3978C6]">
                      生成旅行方案后即可修改旅行信息和偏好；价格规则与重新开始仍可查看。
                    </p>
                  )}
                  <MenuItem
                    icon={MapPin}
                    title="旅行信息设置"
                    description="修改目的地、天数、人数和预算"
                    tone="blue"
                    disabled={!tripPlan}
                    onClick={() => navigateTo('trip-info')}
                  />
                  <MenuItem
                    icon={SlidersHorizontal}
                    title="行程偏好设置"
                    description="修改旅行偏好和节奏"
                    tone="green"
                    disabled={!tripPlan}
                    onClick={() => navigateTo('preferences')}
                  />
                  <MenuItem
                    icon={WalletCards}
                    title="价格规则说明"
                    description="查看当前 Demo 的旅行费用计算规则"
                    tone="amber"
                    onClick={() => navigateTo('price-rules')}
                  />
                  <MenuItem
                    icon={RefreshCw}
                    title="重新规划行程"
                    description="保留需求，重新生成方案"
                    tone="violet"
                    disabled={!tripPlan}
                    onClick={() => setConfirmView('replan')}
                  />
                  <MenuItem
                    icon={Trash2}
                    title="重新开始"
                    description="清空聊天和当前旅行计划"
                    tone="danger"
                    onClick={() => setConfirmView('restart')}
                  />
                </div>
              )}

              {view === 'trip-info' && tripPlan && (
                <TripInfoSettings
                  tripPlan={tripPlan}
                  onSave={(value) => {
                    onSaveTripInfo(value)
                    requestClose()
                  }}
                />
              )}
              {view === 'preferences' && tripPlan && (
                <TripPreferenceSettings
                  tripPlan={tripPlan}
                  onSave={(value) => {
                    onSavePreferences(value)
                    requestClose()
                  }}
                />
              )}
              {view === 'price-rules' && <PriceRulesSheet />}
            </div>
          </section>
        </>
      )}

      {confirmView === 'replan' && (
        <ReplanConfirmDialog
          onCancel={() => setConfirmView(null)}
          onConfirm={() => {
            onReplan()
            onClose()
          }}
        />
      )}
      {confirmView === 'restart' && (
        <RestartConfirmDialog
          onCancel={() => setConfirmView(null)}
          onConfirm={() => {
            onRestart()
            onClose()
          }}
        />
      )}
    </div>
  )
}
