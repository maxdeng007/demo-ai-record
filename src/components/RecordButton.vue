<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 'idle' | 'recording' | 'processing' | 'reviewing' | 'linking' | 'summarizing' | 'summarized'
  state: { type: String, default: 'idle' },
  elapsedSeconds: { type: Number, default: 0 },
  labels: { type: Object, required: true },
  // v2: when true, render without card chrome (border + shadow) so the dock
  // can sit at the bottom of the transcript card without looking like a
  // second card.
  inline: { type: Boolean, default: false },
  // 0..1, used by parent to drive the processing progress bar.
  processingProgress: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle'])

const WAVEFORM_BARS = Array.from({ length: 22 }, (_, i) => i)

const isRecording = computed(() => props.state === 'recording')
const isProcessing = computed(() => props.state === 'processing')
// Mic stays available for multi-round capture.
// We only lock during states where a transition is in-flight or mandatory modal
// interaction is open.
const isLocked = computed(() => ['processing', 'linking', 'summarizing'].includes(props.state))
const isDisabled = computed(() => isLocked.value)
const isGuideIdle = computed(() => props.inline && !isRecording.value && !isProcessing.value && !isLocked.value)

const formatted = computed(() => {
  const m = String(Math.floor(props.elapsedSeconds / 60)).padStart(2, '0')
  const s = String(props.elapsedSeconds % 60).padStart(2, '0')
  return `${m}:${s}`
})

const hint = computed(() => {
  if (isRecording.value) return props.labels.hintRecording
  if (isProcessing.value) return props.labels.hintProcessing ?? props.labels.hintStopped
  if (isLocked.value) return props.labels.hintStopped
  return props.labels.hintIdle
})

const ariaLabel = computed(() => (isRecording.value ? props.labels.ariaStop : props.labels.ariaStart))

const progressStyle = computed(() => {
  const pct = Math.max(0, Math.min(1, props.processingProgress)) * 100
  return { width: `${pct}%` }
})
</script>

<template>
  <div
    class="record-bar"
    :class="{
      'record-bar--inline': inline,
      'record-bar--recording': isRecording,
      'record-bar--processing': isProcessing,
      'record-bar--locked': isLocked && !isProcessing,
    }"
  >
    <div class="record-meta">
      <transition name="reveal">
        <div v-if="isRecording" class="timer-badge">
          <span class="timer-dot" />
          <span class="timer-value">{{ formatted }}</span>
          <span class="timer-tag">{{ labels.rec }}</span>
        </div>
      </transition>

      <transition name="reveal">
        <div v-if="isProcessing" class="processing-badge">
          <span class="processing-spinner" />
          <span class="processing-tag">{{ labels.processing ?? 'Finalizing…' }}</span>
        </div>
      </transition>

      <div class="record-wave">
        <template v-if="isRecording">
          <div class="waveform">
            <span v-for="bar in WAVEFORM_BARS" :key="bar" class="wave-bar" />
          </div>
        </template>
        <template v-else-if="isProcessing">
          <div class="progress-track">
            <div class="progress-fill" :style="progressStyle" />
          </div>
        </template>
        <template v-else>
          <div class="record-hint" :class="{ 'record-hint--stopped': isLocked, 'record-hint--guide': isGuideIdle }">
            <template v-if="isGuideIdle">
              <span class="record-hint-guide">{{ labels.hintGuide ?? 'Tap me' }}</span>
              <svg
                class="record-hint-arrow"
                viewBox="0 0 26 12"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 6c4.8-2.6 9.7-2.6 14.5 0" />
                <path d="M15.5 2.8L24 6l-8.5 3.2" />
              </svg>
            </template>
            <template v-else>{{ hint }}</template>
          </div>
        </template>
      </div>
    </div>

    <button
      type="button"
      class="mic-button"
      :class="{
        'mic-button--recording': isRecording,
        'mic-button--locked': isLocked,
      }"
      :aria-label="ariaLabel"
      :disabled="isDisabled"
      @click="emit('toggle')"
    >
      <span class="mic-ring mic-ring--1" />
      <span class="mic-ring mic-ring--2" />
      <span class="mic-ring mic-ring--3" />
      <span class="mic-core">
        <svg
          v-if="!isRecording"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="mic-icon"
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
        <span v-else class="stop-square" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.record-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(15, 36, 75, 0.08);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.04),
    0 14px 24px -22px rgba(15, 36, 75, 0.24);
  transition: border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
}

/* v2: when the dock sits inside the transcript card, drop the card chrome and
   become a flat bottom bar with a hairline divider on top. */
.record-bar--inline {
  border: none;
  border-top: 1px solid rgba(15, 36, 75, 0.06);
  border-radius: 0;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  box-shadow: none;
  padding: 12px 16px;
}

.record-bar--recording {
  border-color: rgba(244, 63, 94, 0.18);
  box-shadow:
    0 1px 2px rgba(15, 36, 75, 0.04),
    0 14px 24px -22px rgba(225, 29, 72, 0.26);
}

.record-bar--inline.record-bar--recording {
  border: none;
  border-top: 1px solid rgba(244, 63, 94, 0.14);
  background: linear-gradient(180deg, #fff7f8 0%, #fff 100%);
  box-shadow: none;
}

.record-bar--processing {
  border-color: rgba(99, 102, 241, 0.22);
}

.record-bar--inline.record-bar--processing {
  border: none;
  border-top: 1px solid rgba(99, 102, 241, 0.18);
  background: linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%);
}

.record-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.record-bar--inline:not(.record-bar--recording):not(.record-bar--processing):not(.record-bar--locked) .record-meta {
  justify-content: flex-end;
}

.timer-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(244, 63, 94, 0.07);
  border: 1px solid rgba(244, 63, 94, 0.14);
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

.timer-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
}

.timer-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: rgba(225, 29, 72, 0.8);
}

.processing-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 999px;
  color: #4338ca;
}

.processing-spinner {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1.5px solid rgba(99, 102, 241, 0.25);
  border-top-color: #6366f1;
  animation: processing-spin 0.9s linear infinite;
}

@keyframes processing-spin {
  to { transform: rotate(360deg); }
}

.processing-tag {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.85); }
}

.record-wave {
  min-height: 28px;
  display: flex;
  align-items: center;
  color: rgba(148, 163, 184, 1);
}

.record-bar--inline:not(.record-bar--recording):not(.record-bar--processing):not(.record-bar--locked) .record-wave {
  justify-content: flex-end;
}

.record-hint {
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
}

.record-hint--guide {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}

.record-hint-guide {
  font-weight: 600;
  color: rgba(148, 163, 184, 1);
}

.record-hint-arrow {
  width: 26px;
  height: 12px;
  color: rgba(148, 163, 184, 1);
  transform: translateY(0.5px) rotate(-2deg);
}

.record-hint--stopped {
  color: #1989fa;
  font-weight: 600;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 28px;
  width: 100%;
}

.wave-bar {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, #fb7185, #f43f5e);
  transform-origin: center;
  animation: voice-wave 900ms ease-in-out infinite;
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

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #818cf8, #6366f1);
  border-radius: 999px;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.45);
}

.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  background-size: 60% 100%;
  background-repeat: no-repeat;
  animation: progress-shimmer 1.4s ease-in-out infinite;
}

@keyframes progress-shimmer {
  0% { background-position: -50% 0; }
  100% { background-position: 150% 0; }
}

.mic-button {
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
}

/* The full chrome size is reserved for the standalone variant. Inline shrinks
   slightly so it doesn't dominate the transcript card footer. */
.record-bar:not(.record-bar--inline) .mic-button {
  width: 76px;
  height: 76px;
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

.mic-button:not(.mic-button--recording):not(.mic-button--locked)::before,
.mic-button:not(.mic-button--recording):not(.mic-button--locked)::after {
  animation: mic-ripple 2.6s ease-out infinite;
}

.mic-button:not(.mic-button--recording):not(.mic-button--locked)::after {
  animation-delay: 1.3s;
}

.mic-button--recording::before,
.mic-button--recording::after,
.mic-button--locked::before,
.mic-button--locked::after {
  display: none;
}

.mic-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mic-core {
  position: relative;
  z-index: 3;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 60%, #0a6fd9 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.44),
    inset 0 -3px 9px rgba(0, 0, 0, 0.12),
    0 8px 16px -10px rgba(25, 137, 250, 0.5);
  transition: transform 0.18s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.record-bar:not(.record-bar--inline) .mic-core {
  width: 54px;
  height: 54px;
}

.mic-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.record-bar:not(.record-bar--inline) .mic-icon {
  width: 22px;
  height: 22px;
}

.stop-square {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: #ffffff;
}

.record-bar:not(.record-bar--inline) .stop-square {
  width: 16px;
  height: 16px;
}

.mic-button:not(.mic-button--recording):not(.mic-button--locked) .mic-core {
  animation: mic-breath 2.8s ease-in-out infinite;
}

.mic-button:active:not(:disabled) .mic-core {
  transform: scale(0.94);
}

.mic-button--recording .mic-core {
  background: linear-gradient(135deg, #fb7185 0%, #f43f5e 60%, #e11d48 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.42),
    inset 0 -3px 8px rgba(0, 0, 0, 0.16),
    0 8px 16px -10px rgba(225, 29, 72, 0.42);
}

.mic-button--locked .mic-core {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 60%, #64748b 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -4px 10px rgba(0, 0, 0, 0.1),
    0 6px 14px -8px rgba(15, 23, 42, 0.3);
}

.mic-ring {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  pointer-events: none;
}

.mic-ring--1 {
  background: radial-gradient(circle at 50% 50%, rgba(25, 137, 250, 0.24), transparent 70%);
}

.mic-button--recording .mic-ring--1 {
  background: radial-gradient(circle at 50% 50%, rgba(225, 29, 72, 0.28), transparent 70%);
}

.mic-button--locked .mic-ring--1 {
  background: radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.18), transparent 70%);
}

.mic-button:not(.mic-button--recording):not(.mic-button--locked) .mic-ring--1 {
  animation: mic-idle-glow 2.8s ease-in-out infinite;
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
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

@keyframes mic-idle-glow {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.82; }
}

@keyframes mic-ripple {
  0% { opacity: 0; transform: scale(0.88); }
  20% { opacity: 0.5; }
  100% { opacity: 0; transform: scale(1.9); }
}

.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.reveal-enter-from,
.reveal-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
