import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatInputBar } from '../components/ChatInputBar'
import { ChatMessageList } from '../components/ChatMessageList'
import { Header } from '../components/Header'
import { TripSettingsSheet } from '../components/settings/TripSettingsSheet'
import type { TripInfoSettingsValue } from '../components/settings/TripInfoSettings'
import type { TripPreferenceSettingsValue } from '../components/settings/TripPreferenceSettings'
import { welcomeMessage } from '../data/mockTrip'
import {
  buildRequirementQuestion,
  buildRequirementSummary,
  createEmptyTripRequirement,
  getMissingRequirementFields,
  updateTripRequirement,
} from '../domain/tripRequirement'
import { createTravelersByCategory } from '../domain/travelerTickets'
import {
  applyDemoTripPlanModification,
  generateAlternativeDemoTripPlan,
  generateDemoTripPlan,
  getTripPlanAttractionIds,
} from '../services/planning/demoItinerary'
import { createDemoBudgetEstimate } from '../services/pricing/demoBudget'
import type { BudgetSummary } from '../types/pricing'
import type {
  ChatItem,
  ConversationState,
  TripPlan,
  TripRequirement,
  TripUpdateChatItem,
} from '../types/trip'

interface TripPlannerPageProps {
  onViewRoute?: (tripPlan: TripPlan) => void
  hidden?: boolean
}

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

function estimateBudget(requirement: TripRequirement, plan: TripPlan): BudgetSummary | undefined {
  const destination = requirement.destinations[0]
  if (!destination || !requirement.duration) return undefined
  return createDemoBudgetEstimate({
    travelers: requirement.travelers,
    durationDays: requirement.duration,
    departureCity: requirement.departureCity,
    destination,
    hotelLevel: requirement.hotelLevel,
    userBudget: requirement.budget,
    preferences: requirement.preferences,
    attractionIds: getTripPlanAttractionIds(plan),
  })
}

function pricingSignature(requirement: TripRequirement) {
  return JSON.stringify({
    travelers: requirement.travelers,
    budget: requirement.budget,
    duration: requirement.duration,
    departureCity: requirement.departureCity,
    destinations: requirement.destinations,
    preferences: requirement.preferences,
    pace: requirement.pace,
    companion: requirement.companion,
    constraints: requirement.constraints,
    hotelLevel: requirement.hotelLevel,
  })
}

function withBudget(
  plan: TripPlan,
  summary: BudgetSummary | undefined,
  requirement: TripRequirement,
): TripPlan {
  const travelerCount = requirement.travelers.total ?? 0
  const targetTotal = requirement.budget
    ? requirement.budget.type === 'per-person'
      ? requirement.budget.amount * travelerCount
      : requirement.budget.amount
    : undefined
  const total = targetTotal ?? summary?.total ?? plan.budget.total
  const perPerson = requirement.budget
    ? requirement.budget.type === 'per-person'
      ? requirement.budget.amount
      : travelerCount > 0
        ? Math.round(requirement.budget.amount / travelerCount)
        : undefined
    : summary?.perPerson ?? plan.budget.perPerson
  return { ...plan, budget: { total, perPerson } }
}

function formatCurrency(value: number) {
  return `¥${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value)}`
}

function formatBudgetRequirement(requirement: TripRequirement) {
  if (!requirement.budget) return '未设置预算'
  return requirement.budget.type === 'per-person'
    ? `人均预算 ${formatCurrency(requirement.budget.amount)}`
    : `总预算 ${formatCurrency(requirement.budget.amount)}`
}

function buildRequirementUpdateNotice(
  previous: TripRequirement,
  current: TripRequirement,
  previousSummary: BudgetSummary | undefined,
  currentSummary: BudgetSummary | undefined,
): Omit<TripUpdateChatItem, 'id' | 'kind'> {
  let title = '旅行需求已更新'
  let before = '原旅行需求已保存'
  let after = '新旅行需求已应用'

  if (previous.duration !== current.duration) {
    title = '行程天数已更新'
    before = `原行程：${previous.duration ?? 0} 天`
    after = `新行程：${current.duration ?? 0} 天`
  } else if (JSON.stringify(previous.travelers) !== JSON.stringify(current.travelers)) {
    title = '游客信息已更新'
    before = `原游客：${previous.travelers.total ?? 0} 人`
    after = `新游客：${current.travelers.total ?? 0} 人，门票与房间数已重算`
  } else if (previous.hotelLevel !== current.hotelLevel) {
    const labels = { budget: '经济型', comfort: '舒适型', premium: '高档型' }
    title = '酒店方案已更新'
    before = `原酒店：${labels[previous.hotelLevel]}`
    after = `新酒店：${labels[current.hotelLevel]}`
  } else if (JSON.stringify(previous.budget) !== JSON.stringify(current.budget)) {
    title = '预算目标已更新'
    before = `原预算：${formatBudgetRequirement(previous)}`
    after = `新预算：${formatBudgetRequirement(current)}`
  } else if (JSON.stringify(previous.preferences) !== JSON.stringify(current.preferences)) {
    title = '旅行偏好已更新'
    before = `原偏好：${previous.preferences.join('、') || '未指定'}`
    after = `新偏好：${current.preferences.join('、') || '未指定'}`
  } else if (previous.pace !== current.pace) {
    const labels = { relaxed: '轻松', normal: '适中', intensive: '紧凑' }
    title = '行程节奏已更新'
    before = `原节奏：${previous.pace ? labels[previous.pace] : '适中'}`
    after = `新节奏：${current.pace ? labels[current.pace] : '适中'}，每日活动数量已重排`
  } else if (JSON.stringify(previous.constraints) !== JSON.stringify(current.constraints)) {
    title = '特殊要求已更新'
    before = `原要求：${previous.constraints.join('、') || '无'}`
    after = `新要求：${current.constraints.join('、') || '无'}，整体行程已重新检查`
  }

  const impact = currentSummary
    ? previousSummary && previousSummary.total !== currentSummary.total
      ? `预计总费用由 ${formatCurrency(previousSummary.total)} 调整为 ${formatCurrency(currentSummary.total)}`
      : `预计总费用 ${formatCurrency(currentSummary.total)}，最新规划卡已同步生成`
    : '行程与预算已同步更新'

  return { title, before, after, impact }
}

export function TripPlannerPage({ onViewRoute, hidden }: TripPlannerPageProps) {
  const [items, setItems] = useState<ChatItem[]>(initialItems)
  const [conversationState, setConversationState] = useState<ConversationState>('INITIAL')
  const [requirement, setRequirement] = useState<TripRequirement>(createEmptyTripRequirement)
  const [tripPlan, setTripPlan] = useState<TripPlan>()
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [toast, setToast] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const sequenceRef = useRef(0)
  const processingRef = useRef(false)
  const requirementRef = useRef(requirement)
  const tripPlanRef = useRef<TripPlan | undefined>(undefined)
  const budgetSummaryRef = useRef<BudgetSummary | undefined>(undefined)
  const scrollTargetRef = useRef<string | undefined>(undefined)

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
    const targetId = scrollTargetRef.current
    if (!targetId) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      return
    }
    scrollTargetRef.current = undefined
    const timer = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
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

  const appendUserMessage = (content: string) => {
    setItems((current) => [
      ...current.filter((item) => item.kind !== 'suggestions' && item.kind !== 'preferences'),
      { id: nextId('user'), kind: 'message', role: 'user', content },
    ])
  }

  const savePlanAndBudget = (
    updatedRequirement: TripRequirement,
    basePlan: TripPlan,
  ): { plan: TripPlan; summary?: BudgetSummary } => {
    const summary = estimateBudget(updatedRequirement, basePlan)
    const pricedPlan = withBudget(basePlan, summary, updatedRequirement)
    tripPlanRef.current = pricedPlan
    budgetSummaryRef.current = summary
    setTripPlan(pricedPlan)
    setBudgetSummary(summary)
    return { plan: pricedPlan, summary }
  }

  const collectRequirements = (content: string) => {
    processingRef.current = true
    setIsProcessing(true)
    appendUserMessage(content)

    const updatedRequirement = updateTripRequirement(requirementRef.current, content)
    requirementRef.current = updatedRequirement
    setRequirement(updatedRequirement)

    const missingFields = getMissingRequirementFields(updatedRequirement)
    const question = buildRequirementQuestion(missingFields, updatedRequirement)
    if (question) {
      setConversationState('COLLECTING_REQUIREMENTS')
      schedule(() => {
        setItems((current) => [
          ...current,
          { id: nextId('requirement-question'), kind: 'message', role: 'assistant', content: question },
        ])
        setConversationState('ASKING')
        finishProcessing()
      }, 520)
      return
    }

    const generatedPlan = generateDemoTripPlan(updatedRequirement)
    setConversationState('READY_TO_GENERATE')
    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('requirement-summary'),
          kind: 'message',
          role: 'assistant',
          content: `${buildRequirementSummary(updatedRequirement)}\n\n${
            generatedPlan
              ? '信息已经齐全，开始生成行程。预算会在行程完成后按实际安排计算。'
              : '信息已经齐全。当前行程与价格数据暂仅支持长沙，其他城市将在后续补充。'
          }`,
        },
      ])
    }, 420)

    if (!generatedPlan) {
      schedule(finishProcessing, 720)
      return
    }

    const loadingId = nextId('loading')
    schedule(() => {
      setConversationState('GENERATING')
      setItems((current) => [
        ...current,
        { id: loadingId, kind: 'loading', content: '正在生成行程并计算预算' },
      ])
    }, 760)

    schedule(() => {
      savePlanAndBudget(updatedRequirement, generatedPlan)
      const itineraryId = nextId('itinerary')
      scrollTargetRef.current = itineraryId
      setItems((current) => [
        ...current.filter((item) => item.id !== loadingId),
        { id: itineraryId, kind: 'itinerary' },
      ])
      setConversationState('PLAN_GENERATED')
      finishProcessing()
    }, 2050)
  }

  const updatePricingCalculation = (content: string, updatedRequirement: TripRequirement) => {
    processingRef.current = true
    setIsProcessing(true)
    setConversationState('MODIFYING')
    appendUserMessage(content)

    const previousRequirement = requirementRef.current
    const previousSummary = budgetSummaryRef.current
    requirementRef.current = updatedRequirement
    setRequirement(updatedRequirement)
    const question = buildRequirementQuestion(
      getMissingRequirementFields(updatedRequirement),
      updatedRequirement,
    )
    if (question) {
      schedule(() => {
        setItems((current) => [
          ...current,
          {
            id: nextId('traveler-question'),
            kind: 'message',
            role: 'assistant',
            content: question,
          },
        ])
        setConversationState('ASKING')
        finishProcessing()
      }, 520)
      return
    }

    const basePlan = generateDemoTripPlan(updatedRequirement, tripPlanRef.current)

    schedule(() => {
      const result = basePlan
        ? savePlanAndBudget(updatedRequirement, basePlan)
        : { plan: undefined, summary: undefined }
      const notice = buildRequirementUpdateNotice(
        previousRequirement,
        updatedRequirement,
        previousSummary,
        result.summary,
      )
      const updateCardId = nextId('requirement-update-card')
      scrollTargetRef.current = updateCardId
      setItems((current) => [
        ...current.filter((item) => item.kind !== 'itinerary'),
        {
          id: nextId('pricing-recalculation'),
          kind: 'message',
          role: 'assistant',
          content: `旅行信息已更新，新的行程与预算已经重新生成。\n\n${buildRequirementSummary(updatedRequirement)}`,
        },
        { id: updateCardId, kind: 'trip-update', ...notice },
        ...(result.plan ? [{ id: nextId('itinerary'), kind: 'itinerary' } as ChatItem] : []),
      ])
      setConversationState('PLAN_GENERATED')
      finishProcessing()
    }, 560)
  }

  const updateItinerary = (
    content: string,
    preparedModification?: ReturnType<typeof applyDemoTripPlanModification>,
  ) => {
    const existingPlan = tripPlanRef.current
    if (!existingPlan) return
    const modification = preparedModification ?? applyDemoTripPlanModification(existingPlan, content)
    if (!modification.changed) {
      addGenericResponse(content, modification.feedback)
      return
    }

    processingRef.current = true
    setIsProcessing(true)
    setConversationState('MODIFYING')
    appendUserMessage(content)
    const updatedRequirement = requirementRef.current
    const previousSummary = budgetSummaryRef.current

    schedule(() => {
      const result = savePlanAndBudget(updatedRequirement, modification.plan)
      if (modification.notice.targetDay) setExpandedDay(modification.notice.targetDay)
      const budgetImpact =
        previousSummary && result.summary && previousSummary.total !== result.summary.total
          ? `${modification.notice.impact}（${formatCurrency(previousSummary.total)} → ${formatCurrency(result.summary.total)}）`
          : modification.notice.impact
      const updateCardId = nextId('itinerary-update-card')
      scrollTargetRef.current = updateCardId
      setItems((current) => [
        ...current.filter((item) => item.kind !== 'itinerary'),
        {
          id: nextId('itinerary-update'),
          kind: 'message',
          role: 'assistant',
          content: modification.description,
        },
        {
          id: updateCardId,
          kind: 'trip-update',
          ...modification.notice,
          impact: budgetImpact,
        },
        { id: nextId('itinerary'), kind: 'itinerary' },
      ])
      setConversationState('PLAN_GENERATED')
      finishProcessing()
    }, 650)
  }

  const addGenericResponse = (content: string, response?: string) => {
    processingRef.current = true
    setIsProcessing(true)
    setConversationState('MODIFYING')
    appendUserMessage(content)
    schedule(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId('generic-response'),
          kind: 'message',
          role: 'assistant',
          content:
            response ??
            '收到，我已经记下这个需求。当前 Demo 暂未识别到可执行的行程调整。',
        },
      ])
      setConversationState('PLAN_GENERATED')
      finishProcessing()
    }, 560)
  }

  const sendMessage = (rawContent: string) => {
    const content = rawContent.trim()
    if (!content || processingRef.current) return
    setInput('')

    if (tripPlanRef.current) {
      const itineraryModification = applyDemoTripPlanModification(tripPlanRef.current, content)
      if (itineraryModification.changed) {
        updateItinerary(content, itineraryModification)
        return
      }
      const updatedRequirement = updateTripRequirement(requirementRef.current, content)
      if (pricingSignature(updatedRequirement) !== pricingSignature(requirementRef.current)) {
        updatePricingCalculation(content, updatedRequirement)
        return
      }
      addGenericResponse(content, itineraryModification.feedback)
      return
    }
    collectRequirements(content)
  }

  const confirmPreferences = () => {
    if (selectedPreferences.length === 0) return
    sendMessage(`我比较喜欢${selectedPreferences.join('和')}，请按这个偏好来规划。`)
  }

  const viewDay = (day: number) => {
    setExpandedDay(day)
    window.setTimeout(() => {
      document.getElementById(`trip-day-${day}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
  }

  const saveTripInfoSettings = (value: TripInfoSettingsValue) => {
    const people = createTravelersByCategory(
      value.travelers.adults,
      value.travelers.children,
      value.travelers.seniors,
    )
    const updatedRequirement: TripRequirement = {
      ...requirementRef.current,
      destinations: value.destinations,
      travelers: { total: people.length, people },
      budget: { amount: value.budgetTotal, type: 'total', currency: 'CNY' },
    }
    requirementRef.current = updatedRequirement
    setRequirement(updatedRequirement)

    const existingPlan = tripPlanRef.current
    if (!existingPlan) return
    const basePlan = generateDemoTripPlan(updatedRequirement, existingPlan) ?? {
      ...existingPlan,
      id: `${existingPlan.id}-settings-${Date.now()}`,
      destinations: value.destinations,
      travelers: value.travelers,
    }
    savePlanAndBudget(updatedRequirement, basePlan)
    const itineraryId = nextId('settings-itinerary')
    scrollTargetRef.current = itineraryId
    setItems((current) => [
      ...current.filter(
        (item) => item.kind !== 'itinerary' && item.kind !== 'suggestions' && item.kind !== 'preferences',
      ),
      {
        id: nextId('trip-info-settings-feedback'),
        kind: 'message',
        role: 'assistant',
        content: '旅行信息已更新，我已经根据新的旅行信息调整预算和行程。',
      },
      { id: itineraryId, kind: 'itinerary' },
    ])
    setExpandedDay(1)
    setConversationState('PLAN_GENERATED')
  }

  const saveTripPreferenceSettings = (value: TripPreferenceSettingsValue) => {
    const updatedRequirement: TripRequirement = {
      ...requirementRef.current,
      preferences: value.preferences,
      pace: value.pace,
    }
    requirementRef.current = updatedRequirement
    setRequirement(updatedRequirement)
    setSelectedPreferences(value.preferences)

    const existingPlan = tripPlanRef.current
    if (!existingPlan) return
    const basePlan = generateDemoTripPlan(updatedRequirement, existingPlan) ?? {
      ...existingPlan,
      id: `${existingPlan.id}-preferences-${Date.now()}`,
      preferences: value.preferences,
      pace: value.pace,
    }
    savePlanAndBudget(updatedRequirement, basePlan)
    const paceLabel = { relaxed: '轻松', normal: '适中', intensive: '紧凑' }[value.pace]
    const preferenceLabel = value.preferences.length > 0 ? `${value.preferences.join(' + ')} + ` : ''
    const itineraryId = nextId('settings-itinerary')
    scrollTargetRef.current = itineraryId
    setItems((current) => [
      ...current.filter(
        (item) => item.kind !== 'itinerary' && item.kind !== 'suggestions' && item.kind !== 'preferences',
      ),
      {
        id: nextId('preference-settings-feedback'),
        kind: 'message',
        role: 'assistant',
        content: `好的，我已经将旅行偏好调整为「${preferenceLabel}${paceLabel}节奏」。`,
      },
      { id: itineraryId, kind: 'itinerary' },
    ])
    setExpandedDay(1)
    setConversationState('PLAN_GENERATED')
  }

  const replanTrip = () => {
    const existingPlan = tripPlanRef.current
    if (!existingPlan || processingRef.current) return
    processingRef.current = true
    setIsProcessing(true)
    setConversationState('GENERATING')
    const loadingId = nextId('settings-replan-loading')
    setItems((current) => [
      ...current.filter((item) => item.kind !== 'itinerary'),
      {
        id: nextId('settings-replan-start'),
        kind: 'message',
        role: 'assistant',
        content: '正在重新规划旅行方案...',
      },
      { id: loadingId, kind: 'loading', content: 'AI 正在思考中' },
    ])

    schedule(() => {
      const replanned = generateAlternativeDemoTripPlan(requirementRef.current, existingPlan)
      if (!replanned) {
        setItems((current) => [
          ...current.filter((item) => item.id !== loadingId),
          {
            id: nextId('settings-replan-error'),
            kind: 'message',
            role: 'assistant',
            content: '当前 Demo 暂时无法为这个目的地生成另一版行程。',
          },
        ])
        setConversationState('PLAN_GENERATED')
        finishProcessing()
        return
      }

      savePlanAndBudget(requirementRef.current, replanned)
      const itineraryId = nextId('settings-replan-itinerary')
      scrollTargetRef.current = itineraryId
      setItems((current) => [
        ...current.filter((item) => item.id !== loadingId),
        {
          id: nextId('settings-replan-success'),
          kind: 'message',
          role: 'assistant',
          content: '新的行程方案已生成！快来看看吧～',
        },
        { id: itineraryId, kind: 'itinerary' },
      ])
      setExpandedDay(1)
      setConversationState('PLAN_GENERATED')
      finishProcessing()
    }, 1250)
  }

  const restartTrip = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.length = 0
    const emptyRequirement = createEmptyTripRequirement()
    requirementRef.current = emptyRequirement
    tripPlanRef.current = undefined
    budgetSummaryRef.current = undefined
    processingRef.current = false
    scrollTargetRef.current = undefined
    sequenceRef.current = 0
    setItems(initialItems.map((item) => ({ ...item })))
    setConversationState('INITIAL')
    setRequirement(emptyRequirement)
    setTripPlan(undefined)
    setBudgetSummary(undefined)
    setInput('')
    setIsProcessing(false)
    setSelectedPreferences([])
    setExpandedDay(1)
    setToast('')
  }

  return (
    <div
      className="app-shell relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#F5F7FA]"
      data-conversation-state={conversationState}
      hidden={hidden}
    >
      <Header onAction={showToast} onMore={() => setSettingsOpen(true)} />
      <ChatMessageList
        items={items}
        tripPlan={tripPlan}
        budgetSummary={budgetSummary}
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
        onViewDay={viewDay}
        onViewRoute={() => tripPlan && onViewRoute?.(tripPlan)}
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

      {settingsOpen && (
        <TripSettingsSheet
          tripPlan={tripPlan}
          onClose={() => setSettingsOpen(false)}
          onSaveTripInfo={saveTripInfoSettings}
          onSavePreferences={saveTripPreferenceSettings}
          onReplan={replanTrip}
          onRestart={restartTrip}
        />
      )}
    </div>
  )
}
