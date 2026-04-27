<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Icon, showToast } from 'vant'

const props = defineProps({
  state: { type: String, default: 'collapsed' },
  aiOutput: { type: Object, default: null },
  locale: { type: String, default: 'zh' },
  labels: { type: Object, required: true },
  generatedAt: { type: Number, default: 0 },
})

const taskCreated = reactive({})
const emailExpanded = ref(false)

const isCollapsed = computed(() => props.state === 'collapsed')
const isAnalyzing = computed(() => props.state === 'analyzing')
const isReady = computed(() => props.state === 'ready' && !!props.aiOutput)
const generatedMeta = computed(() => {
  if (!isReady.value || !props.generatedAt) return ''
  const t = new Date(props.generatedAt).toLocaleTimeString(
    props.locale === 'zh' ? 'zh-CN' : 'en-US',
    { hour: '2-digit', minute: '2-digit', hour12: false },
  )
  return props.locale === 'zh' ? `刚刚生成 · ${t}` : `Generated · ${t}`
})

const summary = computed(() => {
  if (!props.aiOutput) return ''
  return props.locale === 'zh' ? props.aiOutput.summaryZh : props.aiOutput.summaryEn
})

const profileLabel = computed(() => {
  if (!props.aiOutput?.profile) return ''
  return props.locale === 'zh' ? props.aiOutput.profile.labelZh : props.aiOutput.profile.labelEn
})
const profileRows = computed(() => {
  if (!props.aiOutput?.profile) return []
  return props.locale === 'zh' ? props.aiOutput.profile.rowsZh : props.aiOutput.profile.rowsEn
})

const assetsLabel = computed(() => {
  if (!props.aiOutput?.assets) return ''
  return props.locale === 'zh' ? props.aiOutput.assets.labelZh : props.aiOutput.assets.labelEn
})
const assetsRows = computed(() => {
  if (!props.aiOutput?.assets) return []
  return props.locale === 'zh' ? props.aiOutput.assets.rowsZh : props.aiOutput.assets.rowsEn
})

const riskLabel = computed(() => {
  if (!props.aiOutput?.risk) return ''
  return props.locale === 'zh' ? props.aiOutput.risk.labelZh : props.aiOutput.risk.labelEn
})
const riskLevel = computed(() => {
  if (!props.aiOutput?.risk) return ''
  return props.locale === 'zh' ? props.aiOutput.risk.levelZh : props.aiOutput.risk.levelEn
})
const riskTarget = computed(() => {
  if (!props.aiOutput?.risk) return ''
  return props.locale === 'zh' ? props.aiOutput.risk.targetZh : props.aiOutput.risk.targetEn
})

const topics = computed(() => {
  if (!props.aiOutput) return []
  return props.locale === 'zh' ? props.aiOutput.topicsZh : props.aiOutput.topicsEn
})

const actions = computed(() => {
  if (!props.aiOutput?.actions) return []
  return props.aiOutput.actions.map((a) => ({
    id: a.id,
    text: props.locale === 'zh' ? a.textZh : a.textEn,
    due: props.locale === 'zh' ? a.dueZh : a.dueEn,
  }))
})

const emailDraft = computed(() => {
  if (!props.aiOutput) return ''
  return props.locale === 'zh' ? props.aiOutput.emailDraftZh : props.aiOutput.emailDraftEn
})

watch(
  () => props.aiOutput,
  () => {
    Object.keys(taskCreated).forEach((k) => delete taskCreated[k])
    emailExpanded.value = false
  },
)

function createTask(item) {
  if (taskCreated[item.id]) return
  taskCreated[item.id] = true
  showToast({
    message: props.labels.notifyTaskCreated,
    icon: 'success',
    className: 'save-notes-toast',
    position: 'middle',
    duration: 1300,
  })
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(emailDraft.value)
    showToast({
      message: props.labels.notifyEmailCopied,
      icon: 'success',
      className: 'save-notes-toast',
      position: 'middle',
      duration: 1300,
    })
  } catch {
    /* clipboard not available in this context */
  }
}
</script>

<template>
  <section class="summary-panel">
    <header class="summary-header">
      <div class="summary-eyebrow">
        <span class="sparkle">◆</span>
        {{ labels.eyebrow }}
      </div>
      <div v-if="generatedMeta" class="summary-meta">{{ generatedMeta }}</div>
    </header>

    <transition name="fade" mode="out-in">
      <!-- ───────── Collapsed (waiting for stop) ───────── -->
      <div v-if="isCollapsed" key="collapsed" class="summary-empty">
        <div class="empty-orb">
          <Icon name="guide-o" size="18" class="empty-wand-icon" />
        </div>
        <p class="empty-text">{{ labels.emptyText }}</p>
      </div>

      <!-- ───────── Analyzing ───────── -->
      <div v-else-if="isAnalyzing" key="analyzing" class="summary-analyzing">
        <div class="analyze-loader" aria-hidden="true">
          <span class="loader-ring loader-ring--outer" />
          <span class="loader-ring loader-ring--mid" />
          <span class="loader-core" />
          <span class="loader-glint loader-glint--1" />
          <span class="loader-glint loader-glint--2" />
        </div>
        <p class="analyze-title">{{ labels.analyzingTitle }}</p>
        <div class="analyze-subline">
          <span class="analyze-subline-dot" />
          <span class="analyze-subtitle">{{ labels.analyzingSubtitle }}</span>
        </div>
      </div>

      <!-- ───────── Ready ───────── -->
      <div v-else-if="isReady" key="ready" class="summary-ready">
        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--violet">
              <Icon name="comment-o" size="14" />
            </div>
            <div class="block-title">{{ labels.summaryHeading }}</div>
          </div>
          <p class="block-text">{{ summary }}</p>
        </article>

        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--emerald">
              <Icon name="contact" size="14" />
            </div>
            <div class="block-title">{{ profileLabel }}</div>
          </div>
          <dl class="kv-grid">
            <div v-for="row in profileRows" :key="row.k" class="kv-row">
              <dt>{{ row.k }}</dt>
              <dd>{{ row.v }}</dd>
            </div>
          </dl>
        </article>

        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--sky">
              <Icon name="balance-list-o" size="14" />
            </div>
            <div class="block-title">{{ assetsLabel }}</div>
          </div>
          <dl class="kv-grid">
            <div v-for="row in assetsRows" :key="row.k" class="kv-row">
              <dt>{{ row.k }}</dt>
              <dd>{{ row.v }}</dd>
            </div>
          </dl>
        </article>

        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--amber">
              <Icon name="warning-o" size="14" />
            </div>
            <div class="block-title">{{ riskLabel }}</div>
          </div>
          <div class="risk-row">
            <span class="risk-pill">{{ riskLevel }}</span>
            <span class="risk-target">{{ riskTarget }}</span>
          </div>
        </article>

        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--rose">
              <Icon name="label-o" size="14" />
            </div>
            <div class="block-title">{{ labels.topicsHeading }}</div>
          </div>
          <div class="topic-chips">
            <span v-for="t in topics" :key="t" class="topic-chip">{{ t }}</span>
          </div>
        </article>

        <article class="summary-block">
          <div class="block-head">
            <div class="block-icon block-icon--violet">
              <Icon name="todo-list-o" size="14" />
            </div>
            <div class="block-title">{{ labels.actionsHeading }}</div>
          </div>
          <ul class="action-list">
            <li v-for="(item, idx) in actions" :key="item.id" class="action-row">
              <div class="action-index">{{ idx + 1 }}</div>
              <div class="action-body">
                <div class="action-text">{{ item.text }}</div>
                <div v-if="item.due" class="action-due">
                  <Icon name="clock-o" size="11" /> {{ item.due }}
                </div>
              </div>
              <button
                type="button"
                class="action-btn"
                :class="{ 'action-btn--done': taskCreated[item.id] }"
                @click="createTask(item)"
              >
                <template v-if="taskCreated[item.id]">
                  <Icon name="success" size="11" /> {{ labels.added }}
                </template>
                <template v-else>{{ labels.createTask }}</template>
              </button>
            </li>
          </ul>
        </article>

        <article class="summary-block summary-block--email">
          <button type="button" class="email-toggle" @click="emailExpanded = !emailExpanded">
            <div class="block-head" style="margin: 0">
              <div class="block-icon block-icon--sky">
                <Icon name="envelop-o" size="14" />
              </div>
              <div class="block-title">{{ labels.emailHeading }}</div>
            </div>
            <Icon :name="emailExpanded ? 'arrow-up' : 'arrow-down'" size="14" class="email-chevron" />
          </button>
          <transition name="reveal">
            <div v-if="emailExpanded" class="email-body">
              <pre class="email-text">{{ emailDraft }}</pre>
              <div class="email-actions">
                <button type="button" class="copy-btn" @click="copyEmail">
                  <Icon name="completed" size="12" />
                  {{ labels.copyEmail }}
                </button>
              </div>
            </div>
          </transition>
        </article>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.summary-panel {
  padding: 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(15, 36, 75, 0.06);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.03),
    0 18px 36px -24px rgba(15, 36, 75, 0.18);
}

.summary-header {
  margin-bottom: 14px;
}

.summary-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #1989fa;
  text-transform: uppercase;
}

.sparkle {
  display: inline-block;
  transform: rotate(45deg);
  font-size: 8px;
}

.summary-meta {
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.01em;
}

/* ───────── Empty / Collapsed ───────── */
.summary-empty {
  padding: 36px 12px;
  text-align: center;
  color: #94a3b8;
}

.empty-orb {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  margin: 0 auto 10px;
  display: grid;
  place-items: center;
  background: #f8fafc;
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.empty-wand-icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.empty-text {
  font-size: 12px;
  line-height: 1.6;
  max-width: 28ch;
  margin: 0 auto;
  color: #94a3b8;
}

/* ───────── Analyzing ───────── */
.summary-analyzing {
  padding: 24px 8px 14px;
  text-align: center;
}

.analyze-loader {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
}

.loader-ring {
  position: absolute;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.loader-ring--outer {
  inset: 0;
  animation: loader-spin 5.4s linear infinite;
}

.loader-ring--mid {
  inset: 10px;
  border-color: rgba(59, 130, 246, 0.4);
  border-style: dashed;
  animation: loader-spin-reverse 3.8s linear infinite;
}

.loader-core {
  position: absolute;
  inset: 22px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 60%, #1d4ed8 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 10px 24px -14px rgba(37, 99, 235, 0.8);
  animation: loader-pulse 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.loader-glint {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.9);
  box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.12);
  animation: glint-float 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite alternate;
}

.loader-glint--1 {
  left: 8px;
  top: 12px;
}

.loader-glint--2 {
  right: 9px;
  bottom: 12px;
  animation-delay: 0.35s;
}

.analyze-title {
  margin: 4px 0 4px;
  font-size: 14.5px;
  font-weight: 650;
  color: #0b1f3a;
}

.analyze-subline {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.14);
}

.analyze-subline-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #60a5fa;
  animation: dot-blink 1s ease-in-out infinite;
}

.analyze-subtitle {
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  color: #64748b;
}

@keyframes loader-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes loader-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes loader-pulse {
  0%, 100% { transform: scale(0.94); }
  50% { transform: scale(1); }
}

@keyframes glint-float {
  from { transform: translateY(0) scale(0.92); opacity: 0.7; }
  to { transform: translateY(-2px) scale(1.06); opacity: 1; }
}

@keyframes dot-blink {
  0%, 100% { opacity: 0.45; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader-ring--outer,
  .loader-ring--mid,
  .loader-core,
  .loader-glint,
  .analyze-subline-dot {
    animation: none !important;
  }
}

/* ───────── Ready ───────── */
.summary-ready {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-block {
  padding: 12px 14px;
  border-radius: 14px;
  background: #fafcff;
  border: 1px solid rgba(15, 36, 75, 0.05);
  animation: slide-up 460ms ease both;
}

.summary-block:nth-child(1) { animation-delay: 0ms; }
.summary-block:nth-child(2) { animation-delay: 80ms; }
.summary-block:nth-child(3) { animation-delay: 160ms; }
.summary-block:nth-child(4) { animation-delay: 240ms; }
.summary-block:nth-child(5) { animation-delay: 320ms; }
.summary-block:nth-child(6) { animation-delay: 400ms; }
.summary-block:nth-child(7) { animation-delay: 480ms; }

@keyframes slide-up {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.block-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.block-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.block-icon--violet { background: #ede9fe; color: #6d28d9; }
.block-icon--emerald { background: #d1fae5; color: #047857; }
.block-icon--sky { background: #e0f2fe; color: #0369a1; }
.block-icon--amber { background: #fef3c7; color: #b45309; }
.block-icon--rose { background: #ffe4e6; color: #be123c; }

.block-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0f172a;
}

.block-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #334155;
}

.kv-grid {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px 10px;
}

.kv-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
  border-bottom: 1px dashed rgba(15, 36, 75, 0.08);
  padding-bottom: 6px;
}

.kv-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.kv-row dt {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

.kv-row dd {
  margin: 0;
  color: #0f172a;
  font-weight: 600;
}

.risk-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.risk-pill {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.risk-target {
  font-size: 12px;
  color: #475569;
  font-weight: 500;
}

.topic-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.topic-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #ede9fe;
  color: #5b21b6;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-row {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(15, 36, 75, 0.05);
}

.action-index {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #5bb4ff 0%, #1989fa 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.action-text {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.5;
}

.action-due {
  margin-top: 2px;
  font-size: 11px;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  border: none;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s, transform 0.15s;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn--done {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.summary-block--email {
  padding: 0;
  overflow: hidden;
}

.email-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.email-chevron {
  color: #94a3b8;
  transition: transform 0.2s;
}

.email-body {
  padding: 0 14px 14px;
}

.email-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 12.5px;
  line-height: 1.7;
  color: #334155;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px dashed rgba(15, 36, 75, 0.12);
}

.email-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.copy-btn {
  border: none;
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
}

.copy-btn:active {
  background: rgba(25, 137, 250, 0.18);
}

/* ───────── Transitions ───────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.32s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.28s ease, max-height 0.32s ease;
  overflow: hidden;
}
.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  max-height: 0;
}
.reveal-enter-to,
.reveal-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
