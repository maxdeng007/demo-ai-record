<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, nextTick, watch } from 'vue'
import { Button, Cell, Icon, Loading, showToast, Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import enUS from 'vant/es/locale/lang/en-US'

const locale = ref('zh')

watch(
  locale,
  (code) => {
    document.documentElement.lang = code === 'zh' ? 'zh-CN' : 'en'
    Locale.use(code === 'zh' ? 'zh-CN' : 'en-US', code === 'zh' ? zhCN : enUS)
  },
  { immediate: true },
)

const flowState = ref('idle')
const elapsedSeconds = ref(0)
const transcript = ref('')
const waveformBars = Array.from({ length: 22 }, (_, index) => index)
const textareaRef = ref(null)

const CONTENT_ZH = {
  client: '环球科技有限公司',
  industry: '企业级 SaaS',
  location: '高新产业园 5 号楼',
  locationMeta: '距公司 120 米 · GPS 已验证',
  contact: '张先生',
  contactRole: '采购经理',
  mockPassages: [
    '今天下午与张先生会面。他对我们为运营团队准备的 2.0 版本升级很感兴趣。主要顾虑是集成排期——他们仍有旧系统需要迁移。三季度预算已获批，资金不是阻碍。下一步：发送技术集成路线图，并与 IT 团队约在下周二做一次跟进演示。',
    '他还提到正在评估两家竞品。下次会议前最好拉上解决方案工程师，直接回应排期方面的担忧。',
  ],
  polishedSummary:
    '与张先生会面富有成效。对方对 2.0 升级有兴趣，但对集成时间线仍有顾虑。三季度预算已获批。',
  insightTags: [
    { key: 'intent', label: '意向', value: '高', tone: 'success' },
    { key: 'pain', label: '痛点', value: '排期', tone: 'warning' },
    { key: 'comp', label: '竞品', value: '有提及', tone: 'neutral' },
  ],
  actionItems: [
    {
      id: 'a1',
      text: '发送技术集成路线图。',
      due: '本周五前',
      owner: '已指派给您',
    },
    {
      id: 'a2',
      text: '与 IT 团队安排跟进演示。',
      due: '下周二',
      owner: '已指派给您',
    },
  ],
}

const CONTENT_EN = {
  client: 'Global Tech Solutions Inc.',
  industry: 'Enterprise SaaS',
  location: 'Building 5, High-Tech Park',
  locationMeta: '120m · GPS verified',
  contact: 'Mr. Zhang',
  contactRole: 'Purchasing Manager',
  mockPassages: [
    "Met with Mr. Zhang this afternoon. He's very interested in our Version 2.0 upgrade for the operations team. Main concern is the integration timeline — they have legacy systems that need migration. Budget is approved for Q3 so that's not a blocker. Next steps: send him the technical integration roadmap and schedule a follow-up demo with their IT team next Tuesday.",
    "He also mentioned they're evaluating two competitors. We should loop in a solutions engineer before the next meeting to directly address the timeline concerns.",
  ],
  polishedSummary:
    'The meeting with Mr. Zhang was productive. They are interested in our Version 2.0 upgrade but expressed concerns regarding the integration timeline. Budget is approved for Q3.',
  insightTags: [
    { key: 'intent', label: 'Intent', value: 'High', tone: 'success' },
    { key: 'pain', label: 'Pain Point', value: 'Timeline', tone: 'warning' },
    { key: 'comp', label: 'Competitor', value: 'Mentioned', tone: 'neutral' },
  ],
  actionItems: [
    {
      id: 'a1',
      text: 'Send the technical integration roadmap.',
      due: 'By Friday',
      owner: 'Assigned to you',
    },
    {
      id: 'a2',
      text: 'Schedule a follow-up demo with the IT team.',
      due: 'Next Tuesday',
      owner: 'Assigned to you',
    },
  ],
}

const content = computed(() => (locale.value === 'zh' ? CONTENT_ZH : CONTENT_EN))

const TRANSCRIPT_STORAGE_KEY = 'ai-record-visit-notes-demo'

const UI_ZH = {
  backAria: '返回',
  langToggleAria: '切换语言',
  liveVisit: '拜访中',
  heroEyebrow: 'AI 销售助手 · 客户拜访',
  meetingNotes: '会议记录',
  rec: '录制',
  placeholderListening: '正在聆听…',
  placeholderIdle: '点击麦克风口述，或直接在此输入拜访纪要…',
  micStop: '点击停止并开始分析',
  micContinue: '点击继续口述',
  micStart: '点击开始口述拜访内容',
  ariaStopRecording: '停止录音',
  ariaStartRecording: '开始录音',
  analyzeWithAi: '用 AI 分析',
  resultsEyebrow: '分析结果',
  resultsCount: '{n} 条输出',
  cardEyebrowPolished: 'AI 润色',
  cardTitleSummary: '会议纪要',
  cardEyebrowExtracted: '已提取',
  cardTitleInsights: '结构化洞察',
  cardEyebrowSuggested: '建议',
  cardTitleActions: '智能待办',
  createTask: '创建任务',
  added: '已添加',
  resetDemo: '重置演示',
  processingKicker: 'AI 魔法 · 语义抽取',
  processingTitle: 'AI 正在分析语义并提取行动项',
  processingSubtitle: '提炼要点、意向与下一步…',
  stepTranscribe: '转写',
  stepExtract: '抽取',
  stepStructure: '结构化',
  notifyTaskCreated: '任务已添加',
  saveNotes: '保存纪要',
  notifyNotesSaved: '纪要已保存',
  notesUnsaved: '有未保存更改',
  notesSaved: '已保存',
  applyToNotes: '应用到纪要',
  applied: '已应用',
  confirmReplaceNotes: '将当前纪要替换为润色版本？',
  notifyAppliedToNotes: '已应用到纪要',
  undo: '撤销',
  notifyRestoredNotes: '已恢复替换前纪要',
  readyToAnalyze: '已准备好分析当前纪要',
  confirmResetDemo: '确认重置当前演示数据？',
  notifyDemoReset: '演示已重置',
}

const UI_EN = {
  backAria: 'Back',
  langToggleAria: 'Switch language',
  liveVisit: 'Live Visit',
  heroEyebrow: 'AI SALES COPILOT · CLIENT VISIT',
  meetingNotes: 'Meeting Notes',
  rec: 'REC',
  placeholderListening: 'Listening…',
  placeholderIdle: 'Tap the mic to dictate, or type your notes here…',
  micStop: 'Tap to stop and analyze',
  micContinue: 'Tap to continue dictating',
  micStart: 'Tap to dictate your visit',
  ariaStopRecording: 'Stop recording',
  ariaStartRecording: 'Start recording',
  analyzeWithAi: 'Analyze with AI',
  resultsEyebrow: 'RESULTS',
  resultsCount: '{n} AI outputs',
  cardEyebrowPolished: 'AI Polished',
  cardTitleSummary: 'Meeting Summary',
  cardEyebrowExtracted: 'Extracted',
  cardTitleInsights: 'Structured Insights',
  cardEyebrowSuggested: 'Suggested',
  cardTitleActions: 'Smart Action Items',
  createTask: 'Create Task',
  added: 'Added',
  resetDemo: 'Reset Demo',
  processingKicker: 'AI Magic · Semantic Extraction',
  processingTitle: 'AI is analyzing semantics & extracting action items',
  processingSubtitle: 'Distilling key points, intent & next steps…',
  stepTranscribe: 'Transcribe',
  stepExtract: 'Extract',
  stepStructure: 'Structure',
  notifyTaskCreated: 'Task added',
  saveNotes: 'Save notes',
  notifyNotesSaved: 'Notes saved',
  notesUnsaved: 'Unsaved changes',
  notesSaved: 'Saved',
  applyToNotes: 'Apply to notes',
  applied: 'Applied',
  confirmReplaceNotes: 'Replace current notes with the polished version?',
  notifyAppliedToNotes: 'Applied to notes',
  undo: 'Undo',
  notifyRestoredNotes: 'Restored previous notes',
  readyToAnalyze: 'Ready to analyze your notes',
  confirmResetDemo: 'Reset current demo data?',
  notifyDemoReset: 'Demo reset',
}

const ui = computed(() => (locale.value === 'zh' ? UI_ZH : UI_EN))

const taskCreated = reactive({})

let timerInterval = null
let processingTimeout = null
let streamInterval = null
let streamIndex = 0
let streamTokens = []
let streamPointer = 0
let polishUndoTimeout = null

const isRecording = computed(() => flowState.value === 'recording')
const isProcessing = computed(() => flowState.value === 'processing')
const hasRevealedResults = computed(() => flowState.value === 'revealed')
const canAnalyze = computed(
  () =>
    !isRecording.value &&
    !isProcessing.value &&
    transcript.value.trim().length > 0,
)

const canSaveNotes = computed(
  () => !isProcessing.value && transcript.value.trim().length > 0,
)
const isPolishedApplied = computed(
  () => transcript.value.trim().length > 0 && transcript.value.trim() === content.value.polishedSummary.trim(),
)
const canApplyPolished = computed(
  () => !isRecording.value && !isProcessing.value && !isPolishedApplied.value,
)
const lastSavedSnapshot = ref('')
const hasUnsavedChanges = ref(false)
const notesSaveStatus = computed(() => {
  if (!canSaveNotes.value) return ''
  return hasUnsavedChanges.value ? ui.value.notesUnsaved : ui.value.notesSaved
})
const undoPolishAvailable = ref(false)
const previousTranscriptBeforePolish = ref('')

const formattedTime = computed(() => {
  const m = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
  const s = String(elapsedSeconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const micLabel = computed(() => {
  const u = ui.value
  if (isRecording.value) return u.micStop
  if (transcript.value.trim().length > 0) return u.micContinue
  return u.micStart
})

const revealCards = computed(() => {
  if (!hasRevealedResults.value) return []
  return [
    { key: 'summary', type: 'summary' },
    { key: 'insights', type: 'insights' },
    { key: 'actions', type: 'actions' },
  ]
})

const toneStyles = {
  success: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-600 ring-amber-100',
  neutral: 'bg-violet-50 text-violet-600 ring-violet-100',
}

function clearAllTimers() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (processingTimeout) {
    clearTimeout(processingTimeout)
    processingTimeout = null
  }
  if (streamInterval) {
    clearInterval(streamInterval)
    streamInterval = null
  }
  if (polishUndoTimeout) {
    clearTimeout(polishUndoTimeout)
    polishUndoTimeout = null
  }
}

function scrollTranscriptToEnd() {
  nextTick(() => {
    const el = textareaRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function buildStreamTokens(passage, isZh) {
  if (isZh) {
    const chunks = []
    for (let i = 0; i < passage.length; i += 4) {
      chunks.push(passage.slice(i, i + 4))
    }
    return chunks
  }
  return passage.split(/(\s+)/).filter(Boolean)
}

function startStreamingTranscript() {
  const passages = content.value.mockPassages
  const passage = passages[Math.min(streamIndex, passages.length - 1)]
  streamTokens = buildStreamTokens(passage, locale.value === 'zh')
  streamPointer = 0

  if (transcript.value.length > 0 && !transcript.value.endsWith('\n')) {
    transcript.value += '\n\n'
  }

  const tickMs = locale.value === 'zh' ? 85 : 110
  streamInterval = setInterval(() => {
    if (streamPointer >= streamTokens.length) {
      clearInterval(streamInterval)
      streamInterval = null
      streamIndex += 1
      return
    }
    transcript.value += streamTokens[streamPointer]
    streamPointer += 1
    scrollTranscriptToEnd()
  }, tickMs)
}

function startRecording() {
  clearAllTimers()
  elapsedSeconds.value = 0
  flowState.value = 'recording'
  timerInterval = setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
  startStreamingTranscript()
}

function stopRecordingAndProcess() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (streamInterval) {
    clearInterval(streamInterval)
    streamInterval = null
  }
  if (!transcript.value.trim()) {
    flowState.value = 'idle'
    return
  }
  flowState.value = 'processing'
  processingTimeout = setTimeout(() => {
    flowState.value = 'revealed'
    processingTimeout = null
  }, 3000)
}

function toggleRecording() {
  if (isProcessing.value) return
  if (!isRecording.value) {
    startRecording()
    return
  }
  stopRecordingAndProcess()
}

function analyzeText() {
  if (!canAnalyze.value) return
  flowState.value = 'processing'
  processingTimeout = setTimeout(() => {
    flowState.value = 'revealed'
    processingTimeout = null
  }, 3000)
}

function createTask(item) {
  if (taskCreated[item.id]) return
  taskCreated[item.id] = true
  showToast({
    message: ui.value.notifyTaskCreated,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1400,
  })
}

function saveNotes() {
  if (!canSaveNotes.value) return
  try {
    localStorage.setItem(TRANSCRIPT_STORAGE_KEY, transcript.value)
  } catch {
    /* ignore quota / private mode */
  }
  showToast({
    message: ui.value.notifyNotesSaved,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1400,
  })
  lastSavedSnapshot.value = transcript.value
  hasUnsavedChanges.value = false
}

function applyPolishedToNotes() {
  if (!canApplyPolished.value) return
  const current = transcript.value.trim()
  const polished = content.value.polishedSummary.trim()
  if (current && current !== polished) {
    const confirmed = window.confirm(ui.value.confirmReplaceNotes)
    if (!confirmed) return
  }
  previousTranscriptBeforePolish.value = transcript.value
  transcript.value = content.value.polishedSummary
  undoPolishAvailable.value = true
  if (polishUndoTimeout) clearTimeout(polishUndoTimeout)
  polishUndoTimeout = setTimeout(() => {
    undoPolishAvailable.value = false
    polishUndoTimeout = null
  }, 5000)
  scrollTranscriptToEnd()
  showToast({
    message: ui.value.notifyAppliedToNotes,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1400,
  })
}

function undoApplyPolished() {
  if (!undoPolishAvailable.value) return
  transcript.value = previousTranscriptBeforePolish.value
  undoPolishAvailable.value = false
  if (polishUndoTimeout) {
    clearTimeout(polishUndoTimeout)
    polishUndoTimeout = null
  }
  showToast({
    message: ui.value.notifyRestoredNotes,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1400,
  })
}

function resetDemo() {
  const hasAnyData =
    transcript.value.trim().length > 0 ||
    hasRevealedResults.value ||
    Object.keys(taskCreated).length > 0
  if (hasAnyData) {
    const confirmed = window.confirm(ui.value.confirmResetDemo)
    if (!confirmed) return
  }
  clearAllTimers()
  elapsedSeconds.value = 0
  transcript.value = ''
  streamIndex = 0
  streamPointer = 0
  flowState.value = 'idle'
  Object.keys(taskCreated).forEach((k) => delete taskCreated[k])
  try {
    localStorage.removeItem(TRANSCRIPT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  showToast({
    message: ui.value.notifyDemoReset,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1200,
  })
}

onMounted(() => {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_STORAGE_KEY)
    if (raw != null && raw.length > 0) {
      transcript.value = raw
      lastSavedSnapshot.value = raw
    }
  } catch {
    /* ignore */
  }
})

watch(transcript, (value) => {
  const trimmed = value.trim()
  if (!trimmed) {
    hasUnsavedChanges.value = false
    return
  }
  hasUnsavedChanges.value = value !== lastSavedSnapshot.value
})

onBeforeUnmount(() => {
  clearAllTimers()
})
</script>

<template>
  <main class="app-shell">
    <div class="page">
      <section class="hero">
        <div class="hero-bg" aria-hidden="true">
          <span class="blob blob-1" />
          <span class="blob blob-2" />
          <span class="blob blob-3" />
          <div class="hero-grid" />
          <div class="hero-fade" />
        </div>

        <div class="hero-content">
          <div class="hero-topbar">
            <button type="button" class="glass-icon-btn" :aria-label="ui.backAria">
              <Icon name="arrow-left" size="18" />
            </button>
            <div class="hero-topbar-end">
              <div class="lang-toggle" role="group" :aria-label="ui.langToggleAria">
                <button
                  type="button"
                  class="lang-toggle__btn"
                  :class="{ 'lang-toggle__btn--active': locale === 'zh' }"
                  @click="locale = 'zh'"
                >
                  中文
                </button>
                <button
                  type="button"
                  class="lang-toggle__btn"
                  :class="{ 'lang-toggle__btn--active': locale === 'en' }"
                  @click="locale = 'en'"
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          <div class="hero-body">
            <div class="hero-eyebrow" :class="{ 'hero-eyebrow--zh': locale === 'zh' }">
              <span class="sparkle">◆</span>
              {{ ui.heroEyebrow }}
            </div>
            <h1 class="hero-title">{{ content.client }}</h1>
            <div class="hero-subtitle">{{ content.industry }}</div>

            <div class="hero-pills">
              <div class="live-badge">
                <span class="live-dot" />
                {{ ui.liveVisit }}
              </div>
              <span class="hero-pill">
                <Icon name="location-o" size="12" />
                {{ content.location }}
                <span class="hero-pill-meta">· {{ content.locationMeta }}</span>
              </span>
              <span class="hero-pill">
                <Icon name="manager-o" size="12" />
                {{ content.contact }}
                <span class="hero-pill-meta">· {{ content.contactRole }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="content">
        <article class="capture-card" :class="{ 'capture-card--recording': isRecording }">
          <div class="capture-head">
            <div class="capture-head-left">
              <Icon name="notes-o" size="16" />
              <span>{{ ui.meetingNotes }}</span>
            </div>
            <div class="capture-head-right">
              <span
                v-if="!isRecording && notesSaveStatus"
                class="save-status"
                :class="{ 'save-status--dirty': hasUnsavedChanges }"
              >
                {{ notesSaveStatus }}
              </span>
              <button
                v-if="!isRecording"
                type="button"
                class="save-notes-btn"
                :aria-label="ui.saveNotes"
                :disabled="!canSaveNotes"
                @click="saveNotes"
              >
                {{ ui.saveNotes }}
              </button>
              <transition name="reveal">
                <div v-if="isRecording" class="timer-badge">
                  <span class="timer-dot" />
                  <span class="font-mono text-[13px] font-semibold tabular-nums tracking-wider">
                    {{ formattedTime }}
                  </span>
                  <span class="text-[10px] font-semibold tracking-wider text-rose-500/80">{{ ui.rec }}</span>
                </div>
              </transition>
            </div>
          </div>

          <div class="capture-body">
            <textarea
              ref="textareaRef"
              v-model="transcript"
              class="transcript-input"
              :placeholder="isRecording ? ui.placeholderListening : ui.placeholderIdle"
              rows="6"
              :readonly="isRecording || isProcessing"
            />
            <transition name="reveal">
              <span v-if="isRecording" class="typing-cursor" />
            </transition>
          </div>

          <div class="capture-footer">
            <div class="capture-wave">
              <template v-if="isRecording">
                <div class="waveform">
                  <span v-for="bar in waveformBars" :key="bar" class="wave-bar" />
                </div>
              </template>
              <template v-else>
                <div class="capture-hint">{{ micLabel }}</div>
              </template>
            </div>

            <button
              type="button"
              class="mic-button"
              :class="{ 'mic-button--recording': isRecording }"
              :aria-label="isRecording ? ui.ariaStopRecording : ui.ariaStartRecording"
              :disabled="isProcessing"
              @click="toggleRecording"
            >
              <span class="mic-ring mic-ring--1" />
              <span class="mic-ring mic-ring--2" />
              <span class="mic-ring mic-ring--3" />
              <span class="mic-core">
                <svg
                  v-if="!isRecording"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  class="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                </svg>
                <span v-else class="block h-4 w-4 rounded-[3px] bg-white" />
              </span>
            </button>
          </div>
        </article>

        <transition name="reveal">
          <div v-if="canAnalyze && !hasRevealedResults" class="pre-analyze-hint">
            {{ ui.readyToAnalyze }}
          </div>
        </transition>

        <transition name="reveal">
          <div v-if="canAnalyze && !hasRevealedResults" class="analyze-row">
            <Button
              block
              round
              type="primary"
              color="#1989fa"
              @click="analyzeText"
            >
              <Icon name="magic-stick-o" size="16" class="mr-1.5" />
              {{ ui.analyzeWithAi }}
            </Button>
          </div>
        </transition>

        <transition name="reveal">
          <section v-if="hasRevealedResults" class="reveal-section">
            <div class="reveal-header">
              <span class="reveal-eyebrow">{{ ui.resultsEyebrow }}</span>
              <span class="reveal-sep" />
              <span class="reveal-count">{{ ui.resultsCount.replace('{n}', String(revealCards.length)) }}</span>
            </div>
            <transition-group
              enter-active-class="animate__animated animate__fadeInUp"
              tag="div"
              class="space-y-3"
            >
              <article
                v-for="(card, index) in revealCards"
                :key="card.key"
                class="result-card"
                :style="{ animationDelay: `${index * 140}ms`, animationDuration: '520ms' }"
              >
                <template v-if="card.type === 'summary'">
                  <div class="card-header">
                    <div class="badge-icon badge-icon--gradient">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l1.8 4.8L18.6 8.6 13.8 10.4 12 15.2l-1.8-4.8L5.4 8.6l4.8-1.8L12 2zm7 11l.9 2.4 2.4.9-2.4.9L19 19.6l-.9-2.4-2.4-.9 2.4-.9L19 13zM5 14l.75 2 2 .75-2 .75L5 19.5l-.75-2-2-.75 2-.75L5 14z" />
                      </svg>
                    </div>
                    <div>
                      <div class="card-eyebrow">{{ ui.cardEyebrowPolished }}</div>
                      <h3 class="card-title">{{ ui.cardTitleSummary }}</h3>
                    </div>
                  </div>
                  <p class="summary-text">{{ content.polishedSummary }}</p>
                  <div class="summary-actions">
                    <Button
                      size="small"
                      round
                      :type="isPolishedApplied ? 'success' : 'primary'"
                      :color="isPolishedApplied ? '#10b981' : '#1989fa'"
                      class="polish-apply-btn"
                      :disabled="!canApplyPolished"
                      @click="applyPolishedToNotes"
                    >
                      <template v-if="isPolishedApplied">
                        <Icon name="success" size="12" class="mr-1" />
                        {{ ui.applied }}
                      </template>
                      <template v-else>
                        {{ ui.applyToNotes }}
                      </template>
                    </Button>
                    <Button
                      v-if="undoPolishAvailable"
                      size="small"
                      round
                      plain
                      type="primary"
                      class="polish-undo-btn"
                      @click="undoApplyPolished"
                    >
                      {{ ui.undo }}
                    </Button>
                  </div>
                </template>

                <template v-else-if="card.type === 'insights'">
                  <div class="card-header">
                    <div class="badge-icon bg-violet-100 text-violet-600">
                      <Icon name="label-o" size="18" />
                    </div>
                    <div>
                      <div class="card-eyebrow">{{ ui.cardEyebrowExtracted }}</div>
                      <h3 class="card-title">{{ ui.cardTitleInsights }}</h3>
                    </div>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="tag in content.insightTags"
                      :key="tag.key"
                      class="insight-pill ring-1"
                      :class="toneStyles[tag.tone]"
                    >
                      <span class="opacity-70">{{ tag.label }}{{ locale === 'zh' ? '：' : ':' }}</span>
                      <strong class="font-semibold">{{ tag.value }}</strong>
                    </span>
                  </div>
                </template>

                <template v-else>
                  <div class="card-header">
                    <div class="badge-icon bg-emerald-100 text-emerald-600">
                      <Icon name="checked" size="18" />
                    </div>
                    <div>
                      <div class="card-eyebrow">{{ ui.cardEyebrowSuggested }}</div>
                      <h3 class="card-title">{{ ui.cardTitleActions }}</h3>
                    </div>
                  </div>
                  <div class="mt-2 overflow-hidden rounded-xl border border-slate-100">
                    <Cell
                      v-for="item in content.actionItems"
                      :key="item.id"
                      center
                      :border="false"
                      class="action-cell"
                    >
                      <template #title>
                        <p class="text-[13.5px] leading-snug text-slate-800">
                          {{ item.text }}
                        </p>
                        <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span class="due-pill">
                            <Icon name="clock-o" size="11" />
                            {{ item.due }}
                          </span>
                          <span class="text-slate-400">{{ item.owner }}</span>
                        </div>
                      </template>
                      <template #value>
                        <Button
                          size="small"
                          round
                          :type="taskCreated[item.id] ? 'success' : 'primary'"
                          :color="taskCreated[item.id] ? '#10b981' : '#1989fa'"
                          class="action-btn"
                          @click="createTask(item)"
                        >
                          <template v-if="taskCreated[item.id]">
                            <Icon name="success" size="12" class="mr-1" />
                            {{ ui.added }}
                          </template>
                          <template v-else>
                            {{ ui.createTask }}
                          </template>
                        </Button>
                      </template>
                    </Cell>
                  </div>
                </template>
              </article>
            </transition-group>
          </section>
        </transition>

        <div class="pb-8 pt-4">
          <button type="button" class="reset-btn" @click="resetDemo">
            <Icon name="replay" size="14" />
            {{ ui.resetDemo }}
          </button>
        </div>
      </section>
    </div>

    <transition name="overlay">
      <div v-if="isProcessing" class="processing-overlay">
        <div class="processing-card">
          <div class="processing-orb">
            <Loading color="#1989fa" size="28" />
            <span class="processing-orb-ping" />
          </div>
          <div class="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1989fa]">
            {{ ui.processingKicker }}
          </div>
          <p class="mt-1.5 text-[14.5px] font-semibold text-slate-900 leading-snug">
            {{ ui.processingTitle }}
          </p>
          <p class="mt-1 text-[12px] text-slate-500">
            {{ ui.processingSubtitle }}
          </p>
          <div class="progress-track">
            <div class="progress-fill" />
          </div>
          <div class="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-medium text-slate-400">
            <div class="processing-step processing-step--done">{{ ui.stepTranscribe }}</div>
            <div class="processing-step processing-step--active">{{ ui.stepExtract }}</div>
            <div class="processing-step">{{ ui.stepStructure }}</div>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f4f6fb;
  padding-bottom: env(safe-area-inset-bottom);
}

.page {
  margin: 0 auto;
  max-width: 28rem;
  min-height: 100vh;
  background: #f7f9fd;
  box-shadow: 0 30px 60px -40px rgba(15, 36, 75, 0.25);
  position: relative;
  overflow: hidden;
}

/* ─────────────────────────── HERO ─────────────────────────── */

.hero {
  position: relative;
  overflow: hidden;
  padding: 16px 20px 32px;
  background: linear-gradient(160deg, #e0efff 0%, #efe7ff 55%, #f7f9fd 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(46px);
  opacity: 0.55;
  will-change: transform;
}

.blob-1 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 30% 30%, #1989fa 0%, rgba(25, 137, 250, 0) 70%);
  top: -90px;
  left: -70px;
  animation: drift-a 22s ease-in-out infinite;
}

.blob-2 {
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #c4b5fd 0%, rgba(196, 181, 253, 0) 70%);
  top: -50px;
  right: -60px;
  animation: drift-b 26s ease-in-out infinite;
}

.blob-3 {
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, #7dd3fc 0%, rgba(125, 211, 252, 0) 70%);
  bottom: -140px;
  left: 25%;
  opacity: 0.42;
  animation: drift-c 30s ease-in-out infinite;
}

@keyframes drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(25px, 18px, 0) scale(1.1); }
}

@keyframes drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-30px, 25px, 0) scale(1.08); }
}

@keyframes drift-c {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(20px, -25px, 0) scale(0.92); }
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 36, 75, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 36, 75, 0.05) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%);
  opacity: 0.6;
}

.hero-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  background: linear-gradient(180deg, rgba(247, 249, 253, 0) 0%, #f7f9fd 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.hero-topbar-end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.lang-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 14px -8px rgba(15, 36, 75, 0.2);
}

.lang-toggle__btn {
  border: none;
  background: transparent;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 999px;
  color: #64748b;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.lang-toggle__btn--active {
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  color: #fff;
  box-shadow: 0 4px 12px -4px rgba(25, 137, 250, 0.55);
}

.lang-toggle__btn:not(.lang-toggle__btn--active):active {
  color: #1989fa;
}

.glass-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px -6px rgba(15, 36, 75, 0.2);
  transition: transform 0.15s, background 0.15s;
}

.glass-icon-btn:active {
  transform: scale(0.94);
  background: rgba(255, 255, 255, 0.85);
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #059669;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1px;
}

.live-dot {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
}

.live-dot::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.45);
  animation: live-ping 1.6s ease-out infinite;
}

@keyframes live-ping {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #1989fa;
}

.hero-eyebrow--zh {
  letter-spacing: 0.12em;
}

.sparkle {
  display: inline-block;
  transform: rotate(45deg);
  font-size: 8px;
}

.hero-title {
  margin: 6px 0 2px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0b1f3a;
  line-height: 1.15;
}

.hero-subtitle {
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
}

.hero-pills {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  color: #0f172a;
  font-size: 11.5px;
  font-weight: 500;
  box-shadow: 0 4px 12px -8px rgba(15, 36, 75, 0.18);
}

.hero-pill-meta {
  color: #64748b;
  font-weight: 400;
}

/* ─────────────────────────── CONTENT ─────────────────────────── */

.content {
  position: relative;
  padding: 0 16px;
  margin-top: -18px;
  z-index: 2;
}

/* ───────────────────────── CAPTURE ─────────────────────────── */

.capture-card {
  position: relative;
  padding: 14px 14px 12px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(25, 137, 250, 0.1);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.04),
    0 20px 40px -24px rgba(25, 137, 250, 0.3);
  transition: background 0.4s ease, border-color 0.4s ease;
}

.capture-card--recording {
  border-color: rgba(244, 63, 94, 0.22);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.04),
    0 20px 40px -24px rgba(225, 29, 72, 0.32);
}

.capture-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 10px;
}

.capture-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capture-head-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1989fa;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.capture-card--recording .capture-head-left {
  color: #e11d48;
}

.save-status {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.save-status--dirty {
  color: #f59e0b;
}

.timer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(244, 63, 94, 0.08);
  border: 1px solid rgba(244, 63, 94, 0.18);
  border-radius: 999px;
  color: #e11d48;
}

.timer-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #e11d48;
  animation: pulse-dot 1.2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.85); }
}

.capture-body {
  position: relative;
  padding: 10px 4px;
  border-top: 1px solid rgba(15, 36, 75, 0.06);
  border-bottom: 1px solid rgba(15, 36, 75, 0.06);
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
  border-radius: 12px;
}

.transcript-input {
  display: block;
  width: 100%;
  min-height: 128px;
  max-height: 220px;
  padding: 8px 10px;
  border: 0;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.65;
  color: #0f172a;
  resize: none;
}

.transcript-input::placeholder {
  color: #94a3b8;
}

.transcript-input:read-only {
  cursor: default;
}

.typing-cursor {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 2px;
  height: 16px;
  background: #e11d48;
  border-radius: 1px;
  animation: caret-blink 1s step-end infinite;
}

@keyframes caret-blink {
  50% { opacity: 0; }
}

.capture-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px 2px;
}

.save-notes-btn {
  flex-shrink: 0;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 14px -8px rgba(25, 137, 250, 0.75);
  transition:
    background 0.2s,
    box-shadow 0.2s,
    transform 0.2s,
    border-color 0.2s,
    opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.save-notes-btn:disabled {
  background: #bfdbfe;
  color: #eff6ff;
  box-shadow: none;
  opacity: 1;
  cursor: not-allowed;
}

.save-notes-btn:not(:disabled):active {
  transform: translateY(0.5px);
  box-shadow: 0 3px 10px -8px rgba(25, 137, 250, 0.8);
  background: linear-gradient(135deg, #2f95f3 0%, #1679de 100%);
}

.capture-wave {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.capture-hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  padding: 0 4px;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 36px;
  width: 100%;
  padding: 0 6px;
}

.wave-bar {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #60a5fa, #1989fa);
  transform-origin: center;
  animation: voice-wave 900ms ease-in-out infinite;
}

.capture-card--recording .wave-bar {
  background: linear-gradient(180deg, #fb7185, #e11d48);
}

.wave-bar:nth-child(odd) { animation-duration: 780ms; }
.wave-bar:nth-child(3n) { animation-duration: 1050ms; }
.wave-bar:nth-child(4n) { animation-duration: 640ms; }
.wave-bar:nth-child(5n) { animation-duration: 1200ms; }
.wave-bar:nth-child(2n) { animation-delay: 80ms; }
.wave-bar:nth-child(3n) { animation-delay: 180ms; }
.wave-bar:nth-child(4n) { animation-delay: 240ms; }
.wave-bar:nth-child(7n) { animation-delay: 340ms; }

@keyframes voice-wave {
  0%, 100% { height: 20%; opacity: 0.7; }
  50% { height: 100%; opacity: 1; }
}

.mic-button {
  position: relative;
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
}

.mic-button::before,
.mic-button::after {
  content: '';
  position: absolute;
  inset: 14px;
  border-radius: 999px;
  border: 1.5px solid rgba(25, 137, 250, 0.34);
  pointer-events: none;
  opacity: 0;
  transform: scale(0.9);
}

.mic-button:not(.mic-button--recording)::before,
.mic-button:not(.mic-button--recording)::after {
  animation: mic-ripple 2.6s ease-out infinite;
}

.mic-button:not(.mic-button--recording)::after {
  animation-delay: 1.3s;
}

.mic-button--recording::before,
.mic-button--recording::after {
  display: none;
}

.mic-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mic-core {
  position: relative;
  z-index: 3;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 60%, #0a6fd9 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -4px 10px rgba(0, 0, 0, 0.14),
    0 10px 20px -8px rgba(25, 137, 250, 0.6);
  transition: transform 0.18s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.mic-button:not(.mic-button--recording) .mic-core {
  animation: mic-breath 2.8s ease-in-out infinite;
}

.mic-button:active .mic-core {
  transform: scale(0.94);
}

.mic-button--recording .mic-core {
  background: linear-gradient(135deg, #ff6b6b 0%, #e11d48 60%, #b91239 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.45),
    inset 0 -4px 10px rgba(0, 0, 0, 0.2),
    0 10px 20px -8px rgba(225, 29, 72, 0.55);
}

.mic-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  pointer-events: none;
}

.mic-ring--1 {
  background: radial-gradient(circle at 50% 50%, rgba(25, 137, 250, 0.24), transparent 70%);
  transition: background 0.3s;
}

.mic-button:not(.mic-button--recording) .mic-ring--1 {
  animation: mic-idle-glow 2.8s ease-in-out infinite;
}

.mic-button--recording .mic-ring--1 {
  background: radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.28), transparent 70%);
}

.mic-ring--2,
.mic-ring--3 {
  opacity: 0;
}

.mic-button--recording .mic-ring--2 {
  animation: mic-pulse 1.8s ease-out infinite;
  background: radial-gradient(circle, rgba(225, 29, 72, 0.34) 0%, transparent 70%);
}

.mic-button--recording .mic-ring--3 {
  animation: mic-pulse 1.8s ease-out infinite;
  animation-delay: 0.9s;
  background: radial-gradient(circle, rgba(225, 29, 72, 0.24) 0%, transparent 70%);
}

@keyframes mic-pulse {
  0% { transform: scale(0.7); opacity: 0.6; }
  70% { transform: scale(1.4); opacity: 0; }
  100% { transform: scale(1.4); opacity: 0; }
}

@keyframes mic-breath {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      inset 0 -4px 10px rgba(0, 0, 0, 0.14),
      0 10px 20px -8px rgba(25, 137, 250, 0.6);
  }
  50% {
    transform: scale(1.045);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.56),
      inset 0 -4px 10px rgba(0, 0, 0, 0.13),
      0 14px 28px -8px rgba(25, 137, 250, 0.72);
  }
}

@keyframes mic-idle-glow {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.82; }
}

@keyframes mic-ripple {
  0% {
    opacity: 0;
    transform: scale(0.88);
  }
  20% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}

/* ──────────────────── ANALYZE + REVEAL ─────────────────── */

.analyze-row {
  margin-top: 12px;
}

.pre-analyze-hint {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.reveal-section {
  margin-top: 18px;
}

.reveal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: 10px;
}

.reveal-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #1989fa;
}

.reveal-sep {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(25, 137, 250, 0.3), rgba(25, 137, 250, 0));
}

.reveal-count {
  font-size: 10.5px;
  font-weight: 500;
  color: #94a3b8;
}

.result-card {
  padding: 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 36, 75, 0.06);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.03),
    0 14px 30px -22px rgba(15, 36, 75, 0.18);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
}

.badge-icon--gradient {
  background: linear-gradient(135deg, #5bb4ff 0%, #1989fa 100%);
  box-shadow: 0 6px 14px -6px rgba(25, 137, 250, 0.5);
}

.card-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  line-height: 1;
}

.card-title {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.summary-text {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
}

.summary-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.polish-apply-btn {
  flex-shrink: 0;
}

.polish-undo-btn {
  flex-shrink: 0;
}

.insight-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
}

:deep(.action-cell) {
  padding: 10px 2px;
  background: transparent;
  align-items: flex-start;
}

:deep(.action-cell::after) {
  display: none;
}

:deep(.action-cell .van-cell__title) {
  flex: 1 1 0;
  padding-right: 12px;
}

:deep(.action-cell .van-cell__value) {
  flex: none;
  min-width: 0;
}

.due-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  font-weight: 500;
}

.action-btn {
  flex-shrink: 0;
}

/* ─────────────────────── RESET ─────────────────────────── */

.reset-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px;
  border-radius: 14px;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  border: 1px dashed rgba(100, 116, 139, 0.3);
  transition: background 0.2s, color 0.2s;
}

.reset-btn:active {
  background: rgba(100, 116, 139, 0.08);
  color: #0f172a;
}

/* ─────────────────── PROCESSING OVERLAY ─────────────────── */

.processing-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 40%, rgba(25, 137, 250, 0.2), rgba(15, 23, 42, 0.55) 70%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.processing-card {
  width: 100%;
  max-width: 340px;
  padding: 24px 22px 20px;
  border-radius: 22px;
  background: #fff;
  text-align: center;
  box-shadow: 0 30px 60px -20px rgba(15, 36, 75, 0.35);
  border: 1px solid rgba(25, 137, 250, 0.12);
}

.processing-orb {
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #eaf3ff 0%, #d4e7ff 100%);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 10px 28px -10px rgba(25, 137, 250, 0.4);
}

.processing-orb-ping {
  position: absolute;
  inset: -4px;
  border-radius: 999px;
  border: 1.5px solid rgba(25, 137, 250, 0.3);
  animation: orb-ping 1.6s ease-out infinite;
}

@keyframes orb-ping {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

.progress-track {
  margin-top: 16px;
  height: 6px;
  border-radius: 999px;
  background: rgba(25, 137, 250, 0.12);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #1989fa);
  transform-origin: left center;
  animation: progress 3s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.processing-step {
  padding: 5px 0;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.04);
  color: #94a3b8;
}

.processing-step--done {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.processing-step--active {
  background: rgba(25, 137, 250, 0.12);
  color: #1989fa;
  animation: step-breath 1.6s ease-in-out infinite;
}

@keyframes step-breath {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* ───────────────────── TRANSITIONS ─────────────────────── */

.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

:deep(.save-notes-toast.van-toast) {
  min-width: 136px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 12px 28px -16px rgba(15, 23, 42, 0.7),
    0 6px 14px -10px rgba(25, 137, 250, 0.5);
}

:deep(.save-notes-toast .van-toast__icon) {
  color: #34d399;
  font-size: 18px;
}

:deep(.save-notes-toast .van-toast__text) {
  margin-top: 4px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #f8fafc;
}

/* ───────────────────── RESPONSIVE ─────────────────────── */

/* Tablet and up */
@media (min-width: 640px) {
  .app-shell {
    background:
      radial-gradient(
        ellipse at 50% -10%,
        rgba(196, 181, 253, 0.35) 0%,
        rgba(224, 239, 255, 0.4) 35%,
        transparent 70%
      ),
      linear-gradient(180deg, #eef2f9 0%, #e7ecf4 100%);
    padding: 32px 24px 48px;
  }

  .page {
    max-width: 36rem;
    min-height: auto;
    border-radius: 28px;
    box-shadow:
      0 30px 70px -30px rgba(15, 36, 75, 0.3),
      0 4px 16px -10px rgba(15, 36, 75, 0.18);
  }

  .hero {
    padding: 28px 32px 44px;
  }

  .hero-title {
    font-size: 30px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .hero-eyebrow {
    font-size: 11px;
  }

  .hero-pill {
    font-size: 12.5px;
    padding: 7px 12px;
  }

  .glass-icon-btn {
    width: 40px;
    height: 40px;
  }

  .content {
    padding: 0 24px;
    margin-top: -22px;
  }

  .capture-card {
    padding: 18px 18px 16px;
    border-radius: 22px;
  }

  .capture-head {
    padding: 4px 4px 12px;
  }

  .capture-head-left {
    font-size: 13px;
  }

  .save-notes-btn {
    font-size: 12px;
    padding: 9px 16px;
  }

  .transcript-input {
    min-height: 160px;
    font-size: 15px;
  }

  .capture-hint {
    font-size: 13px;
  }

  .mic-button {
    width: 84px;
    height: 84px;
  }

  .mic-core {
    width: 60px;
    height: 60px;
  }

  .analyze-row {
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
  }

  .reveal-section {
    margin-top: 22px;
  }

  .result-card {
    padding: 18px;
    border-radius: 20px;
  }

  .card-title {
    font-size: 15px;
  }

  .summary-text {
    font-size: 14px;
  }

  .reset-btn {
    display: flex;
    width: auto;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Desktop — two-column workspace */
@media (min-width: 1024px) {
  .app-shell {
    padding: 56px 32px 72px;
  }

  .page {
    max-width: 68rem;
    border-radius: 32px;
    display: grid;
    grid-template-columns: minmax(320px, 2fr) minmax(0, 3fr);
    height: calc(100vh - 128px);
    height: calc(100dvh - 128px);
    min-height: 560px;
    box-shadow:
      0 55px 90px -40px rgba(15, 36, 75, 0.4),
      0 10px 28px -18px rgba(15, 36, 75, 0.22);
  }

  .hero {
    padding: 44px 36px;
  }

  .hero-fade {
    display: none;
  }

  .hero-topbar {
    margin-bottom: 26px;
  }

  .hero-title {
    font-size: 30px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .hero-pills {
    margin-top: 18px;
  }

  .content {
    padding: 44px 36px;
    margin-top: 0;
    z-index: auto;
    overflow-y: auto;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: rgba(15, 36, 75, 0.18) transparent;
  }

  .content::-webkit-scrollbar {
    width: 8px;
  }

  .content::-webkit-scrollbar-track {
    background: transparent;
  }

  .content::-webkit-scrollbar-thumb {
    background: rgba(15, 36, 75, 0.14);
    border-radius: 999px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: rgba(15, 36, 75, 0.26);
  }

  .capture-card {
    padding: 24px 24px 20px;
    border-radius: 24px;
  }

  .transcript-input {
    min-height: 200px;
    font-size: 15.5px;
    line-height: 1.7;
  }

  .mic-button {
    width: 88px;
    height: 88px;
  }

  .mic-core {
    width: 62px;
    height: 62px;
  }

  .analyze-row {
    max-width: 420px;
  }

  .reveal-section {
    margin-top: 28px;
  }

  .processing-card {
    max-width: 400px;
    padding: 32px 28px 26px;
  }
}

/* Large desktop — balance column ratio */
@media (min-width: 1440px) {
  .page {
    max-width: 76rem;
    grid-template-columns: minmax(340px, 1fr) minmax(0, 1.6fr);
  }

  .hero {
    padding: 48px 40px;
  }

  .content {
    padding: 48px 40px;
  }
}
</style>
