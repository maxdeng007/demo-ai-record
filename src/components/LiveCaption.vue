<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Currently streamed text for the in-flight chunk.
  text: { type: String, default: '' },
  // 'streaming' = audio buffer is filling, text is growing (cursor blinks).
  // 'analyzing' = (Stop-time only) tail flush of the very last chunk.
  // 'idle'      = nothing to display.
  state: { type: String, default: 'idle' },
  labels: {
    type: Object,
    default: () => ({
      liveTag: '· 实时识别',
      analyzingTag: '正在分析这一段…',
    }),
  },
  // v3.5: when non-empty, render a small chip on the right side of the
  // header indicating that previously-closed chunks are still being analyzed
  // in parallel — i.e. the live recording pipeline is actively producing
  // backend round-trips while the caption keeps streaming.
  pipelineHint: { type: String, default: '' },
})

const isStreaming = computed(() => props.state === 'streaming')
const isAnalyzing = computed(() => props.state === 'analyzing')
const isVisible = computed(() => props.state !== 'idle')
const showPipelineChip = computed(() => isStreaming.value && !!props.pipelineHint)
</script>

<template>
  <transition name="caption">
    <div
      v-if="isVisible"
      class="live-caption"
      :class="{ 'live-caption--analyzing': isAnalyzing }"
    >
      <div class="caption-meta">
        <span
          class="caption-dot"
          :class="{
            'caption-dot--streaming': isStreaming,
            'caption-dot--analyzing': isAnalyzing,
          }"
        />
        <span class="caption-tag">
          {{ isAnalyzing ? labels.analyzingTag : labels.liveTag }}
        </span>

        <transition name="chip">
          <span v-if="showPipelineChip" class="pipeline-chip">
            <span class="pipeline-chip-spinner" aria-hidden="true" />
            <span class="pipeline-chip-text">{{ pipelineHint }}</span>
          </span>
        </transition>
      </div>
      <p class="caption-text">
        <span class="caption-content">{{ text }}</span>
        <span v-if="isStreaming" class="caption-cursor" aria-hidden="true" />
      </p>
    </div>
  </transition>
</template>

<style scoped>
.live-caption {
  margin: 8px 10px 2px;
  padding: 10px 14px 12px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.18);
  position: relative;
  overflow: hidden;
}

.live-caption--analyzing {
  background: rgba(238, 242, 255, 0.9);
  border-color: rgba(99, 102, 241, 0.18);
}

.caption-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.caption-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #94a3b8;
  flex-shrink: 0;
}

.caption-dot--streaming {
  background: #f43f5e;
  animation: dot-pulse 1.6s ease-out infinite;
}

.caption-dot--analyzing {
  background: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.18);
  animation: dot-soft-pulse 1.4s ease-in-out infinite;
}

@keyframes dot-pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
  70% { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

@keyframes dot-soft-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.88); }
}

.caption-tag {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #64748b;
  flex-shrink: 0;
}

.live-caption--analyzing .caption-tag {
  color: #4338ca;
}

/* Right-side pipeline chip — communicates parallel backstage analysis. */
.pipeline-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 2px 8px 2px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(99, 102, 241, 0.16);
  color: #4f46e5;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.pipeline-chip-spinner {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 1.2px solid rgba(99, 102, 241, 0.28);
  border-top-color: #6366f1;
  animation: pipeline-spin 0.95s linear infinite;
}

.pipeline-chip-text {
  line-height: 1;
}

@keyframes pipeline-spin {
  to { transform: rotate(360deg); }
}

.caption-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #475569;
  font-style: italic;
  letter-spacing: 0.005em;
  min-height: 1.65em;
}

.live-caption--analyzing .caption-text {
  color: #312e81;
  font-style: normal;
  opacity: 0.92;
}

.caption-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.caption-cursor {
  display: inline-block;
  width: 2px;
  height: 0.95em;
  margin-left: 2px;
  background: currentColor;
  vertical-align: text-bottom;
  animation: cursor-blink 1.05s steps(2, jump-none) infinite;
  border-radius: 1px;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ───────── Enter / leave transitions ───────── */
.caption-enter-active {
  transition:
    opacity 0.32s ease,
    transform 0.4s cubic-bezier(0.2, 0.8, 0.25, 1);
}
.caption-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s cubic-bezier(0.4, 0, 0.6, 1);
}
.caption-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.caption-leave-to {
  opacity: 0;
  transform: translateY(-3px) scale(0.99);
}

.chip-enter-active,
.chip-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s cubic-bezier(0.2, 0.8, 0.25, 1);
}
.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: translateY(-2px) scale(0.92);
}
</style>
