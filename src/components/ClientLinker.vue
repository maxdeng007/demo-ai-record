<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from 'vant'
import { searchClients } from '../data/mockDialog.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  extractedClient: { type: Object, default: null },
  clients: { type: Array, default: () => [] },
  locale: { type: String, default: 'zh' },
  labels: { type: Object, required: true },
  // v3: number of speakers detected by chunked diarization. Used to render a
  // small "auto-attribution" note in the modal. Roles flip from anonymous
  // 说话人 N → real names the moment the user confirms the link.
  speakerCount: { type: Number, default: 0 },
})

const emit = defineEmits(['link', 'cancel'])

// 'existing' | 'new'
const tab = ref('existing')

// Selection in the "existing" tab.
const selectedClientId = ref(null)
const searchQuery = ref('')

// Form state for the "new" tab.
const newName = ref('')
const newIndustry = ref('')

const matchedClient = computed(() => {
  if (!props.extractedClient?.matchClientId) return null
  return props.clients.find((c) => c.id === props.extractedClient.matchClientId) ?? null
})

const filteredClients = computed(() => {
  // The matched client is always shown at the top via its own card, so we
  // exclude it from the regular list to avoid duplication.
  const matched = matchedClient.value
  const list = searchClients(searchQuery.value, props.locale)
  return matched ? list.filter((c) => c.id !== matched.id) : list
})

const extractedName = computed(() => {
  if (!props.extractedClient) return ''
  return props.locale === 'zh' ? props.extractedClient.nameZh : props.extractedClient.nameEn
})

const extractedHint = computed(() => {
  if (!props.extractedClient) return ''
  return props.locale === 'zh' ? props.extractedClient.hintZh : props.extractedClient.hintEn
})

const confidencePct = computed(() => {
  const c = props.extractedClient?.confidence ?? 0
  return Math.round(c * 100)
})

const canConfirmExisting = computed(() => Boolean(selectedClientId.value))
const canConfirmNew = computed(() => Boolean(newName.value.trim()))

// On open, reset state and prefill the create-new form.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    tab.value = 'existing'
    searchQuery.value = ''
    // Pre-select the matched client so that the user can confirm in one tap if
    // the suggestion is correct (which it usually will be in the demo).
    selectedClientId.value = props.extractedClient?.matchClientId ?? null
    newName.value = extractedName.value
    newIndustry.value = ''
    // Prevent body scroll while modal is up.
    nextTick(() => {
      document.body.style.overflow = 'hidden'
    })
  },
  { immediate: true },
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) document.body.style.overflow = ''
  },
)

// Ensure page scrolling is always restored even if the modal is unmounted
// while still open (e.g. parent state transitions).
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function pickExisting(clientId) {
  selectedClientId.value = clientId
}

function localizedClientName(client) {
  return props.locale === 'zh' ? client.nameZh : client.nameEn
}

function localizedClientTags(client) {
  return props.locale === 'zh' ? client.tagsZh : client.tagsEn
}

function localizedClientLastSeen(client) {
  return props.locale === 'zh' ? client.lastSeenZh : client.lastSeenEn
}

function confirmExisting() {
  if (!canConfirmExisting.value) return
  const client = props.clients.find((c) => c.id === selectedClientId.value)
  if (!client) return
  emit('link', { type: 'existing', client })
}

function confirmNew() {
  if (!canConfirmNew.value) return
  const newClient = {
    id: `new-${Date.now()}`,
    nameZh: newName.value.trim(),
    nameEn: newName.value.trim(),
    tagsZh: ['新客户'],
    tagsEn: ['New'],
    lastSeenZh: '今天',
    lastSeenEn: 'Today',
    industryZh: newIndustry.value.trim() || '财务咨询',
    industryEn: newIndustry.value.trim() || 'Financial Consultation',
    isNew: true,
  }
  emit('link', { type: 'new', client: newClient })
}

function cancelLinking() {
  emit('cancel')
}

// Block Escape: this modal is intentionally non-dismissible. Linking is a
// required step in the v2 workflow — the only exits are "link existing" or
// "create new".
function blockEscape(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
  }
}
</script>

<template>
  <transition name="linker">
    <div
      v-if="open"
      class="linker-backdrop"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      @keydown="blockEscape"
    >
      <div class="linker-card" @click.stop>
        <header class="linker-head">
          <div class="linker-eyebrow">
            <span class="linker-spark">◆</span>
            {{ labels.eyebrow }}
          </div>
          <h2 class="linker-title">{{ labels.title }}</h2>

          <div v-if="extractedClient" class="extracted-chip">
            <Icon name="user-circle-o" size="14" />
            <span class="extracted-chip__label">{{ labels.detected }}</span>
            <span class="extracted-chip__name">{{ extractedName }}</span>
            <span v-if="extractedHint" class="extracted-chip__hint">· {{ extractedHint }}</span>
            <span v-if="confidencePct" class="extracted-chip__conf">· {{ confidencePct }}%</span>
          </div>

          <div v-if="speakerCount > 0 && labels.speakerNote" class="speaker-note">
            <Icon name="friends-o" size="12" />
            <span>{{ labels.speakerNote }}</span>
          </div>
        </header>

        <div class="linker-tabs" role="tablist">
          <button
            type="button"
            class="linker-tab"
            :class="{ 'linker-tab--active': tab === 'existing' }"
            role="tab"
            :aria-selected="tab === 'existing'"
            @click="tab = 'existing'"
          >
            <Icon name="friends-o" size="13" />
            {{ labels.tabExisting }}
          </button>
          <button
            type="button"
            class="linker-tab"
            :class="{ 'linker-tab--active': tab === 'new' }"
            role="tab"
            :aria-selected="tab === 'new'"
            @click="tab = 'new'"
          >
            <Icon name="add-o" size="13" />
            {{ labels.tabNew }}
          </button>
        </div>

        <!-- Existing tab -->
        <div v-if="tab === 'existing'" class="linker-body">
          <!-- Top match card -->
          <button
            v-if="matchedClient"
            type="button"
            class="match-card"
            :class="{ 'match-card--active': selectedClientId === matchedClient.id }"
            @click="pickExisting(matchedClient.id)"
          >
            <div class="match-card__badge">
              <Icon name="award-o" size="12" />
              {{ labels.suggested }}
              <span v-if="confidencePct" class="match-card__conf">· {{ confidencePct }}%</span>
            </div>
            <div class="match-card__name">{{ localizedClientName(matchedClient) }}</div>
            <div class="match-card__meta">
              <span v-for="t in localizedClientTags(matchedClient)" :key="t" class="match-card__tag">{{ t }}</span>
              <span class="match-card__lastseen">· {{ localizedClientLastSeen(matchedClient) }}</span>
            </div>
            <Icon
              v-if="selectedClientId === matchedClient.id"
              name="success"
              size="16"
              class="match-card__check"
            />
          </button>

          <div class="search-row">
            <Icon name="search" size="14" class="search-row__icon" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="labels.searchPlaceholder"
              class="search-row__input"
            />
          </div>

          <div class="client-list">
            <button
              v-for="c in filteredClients"
              :key="c.id"
              type="button"
              class="client-item"
              :class="{ 'client-item--active': selectedClientId === c.id }"
              @click="pickExisting(c.id)"
            >
              <div class="client-item__name">{{ localizedClientName(c) }}</div>
              <div class="client-item__meta">
                <span v-for="t in localizedClientTags(c)" :key="t" class="client-item__tag">{{ t }}</span>
                <span class="client-item__lastseen">· {{ localizedClientLastSeen(c) }}</span>
              </div>
              <Icon
                v-if="selectedClientId === c.id"
                name="success"
                size="14"
                class="client-item__check"
              />
            </button>
            <div v-if="!filteredClients.length && !matchedClient" class="empty-search">
              {{ labels.emptySearch }}
            </div>
          </div>
        </div>

        <!-- New tab -->
        <div v-else class="linker-body">
          <p class="new-hint">{{ labels.newHint }}</p>
          <label class="form-row">
            <span class="form-label">{{ labels.nameLabel }}</span>
            <input
              v-model="newName"
              type="text"
              :placeholder="labels.namePlaceholder"
              class="form-input"
              maxlength="40"
            />
          </label>
          <label class="form-row">
            <span class="form-label">{{ labels.industryLabel }}</span>
            <input
              v-model="newIndustry"
              type="text"
              :placeholder="labels.industryPlaceholder"
              class="form-input"
              maxlength="40"
            />
          </label>
        </div>

        <!-- Footer / non-dismissible note -->
        <footer class="linker-foot">
          <div class="required-note">
            <Icon name="info-o" size="12" />
            {{ labels.requiredNote }}
          </div>
          <div class="footer-actions">
            <button
              type="button"
              class="cancel-text-btn"
              @click="cancelLinking"
            >
              {{ labels.cancel }}
            </button>
            <button
              v-if="tab === 'existing'"
              type="button"
              class="confirm-btn"
              :disabled="!canConfirmExisting"
              @click="confirmExisting"
            >
              <Icon name="link-o" size="14" />
              {{ labels.confirmExisting }}
            </button>
            <button
              v-else
              type="button"
              class="confirm-btn"
              :disabled="!canConfirmNew"
              @click="confirmNew"
            >
              <Icon name="add-o" size="14" />
              {{ labels.confirmNew }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.linker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 16px;
}

.linker-card {
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 22px;
  box-shadow:
    0 30px 60px -30px rgba(15, 36, 75, 0.5),
    0 0 0 1px rgba(15, 36, 75, 0.04);
  overflow: hidden;
}

.linker-head {
  padding: 14px 18px 10px;
  background: linear-gradient(180deg, #fafcff 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(15, 36, 75, 0.06);
}

.linker-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #1989fa;
  text-transform: uppercase;
}

.linker-spark {
  display: inline-block;
  transform: rotate(45deg);
  font-size: 8px;
}

.linker-title {
  margin: 5px 0 3px;
  font-size: 16px;
  font-weight: 700;
  color: #0b1f3a;
  letter-spacing: -0.01em;
}

.extracted-chip {
  margin-top: 8px;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.22);
  border-radius: 999px;
  color: #4338ca;
  font-size: 11px;
  font-weight: 500;
}

.extracted-chip__label {
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 10px;
  margin-right: 2px;
  color: #6366f1;
}

.extracted-chip__name {
  font-weight: 700;
  color: #312e81;
}

.extracted-chip__hint,
.extracted-chip__conf {
  color: rgba(67, 56, 202, 0.7);
}

.speaker-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.07);
  border: 1px solid rgba(16, 185, 129, 0.18);
  color: #047857;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.005em;
  line-height: 1.35;
}

.linker-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 14px 0;
  border-bottom: 1px solid rgba(15, 36, 75, 0.06);
  background: #ffffff;
}

.linker-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s, border-color 0.2s;
  position: relative;
  bottom: -1px;
}

.linker-tab--active {
  color: #1989fa;
  border-bottom-color: #1989fa;
}

.linker-body {
  flex: 1;
  min-height: 0;
  padding: 14px 16px 6px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Match card */
.match-card {
  position: relative;
  text-align: left;
  border: 1.5px solid rgba(99, 102, 241, 0.32);
  border-radius: 14px;
  padding: 12px 36px 12px 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(56, 189, 248, 0.04) 100%);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s, border-color 0.2s;
}

.match-card:active {
  background: rgba(99, 102, 241, 0.1);
}

.match-card--active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}

.match-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #4338ca;
  text-transform: uppercase;
}

.match-card__conf {
  font-weight: 600;
  color: rgba(67, 56, 202, 0.7);
  letter-spacing: 0.02em;
  text-transform: none;
}

.match-card__name {
  margin-top: 4px;
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
}

.match-card__meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #475569;
}

.match-card__tag {
  background: rgba(255, 255, 255, 0.85);
  padding: 1px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 11px;
  border: 1px solid rgba(15, 36, 75, 0.06);
}

.match-card__lastseen {
  color: #94a3b8;
}

.match-card__check {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6366f1;
}

/* Search */
.search-row {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.search-row__icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
}

.search-row__input {
  width: 100%;
  border: 1px solid rgba(15, 36, 75, 0.1);
  border-radius: 12px;
  padding: 9px 12px 9px 34px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
}

.search-row__input:focus {
  border-color: rgba(25, 137, 250, 0.5);
  background: #ffffff;
}

/* Client list */
.client-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.client-item {
  position: relative;
  text-align: left;
  border: 1px solid rgba(15, 36, 75, 0.08);
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 30px 10px 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.18s, background 0.18s;
}

.client-item:active {
  background: #f8fafc;
}

.client-item--active {
  border-color: rgba(25, 137, 250, 0.45);
  background: rgba(25, 137, 250, 0.06);
}

.client-item__name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.client-item__meta {
  margin-top: 2px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #475569;
}

.client-item__tag {
  background: #f1f5f9;
  border-radius: 999px;
  padding: 1px 7px;
  font-weight: 600;
}

.client-item__lastseen {
  color: #94a3b8;
}

.client-item__check {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #1989fa;
}

.empty-search {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 20px 0;
}

/* New form */
.new-hint {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0 4px;
  line-height: 1.55;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #475569;
  text-transform: uppercase;
}

.form-input {
  width: 100%;
  border: 1px solid rgba(15, 36, 75, 0.1);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
}

.form-input:focus {
  border-color: rgba(25, 137, 250, 0.5);
  background: #ffffff;
}

/* Footer */
.linker-foot {
  border-top: 1px solid rgba(15, 36, 75, 0.06);
  padding: 10px 16px 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.required-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cancel-text-btn {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.cancel-text-btn:active {
  color: #475569;
}

.confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 8px 18px -10px rgba(25, 137, 250, 0.7);
  transition: transform 0.15s, box-shadow 0.2s;
}

.confirm-btn:disabled {
  background: #cbd5e1;
  color: #ffffff;
  box-shadow: none;
  cursor: not-allowed;
}

.confirm-btn:not(:disabled):active {
  transform: translateY(0.5px);
  box-shadow: 0 4px 10px -8px rgba(25, 137, 250, 0.7);
}

/* Transition */
.linker-enter-active,
.linker-leave-active {
  transition: opacity 0.22s ease;
}
.linker-enter-from,
.linker-leave-to {
  opacity: 0;
}

.linker-enter-active .linker-card,
.linker-leave-active .linker-card {
  transition: transform 0.26s ease, opacity 0.22s ease;
}
.linker-enter-from .linker-card,
.linker-leave-to .linker-card {
  transform: translateY(8px) scale(0.985);
  opacity: 0;
}
</style>
