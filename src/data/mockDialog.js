// Mock dialog scripts for the Counsellor Meeting demo (v3).
//
// v3 changes vs v2:
// - Architecture switched to chunked diarization. The backend receives audio
//   in paragraph-sized chunks (ended by VAD silence), runs ASR + speaker
//   diarization, and returns already-attributed turns. The UI shows a
//   streaming caption preview while audio is buffered locally, then replaces
//   it with the diarized bubbles when each chunk returns from the backend.
// - No more live A/B → final reconciliation. Each segment carries a single
//   `speakerId` (A/B/C) from the start.
// - During recording, bubbles render with anonymous labels "说话人 N" (= the
//   speaker's `anonNumber`). After the user links a client in the linking
//   step, all bubbles flip to real roles/names with a name-flip animation.
// - `chunks` groups segment indices into paragraphs, each with
//   `processingMs` simulating the backend round-trip latency for that chunk.

// ─────────────────────────── Mock CRM ───────────────────────────

export const MOCK_CLIENTS = [
  {
    id: 'c-wang',
    nameZh: '王女士',
    nameEn: 'Mrs. Wang',
    tagsZh: ['VIP', '退休规划'],
    tagsEn: ['VIP', 'Retirement'],
    lastSeenZh: '上次见面：3 个月前',
    lastSeenEn: 'Last seen: 3 months ago',
    industryZh: '财富管理',
    industryEn: 'Wealth Management',
  },
  {
    id: 'c-li-family',
    nameZh: '李先生 & 李太太',
    nameEn: 'Mr. & Mrs. Li',
    tagsZh: ['家庭客户', '教育金'],
    tagsEn: ['Family', 'Education'],
    lastSeenZh: '上次见面：6 周前',
    lastSeenEn: 'Last seen: 6 weeks ago',
    industryZh: '家庭财务',
    industryEn: 'Family Finance',
  },
  {
    id: 'c-zhang',
    nameZh: '张总',
    nameEn: 'Mr. Zhang',
    tagsZh: ['企业主', '资产配置'],
    tagsEn: ['Business Owner', 'Allocation'],
    lastSeenZh: '上次见面：2 周前',
    lastSeenEn: 'Last seen: 2 weeks ago',
    industryZh: '企业金融',
    industryEn: 'Corporate Finance',
  },
  {
    id: 'c-chen',
    nameZh: '陈博士',
    nameEn: 'Dr. Chen',
    tagsZh: ['新客户'],
    tagsEn: ['New'],
    lastSeenZh: '尚未见面',
    lastSeenEn: 'Not yet met',
    industryZh: '医疗专业',
    industryEn: 'Healthcare',
  },
  {
    id: 'c-zhou',
    nameZh: '周先生',
    nameEn: 'Mr. Zhou',
    tagsZh: ['长期客户', '保险'],
    tagsEn: ['Long-term', 'Insurance'],
    lastSeenZh: '上次见面：1 个月前',
    lastSeenEn: 'Last seen: 1 month ago',
    industryZh: '保险规划',
    industryEn: 'Insurance Planning',
  },
]

// ─────────────────────────── Scripts ───────────────────────────

export const SCRIPTS = [
  // ────────── 1. Retirement planning (2 speakers, 3 chunks) ──────────
  {
    id: 'retirement',
    // Title and client are NOT shown until the linking step. These describe
    // the meeting *as it will look once linked*, so we can render the
    // post-link header.
    scenario: {
      titleZh: '退休规划咨询',
      titleEn: 'Retirement Planning Consultation',
      contextZh: '财富管理 · 长期规划',
      contextEn: 'Wealth Management · Long-term Planning',
    },

    // Speakers are listed in the order they first appear during the
    // recording, which determines their anonymous number (说话人 1/2/3).
    speakers: [
      { id: 'A', anonNumber: 1, defaultNameZh: '理财顾问', defaultNameEn: 'Counsellor', role: 'counsellor', color: 'violet' },
      { id: 'B', anonNumber: 2, defaultNameZh: '客户·王女士', defaultNameEn: 'Mrs. Wang', role: 'client', color: 'emerald' },
    ],

    // Each segment: who said it (already known, post-diarization), when it
    // starts within its chunk, what they said.
    segments: [
      { speakerId: 'A', delayMs: 400, textZh: '您好王女士，欢迎来到今天的财务咨询。我们今天主要想聊一下您的退休规划和资产配置。', textEn: "Hi Mrs. Wang, welcome to today's consultation. I'd like to focus on your retirement planning and portfolio." },
      { speakerId: 'B', delayMs: 700, textZh: '好的。我今年 40 岁，希望 60 岁就能退休，每月生活费大概需要两万元左右。', textEn: "Sure. I'm 40 now, hoping to retire at 60, with about 20K a month for living expenses." },
      { speakerId: 'A', delayMs: 600, textZh: '了解。您现在的资产情况大概是什么样？方便简单介绍一下吗？', textEn: 'Got it. Could you walk me through your current asset picture?' },

      { speakerId: 'B', delayMs: 600, textZh: '现金存款大约 80 万，股票账户 50 万，自住房一套，另外还有一套出租房，每月租金 8000 元。', textEn: 'About 800K in cash, 500K in equities, one self-occupied home, plus a rental that brings in 8K a month.' },
      { speakerId: 'A', delayMs: 500, textZh: '不错，资产结构比较均衡。那您对投资风险的承受度怎么样？', textEn: 'Nicely diversified. How would you describe your risk tolerance?' },
      { speakerId: 'B', delayMs: 700, textZh: '中等偏低吧。我不希望本金有太大波动，但可以接受年化 6 到 8 个点的目标。', textEn: "Moderate to low. I don't want big swings in principal, but I'd target 6 to 8 percent annual return." },

      { speakerId: 'A', delayMs: 600, textZh: '明白。那我建议我们做一份详细的退休规划方案，包括资产配置、保险补充和税务优化三个部分。', textEn: "Understood. I'd suggest a full retirement plan covering allocation, insurance gaps, and tax optimization." },
      { speakerId: 'B', delayMs: 700, textZh: '好的，那麻烦您下周给我一份完整的方案，我和先生一起看一下。', textEn: 'Sounds good. Please send me a complete proposal next week so my husband and I can review it together.' },
      { speakerId: 'A', delayMs: 500, textZh: '没问题，我会在周三前发到您邮箱，并约一个时间电话跟进。', textEn: "No problem. I'll have it in your inbox by Wednesday and will set up a call to follow up." },
    ],

    // Backend returns chunks one at a time as the user keeps recording.
    // Each chunk = one paragraph ending at a natural silence.
    // v3.5: processingMs is intentionally long enough that each chunk's
    // analysis is still in flight while the NEXT chunk's caption is already
    // streaming. That overlap is the whole point — the user sees bubbles drop
    // in mid-stream while live transcription keeps moving.
    chunks: [
      { segmentIndices: [0, 1, 2], processingMs: 1100 },
      { segmentIndices: [3, 4, 5], processingMs: 950 },
      { segmentIndices: [6, 7, 8], processingMs: 1000 },
    ],

    extractedClient: {
      nameZh: '王女士',
      nameEn: 'Mrs. Wang',
      hintZh: '从「您好王女士」识别',
      hintEn: 'Detected from "Hi Mrs. Wang"',
      matchClientId: 'c-wang',
      confidence: 0.92,
    },

    aiOutput: {
      summaryZh: '客户王女士今年 40 岁，目标 60 岁退休，月需求 2 万元。当前资产较为均衡，包含现金、股票、自住房和租金收入。客户偏好稳健投资，期望年化 6-8% 收益。下一步是一周内交付完整退休规划方案。',
      summaryEn: 'Mrs. Wang, age 40, aims to retire at 60 with a monthly need of 20K. Her assets are well-balanced across cash, equities, primary residence, and rental income. She prefers stable returns at 6-8% annually. Next step: deliver a full retirement plan within one week.',
      profile: {
        labelZh: '客户画像',
        labelEn: 'Client Profile',
        rowsZh: [
          { k: '当前年龄', v: '40 岁' },
          { k: '退休目标', v: '60 岁' },
          { k: '月度需求', v: '约 ¥20,000' },
        ],
        rowsEn: [
          { k: 'Current Age', v: '40' },
          { k: 'Retirement Goal', v: '60' },
          { k: 'Monthly Need', v: '~¥20,000' },
        ],
      },
      assets: {
        labelZh: '资产盘点',
        labelEn: 'Asset Snapshot',
        rowsZh: [
          { k: '现金存款', v: '¥800,000' },
          { k: '股票账户', v: '¥500,000' },
          { k: '自住房', v: '1 套' },
          { k: '出租房', v: '月租 ¥8,000' },
        ],
        rowsEn: [
          { k: 'Cash Deposit', v: '¥800,000' },
          { k: 'Equities', v: '¥500,000' },
          { k: 'Primary Home', v: '1 unit' },
          { k: 'Rental Property', v: '¥8,000 / mo' },
        ],
      },
      risk: {
        labelZh: '风险偏好',
        labelEn: 'Risk Profile',
        levelZh: '中等偏低',
        levelEn: 'Moderate-Low',
        targetZh: '年化 6%-8%',
        targetEn: '6%-8% annual',
      },
      topicsZh: ['退休规划', '资产配置', '保险补充', '税务优化'],
      topicsEn: ['Retirement Planning', 'Asset Allocation', 'Insurance Gaps', 'Tax Optimization'],
      actions: [
        { id: 'a1', textZh: '一周内交付完整退休规划方案', textEn: 'Deliver full retirement plan within one week', dueZh: '下周三', dueEn: 'Next Wed' },
        { id: 'a2', textZh: '评估保险补充缺口', textEn: 'Assess insurance coverage gaps', dueZh: '本月内', dueEn: 'This month' },
        { id: 'a3', textZh: '安排下次跟进会议', textEn: 'Schedule next follow-up meeting', dueZh: '两周内', dueEn: 'Within 2 weeks' },
      ],
      emailDraftZh:
        '王女士您好，\n\n感谢今天与您的会谈。我们就您的退休规划做了初步沟通——以 60 岁退休、月度生活费 2 万元为目标，结合您现有的现金、股票及租金收入，整体资产结构较为稳健。\n\n下一步我会在周三前为您整理一份完整的退休规划方案，涵盖资产配置、保险补充及税务优化三个方向，并约一个电话向您和先生一起讲解。\n\n如有任何疑问，欢迎随时联系。\n\n祝好',
      emailDraftEn:
        'Dear Mrs. Wang,\n\nThank you for the conversation today. We covered the high-level picture for retiring at 60 with a 20K monthly target, which your current mix of cash, equities, and rental income supports well.\n\nAs a next step, I will deliver a full retirement plan by Wednesday covering asset allocation, insurance gaps, and tax optimization, and will set up a call so we can walk through it with your husband.\n\nPlease feel free to reach out anytime in the meantime.\n\nBest regards',
    },
  },

  // ────────── 2. Couple consultation (3 speakers, 3 chunks) ──────────
  // Mrs. Li (speaker C) appears in the very first chunk, so the demo shows
  // 说话人 3 emerging mid-paragraph in a natural way.
  {
    id: 'couple',
    scenario: {
      titleZh: '家庭资产配置（夫妻同访）',
      titleEn: 'Family Portfolio Review (Couple Visit)',
      contextZh: '家庭财务 · 子女教育',
      contextEn: 'Family Finance · Education Planning',
    },

    speakers: [
      { id: 'A', anonNumber: 1, defaultNameZh: '理财顾问', defaultNameEn: 'Counsellor', role: 'counsellor', color: 'violet' },
      { id: 'B', anonNumber: 2, defaultNameZh: '李先生', defaultNameEn: 'Mr. Li', role: 'client', color: 'emerald' },
      { id: 'C', anonNumber: 3, defaultNameZh: '李太太', defaultNameEn: 'Mrs. Li', role: 'client', color: 'amber' },
    ],

    segments: [
      { speakerId: 'A', delayMs: 400, textZh: '李先生、李太太，下午好。今天主要想聊一下你们家庭的整体资产配置。', textEn: 'Mr. Li, Mrs. Li, good afternoon. Today I would like to look at your household allocation as a whole.' },
      { speakerId: 'B', delayMs: 600, textZh: '好的，我们最近在考虑孩子留学的资金安排，希望能听听专业建议。', textEn: "Sure. We've been thinking about funding our child's overseas studies and would value your view." },
      { speakerId: 'C', delayMs: 700, textZh: '另外我个人也比较关心家庭整体的保险是否够用，特别是重疾险和定期寿险。', textEn: "Also I'm personally focused on whether our family insurance is sufficient, especially critical illness and term life." },

      { speakerId: 'A', delayMs: 600, textZh: '好的。我们可以先看留学这部分——孩子目前几岁？预计去哪边？', textEn: "Got it. Let's start with overseas studies — how old is your child, and which region are you considering?" },
      { speakerId: 'B', delayMs: 700, textZh: '8 岁，目前考虑英国或新加坡，预计 18 岁出去读本科。', textEn: '8 years old. We are looking at the UK or Singapore, planning for undergraduate at 18.' },
      { speakerId: 'C', delayMs: 700, textZh: '我们目前每年大约可以存 30 万左右，希望专款专用。', textEn: "We can set aside roughly 300K per year, ideally earmarked for this goal." },

      { speakerId: 'A', delayMs: 600, textZh: '清楚了。10 年的规划期，加上你们的稳定储蓄能力，可以建立一个教育金专户。保险方面我会单独做一份家庭保障缺口分析。', textEn: 'Clear. With a 10-year horizon and stable savings, we can set up a dedicated education account. For insurance, I will prepare a family coverage gap analysis separately.' },
      { speakerId: 'B', delayMs: 700, textZh: '好的，那就麻烦您整理一下。下次见面可以一起过一遍。', textEn: 'Great. Please put it together and we can review it next time.' },
      { speakerId: 'C', delayMs: 600, textZh: '保险的部分能不能先发个简版给我们参考？', textEn: 'Could you send us a short version of the insurance review beforehand?' },
      { speakerId: 'A', delayMs: 500, textZh: '没问题，我会先发一份摘要，详细方案下次会议一起讨论。', textEn: 'Of course. I will send a summary first, and we will discuss the full plan in our next meeting.' },
    ],

    chunks: [
      { segmentIndices: [0, 1, 2], processingMs: 1200 },
      { segmentIndices: [3, 4, 5], processingMs: 1000 },
      { segmentIndices: [6, 7, 8, 9], processingMs: 1100 },
    ],

    extractedClient: {
      nameZh: '李先生 & 李太太',
      nameEn: 'Mr. & Mrs. Li',
      hintZh: '从「李先生、李太太」识别',
      hintEn: 'Detected from "Mr. Li, Mrs. Li"',
      matchClientId: 'c-li-family',
      confidence: 0.88,
    },

    aiOutput: {
      summaryZh: '李先生与李太太希望为 8 岁的孩子规划 10 年期的留学教育金（目标 18 岁本科出国），同时关注家庭整体保险保障，特别是重疾险与定期寿险。家庭每年可定向储蓄 30 万。下一步：建立教育金专户，并交付家庭保障缺口分析。',
      summaryEn: 'Mr. and Mrs. Li want to fund their 8-year-old child\'s overseas undergraduate studies in 10 years (target country: UK or Singapore), while also reviewing family insurance, particularly critical illness and term life. They can dedicate ~300K per year. Next steps: set up a dedicated education fund and deliver a family insurance gap analysis.',
      profile: {
        labelZh: '家庭画像',
        labelEn: 'Family Profile',
        rowsZh: [
          { k: '孩子年龄', v: '8 岁' },
          { k: '留学目标', v: '英国 / 新加坡' },
          { k: '出发时间', v: '约 10 年后' },
          { k: '年储蓄能力', v: '约 ¥300,000' },
        ],
        rowsEn: [
          { k: 'Child Age', v: '8' },
          { k: 'Target Region', v: 'UK / Singapore' },
          { k: 'Time Horizon', v: '~10 years' },
          { k: 'Annual Savings', v: '~¥300,000' },
        ],
      },
      assets: {
        labelZh: '关注事项',
        labelEn: 'Concerns Raised',
        rowsZh: [
          { k: '教育金专户', v: '需建立' },
          { k: '重疾险', v: '保额待评估' },
          { k: '定期寿险', v: '保障期待评估' },
        ],
        rowsEn: [
          { k: 'Education Fund', v: 'To set up' },
          { k: 'Critical Illness', v: 'Coverage TBD' },
          { k: 'Term Life', v: 'Term length TBD' },
        ],
      },
      risk: {
        labelZh: '风险偏好',
        labelEn: 'Risk Profile',
        levelZh: '稳健型',
        levelEn: 'Balanced',
        targetZh: '专款专用，控制波动',
        targetEn: 'Earmarked, low volatility',
      },
      topicsZh: ['教育金规划', '家庭保险', '重疾险', '定期寿险', '资产配置'],
      topicsEn: ['Education Funding', 'Family Insurance', 'Critical Illness', 'Term Life', 'Asset Allocation'],
      actions: [
        { id: 'a1', textZh: '建立 10 年期教育金专户方案', textEn: 'Build a 10-year education fund plan', dueZh: '两周内', dueEn: 'Within 2 weeks' },
        { id: 'a2', textZh: '发送家庭保险缺口分析简版', textEn: 'Send short family insurance gap summary', dueZh: '本周内', dueEn: 'This week' },
        { id: 'a3', textZh: '安排下次会议详细讲解保险方案', textEn: 'Schedule next meeting to walk through insurance plan', dueZh: '下次会议', dueEn: 'Next meeting' },
      ],
      emailDraftZh:
        '李先生、李太太您好，\n\n感谢今天与你们的会谈。我们今天主要讨论了两件事：一是孩子的留学教育金（10 年期，目标英国 / 新加坡本科），二是家庭整体保险保障（重疾险与定期寿险）。\n\n下一步我会先发一份家庭保险缺口分析的简版给你们，下次会议时再就教育金专户的具体方案一起详细讨论。\n\n如果有任何补充信息，欢迎随时告知。\n\n祝好',
      emailDraftEn:
        'Dear Mr. and Mrs. Li,\n\nThank you for our conversation today. We covered two main topics: a 10-year education fund for your child (target: UK / Singapore undergraduate), and your family insurance — particularly critical illness and term life.\n\nAs a next step I will share a short summary of the family insurance gap, and we will dive deep into the education fund plan in our next meeting.\n\nFeel free to share any additional information beforehand.\n\nBest regards',
    },
  },
]

export function getScriptById(id) {
  return SCRIPTS.find((s) => s.id === id) ?? SCRIPTS[0]
}

export function pickLocalized(obj, keyZh, keyEn, locale) {
  if (!obj) return ''
  return locale === 'zh' ? obj[keyZh] : obj[keyEn]
}

// Anonymous label for an unknown speaker, by anonNumber.
// Used in bubbles before the client is linked.
export function anonymousSpeakerLabel(anonNumber, locale) {
  return locale === 'zh' ? `说话人 ${anonNumber}` : `Speaker ${anonNumber}`
}

// Best-effort fuzzy matching of an extracted name against the CRM list.
export function searchClients(query, locale) {
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return MOCK_CLIENTS
  return MOCK_CLIENTS
    .map((c) => {
      const name = (locale === 'zh' ? c.nameZh : c.nameEn).toLowerCase()
      let score = 0
      if (name === q) score = 1
      else if (name.includes(q) || q.includes(name)) score = 0.7
      else {
        const overlap = [...q].filter((ch) => name.includes(ch)).length
        score = overlap / Math.max(q.length, 1) * 0.5
      }
      return { client: c, score }
    })
    .filter((m) => m.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.client)
}
