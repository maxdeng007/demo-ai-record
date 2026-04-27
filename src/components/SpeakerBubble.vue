<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  speaker: { type: Object, required: true },
  text: { type: String, required: true },
  partial: { type: Boolean, default: false },
  timestamp: { type: String, default: '' },
  align: { type: String, default: 'left' },
  editable: { type: Boolean, default: true },
  // v3: When a chunk arrives from the backend, parent staggers each bubble's
  // entrance animation by this amount so the paragraph "lands" with a soft
  // sequential motion rather than appearing all at once.
  entranceDelayMs: { type: Number, default: 0 },
})

const emit = defineEmits(['rename'])

const isEditing = ref(false)
const draftName = ref('')
const inputRef = ref(null)

// v3.5 palette — refined, elegant, paper-like. Bubbles use a very pale tint
// of the speaker color with a hairline border in the same hue, so the speaker
// identity comes mostly from the avatar + name accent rather than a loud
// bubble fill. No heavy shadows; the bubble reads as a calm card.
const COLOR_TOKENS = {
  violet: {
    bubbleBg: '#f6f3ff',
    bubbleBorder: 'rgba(124, 58, 237, 0.14)',
    avatarBg: '#ede9fe',
    avatarText: '#6d28d9',
    avatarRing: 'rgba(124, 58, 237, 0.10)',
  },
  emerald: {
    bubbleBg: '#f0faf4',
    bubbleBorder: 'rgba(16, 185, 129, 0.16)',
    avatarBg: '#d1fae5',
    avatarText: '#047857',
    avatarRing: 'rgba(16, 185, 129, 0.10)',
  },
  amber: {
    bubbleBg: '#fbf5e6',
    bubbleBorder: 'rgba(180, 83, 9, 0.18)',
    avatarBg: '#fef3c7',
    avatarText: '#a16207',
    avatarRing: 'rgba(180, 83, 9, 0.10)',
  },
  sky: {
    bubbleBg: '#f0f7fc',
    bubbleBorder: 'rgba(2, 132, 199, 0.16)',
    avatarBg: '#e0f2fe',
    avatarText: '#0369a1',
    avatarRing: 'rgba(2, 132, 199, 0.10)',
  },
  rose: {
    bubbleBg: '#fdf2f4',
    bubbleBorder: 'rgba(190, 18, 60, 0.16)',
    avatarBg: '#ffe4e6',
    avatarText: '#be123c',
    avatarRing: 'rgba(190, 18, 60, 0.10)',
  },
}

const tokens = computed(() => COLOR_TOKENS[props.speaker.color] ?? COLOR_TOKENS.violet)

// Avatar shows a number ("1") while the speaker is anonymous, and a single
// CJK character ("理") or 1-2 Latin initials once the speaker is renamed.
const initials = computed(() => {
  const name = props.speaker.name?.trim?.() ?? ''
  if (!name) return '?'
  // If the parent passed an explicit short avatar (used during anonymous
  // phase, e.g. "1"/"2"/"3"), prefer it.
  if (props.speaker.avatarText) return props.speaker.avatarText
  const cjk = /[\u4e00-\u9fa5]/
  if (cjk.test(name)) {
    return name.replace(/\s/g, '').slice(0, 1)
  }
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

// Brief flip animation when the speaker name changes (anonymous → real on
// link, or user manual rename).
const namePulseKey = ref(0)
watch(
  () => props.speaker?.name,
  (next, prev) => {
    if (prev && next && prev !== next) namePulseKey.value += 1
  },
)

// Same flip for the avatar character, in case it changes (e.g. "1" → "理").
const avatarPulseKey = ref(0)
watch(
  () => initials.value,
  (next, prev) => {
    if (prev && next && prev !== next) avatarPulseKey.value += 1
  },
)

const entranceStyle = computed(() => ({
  '--entrance-delay': `${props.entranceDelayMs}ms`,
}))

function startEdit() {
  if (!props.editable) return
  draftName.value = props.speaker.name
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function commitEdit() {
  const next = draftName.value.trim()
  if (next && next !== props.speaker.name) {
    emit('rename', next)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div
    class="bubble-row"
    :class="[`bubble-row--${props.align}`]"
    :style="entranceStyle"
  >
    <button
      type="button"
      class="avatar"
      :class="{ 'avatar--editable': props.editable }"
      :style="{ background: tokens.avatarBg, color: tokens.avatarText, boxShadow: `0 0 0 2px ${tokens.avatarRing}` }"
      :aria-label="speaker.name"
      :disabled="!props.editable"
      @click="startEdit"
    >
      <span class="avatar-initials" :key="avatarPulseKey">{{ initials }}</span>
    </button>

    <div class="bubble-stack">
      <div class="bubble-meta">
        <template v-if="isEditing">
          <input
            ref="inputRef"
            v-model="draftName"
            class="rename-input"
            :style="{ color: tokens.text }"
            maxlength="16"
            @keydown.enter.prevent="commitEdit"
            @keydown.esc.prevent="cancelEdit"
            @blur="commitEdit"
          />
        </template>
        <template v-else>
          <button
            type="button"
            class="speaker-name"
            :class="{ 'speaker-name--editable': props.editable }"
            :key="namePulseKey"
            :style="{ color: tokens.avatarText }"
            :disabled="!props.editable"
            @click="startEdit"
          >
            {{ speaker.name }}
          </button>
        </template>

        <span v-if="timestamp" class="timestamp">{{ timestamp }}</span>
      </div>

      <div
        class="bubble"
        :class="{ 'bubble--partial': partial }"
        :style="{
          background: tokens.bubbleBg,
          borderColor: tokens.bubbleBorder,
          color: '#0f172a',
        }"
      >
        <span class="bubble-text">{{ text }}</span>
        <span v-if="partial" class="caret" :style="{ background: tokens.avatarText }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bubble-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  width: 100%;
  /* v3: each bubble fades + slides in with the parent-supplied stagger delay
     so the paragraph "lands" sequentially when its chunk is returned. */
  animation: bubble-enter 0.5s cubic-bezier(0.2, 0.8, 0.25, 1) both;
  animation-delay: var(--entrance-delay, 0ms);
}

@keyframes bubble-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.bubble-row--right {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  cursor: default;
  transition: transform 0.15s, background-color 0.45s ease, color 0.45s ease, box-shadow 0.45s ease;
  -webkit-tap-highlight-color: transparent;
}

.avatar--editable {
  cursor: pointer;
}

.avatar--editable:active {
  transform: scale(0.94);
}

.avatar:disabled {
  cursor: default;
}

.avatar-initials {
  line-height: 1;
  display: inline-block;
  animation: name-flip 0.5s ease;
}

.bubble-stack {
  min-width: 0;
  max-width: calc(100% - 46px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.bubble-row--right .bubble-stack {
  align-items: flex-end;
}

.bubble-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  padding: 0 6px;
}

.speaker-name {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
  animation: name-flip 0.5s ease;
  text-transform: none;
}

.speaker-name--editable {
  cursor: pointer;
  position: relative;
}

.speaker-name--editable:hover {
  opacity: 0.78;
}

.speaker-name--editable::after {
  content: '✎';
  margin-left: 4px;
  font-size: 9px;
  opacity: 0;
  transition: opacity 0.15s;
}

.speaker-name--editable:hover::after {
  opacity: 0.55;
}

@keyframes name-flip {
  0% { opacity: 0.0; transform: translateY(-3px); }
  60% { opacity: 1; transform: translateY(0); }
  100% { opacity: 1; }
}

.rename-input {
  border: none;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  outline: 1.5px solid currentColor;
  width: 120px;
  font-family: inherit;
}

.timestamp {
  font-size: 10px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.bubble {
  position: relative;
  padding: 9px 13px 10px;
  border-radius: 11px;
  font-size: 13.5px;
  line-height: 1.6;
  letter-spacing: 0.005em;
  transition:
    background 0.45s ease,
    border-color 0.45s ease;
  word-break: break-word;
  max-width: 100%;
  border: 1px solid transparent;
}

.bubble-row--left .bubble {
  border-top-left-radius: 4px;
}

.bubble-row--right .bubble {
  border-top-right-radius: 4px;
}

.bubble-text {
  white-space: pre-wrap;
}

.caret {
  display: inline-block;
  width: 2px;
  height: 14px;
  margin-left: 2px;
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: caret-blink 1s step-end infinite;
}

@keyframes caret-blink {
  50% { opacity: 0; }
}

.bubble--partial {
  animation: bubble-pulse 1.6s ease-in-out infinite;
}

@keyframes bubble-pulse {
  0%, 100% { opacity: 0.92; }
  50% { opacity: 1; }
}
</style>
