<script setup>
import { ref, watch } from 'vue'
import { Locale } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import enUS from 'vant/es/locale/lang/en-US'
import CounsellorMeeting from './views/CounsellorMeeting.vue'

const locale = ref('zh')

watch(
  locale,
  (code) => {
    document.documentElement.lang = code === 'zh' ? 'zh-CN' : 'en'
    Locale.use(code === 'zh' ? 'zh-CN' : 'en-US', code === 'zh' ? zhCN : enUS)
  },
  { immediate: true },
)
</script>

<template>
  <main class="app-shell">
    <div class="page">
      <header class="page-topbar">
        <div class="brand">
          <span class="brand-mark">AI·CFP</span>
          <span class="brand-divider" aria-hidden="true">·</span>
          <span class="brand-name">{{ locale === 'zh' ? '理财咨询助手' : 'Counsellor Copilot' }}</span>
        </div>
        <div class="lang-toggle" role="group">
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
      </header>

      <CounsellorMeeting :locale="locale" />
    </div>
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
}

.page-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(247, 249, 253, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(15, 36, 75, 0.05);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #0f172a;
}

.brand-mark {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #ffffff;
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  padding: 4px 8px;
  border-radius: 999px;
  box-shadow: 0 6px 14px -8px rgba(25, 137, 250, 0.7);
}

.brand-divider {
  color: #cbd5e1;
}

.brand-name {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.lang-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
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
  transition: color 0.2s, background 0.2s, box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.lang-toggle__btn--active {
  background: linear-gradient(135deg, #3ea3ff 0%, #1989fa 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px -4px rgba(25, 137, 250, 0.55);
}

.lang-toggle__btn:not(.lang-toggle__btn--active):active {
  color: #1989fa;
}

@media (min-width: 900px) {
  .page {
    max-width: 1080px;
    background: #ffffff;
    box-shadow: 0 30px 60px -40px rgba(15, 36, 75, 0.25);
  }
  .page-topbar {
    padding: 14px 26px;
  }
}
</style>

<style>
/* Global toast tweak — keep the same class the rest of the demo uses. */
.save-notes-toast {
  border-radius: 14px !important;
  font-size: 13px !important;
  padding: 10px 14px !important;
  box-shadow: 0 18px 40px -18px rgba(15, 36, 75, 0.4) !important;
}
</style>
