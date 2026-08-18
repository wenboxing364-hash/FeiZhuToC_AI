import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatInputBar } from '../components/ChatInputBar'
import { ChatMessageList } from '../components/ChatMessageList'
import { Header } from '../components/Header'
import { welcomeMessage } from '../data/mockTrip'
import type { ChatItem } from '../types/trip'

type ConversationPhase = 'welcome' | 'preferences' | 'itinerary' | 'updated'

const initialItems: ChatItem[] = [
  { id: 'welcome', kind: 'message', role: 'assistant', content: welcomeMessage },
  { id: 'welcome-suggestions', kind: 'suggestions' },
]

const quickActionPrompts: Record<string, string> = {
  修改行程: '第二天安排岳麓山，安排轻松一点。',
  换一个景点: '把第一天的 IFS 国金中心换成一个更有长沙特色的景点。',
  控制预算: '请把人均预算控制在 1800 元以内。',
  安排更轻松: '整体行程再安排轻松一点，减少步行。',
}

export function TripPlannerPage() {
  const [items, setItems] = useState<ChatItem[]>(initialItems)
  const [phase, setPhase] = useState<ConversationPhase>('welcome')
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [toast, setToast] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const sequenceRef = useRef(0)
  const processingRef = useRef(false)

  const nextId = useCallback((prefix: string) => {
    sequenceRef.current += 1
    return `${prefix}-${sequenceRef.current}`
  }, [])

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timersRef.current.push(timer)
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items])

  const showToast = useCallback(
    (message: string) => {
      setToast(message)
      schedule(() => setToast(''), 2200)
    },
    [schedule],
  )

  const finishProcessing = () => {
    processingRef.current = false
    setIsProcessing(false)
  }

  const requestPreferences = (content: string) => {
    processingRef.current = true
    setIsProcessing(true)
    setItems((current) => [
      ...current,
      { id: nextId('user'), kind: 'message', role: 'user', content },
    ])
    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('preference-question'),
          kind: 'message',
          role: 'assistant',
          content:
            '没问题。\n为了让行程更适合你们，还想了解一下你们比较喜欢哪种旅行方式？',
        },
        { id: nextId('preference-chips'), kind: 'preferences' },
      ])
      setPhase('preferences')
      finishProcessing()
    }, 520)
  }

  const createItinerary = (content: string) => {
    processingRef.current = true
    setIsProcessing(true)
    setItems((current) => [
      ...current,
      { id: nextId('user'), kind: 'message', role: 'user', content },
    ])

    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('preference-confirmed'),
          kind: 'message',
          role: 'assistant',
          content:
            '收到，我会按照「美食 + 历史文化 + 轻松节奏」为你们规划长沙3天2晚行程。',
        },
      ])
    }, 420)

    const loadingId = nextId('loading')
    schedule(() => {
      setItems((current) => [
        ...current,
        { id: loadingId, kind: 'loading', content: '正在生成旅行计划' },
      ])
    }, 760)

    schedule(() => {
      setItems((current) => [
        ...current.filter((item) => item.id !== loadingId),
        { id: nextId('itinerary'), kind: 'itinerary' },
      ])
      setPhase('itinerary')
      finishProcessing()
    }, 2050)
  }

  const updateDayTwo = (content: string) => {
    processingRef.current = true
    setIsProcessing(true)
    setItems((current) => [
      ...current,
      { id: nextId('user'), kind: 'message', role: 'user', content },
    ])
    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('update-confirmed'),
          kind: 'message',
          role: 'assistant',
          content:
            '好的，我已经帮你调整 Day 2。\n将第二天行程调整为以岳麓山、湖南大学和周边历史文化景点为主，同时减少当天的景点数量和步行距离。',
        },
        { id: nextId('trip-update'), kind: 'trip-update' },
      ])
      setPhase('updated')
      finishProcessing()
    }, 650)
  }

  const addGenericResponse = (content: string) => {
    processingRef.current = true
    setIsProcessing(true)
    setItems((current) => [
      ...current,
      { id: nextId('user'), kind: 'message', role: 'user', content },
    ])
    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('generic-response'),
          kind: 'message',
          role: 'assistant',
          content: '收到，我已经记下这个需求。当前 Demo 会在下一轮规划中应用这项调整。',
        },
      ])
      finishProcessing()
    }, 560)
  }

  const sendMessage = (rawContent: string) => {
    const content = rawContent.trim()
    if (!content || processingRef.current) return

    setInput('')
    if (phase === 'welcome') {
      requestPreferences(content)
      return
    }
    if (phase === 'preferences') {
      createItinerary(content)
      return
    }
    if (/第二天|Day\s*2|岳麓山/i.test(content)) {
      updateDayTwo(content)
      return
    }
    addGenericResponse(content)
  }

  const confirmPreferences = () => {
    const hasTargetCombination = ['美食', '历史文化', '轻松休闲'].every((option) =>
      selectedPreferences.includes(option),
    )
    const content = hasTargetCombination
      ? '我喜欢美食和历史，而且不想安排得太紧。'
      : `我比较喜欢${selectedPreferences.join('和')}，请按这个偏好来规划。`
    sendMessage(content)
  }

  const viewDayTwo = () => {
    setExpandedDay(2)
    window.setTimeout(() => {
      document.getElementById('trip-day-2')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  return (
    <div className="app-shell relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#F5F7FA]">
      <Header onAction={showToast} />
      <ChatMessageList
        items={items}
        isProcessing={isProcessing}
        selectedPreferences={selectedPreferences}
        expandedDay={expandedDay}
        endRef={endRef}
        onSuggestion={sendMessage}
        onPreferenceToggle={(option) =>
          setSelectedPreferences((current) =>
            current.includes(option)
              ? current.filter((value) => value !== option)
              : [...current, option],
          )
        }
        onPreferenceConfirm={confirmPreferences}
        onExpandedDayChange={setExpandedDay}
        onViewDayTwo={viewDayTwo}
        onAction={showToast}
      />
      <ChatInputBar
        value={input}
        disabled={isProcessing}
        onChange={setInput}
        onSend={() => sendMessage(input)}
        onQuickAction={(action) => setInput(quickActionPrompts[action] ?? action)}
        onAdd={() => showToast('附件功能将在下一版本开放')}
      />

      {toast && (
        <div
          className="toast-enter pointer-events-none absolute bottom-[112px] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#20242A]/90 px-4 py-2 text-xs text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
