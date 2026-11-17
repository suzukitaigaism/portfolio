<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import trimGroup01 from './assets/trimmarks/group_01.svg'
import trimGroup02 from './assets/trimmarks/group_02.svg'
import trimGroup03 from './assets/trimmarks/group_03.svg'
import trimGroup04 from './assets/trimmarks/group_04.svg'
import trimGroup05 from './assets/trimmarks/group_05.svg'
import trimGroup06 from './assets/trimmarks/group_06.svg'
import trimGroup07 from './assets/trimmarks/group_07.svg'
import trimGroup08 from './assets/trimmarks/group_08.svg'
import SectionHeading from './components/SectionHeading/SectionHeading.vue'
import ShaderBackground from './components/ShaderBackground/ShaderBackground.vue'
import WorkDetail from './components/WorkDetail/WorkDetail.vue'
import WorkOverview from './components/WorkOverview/WorkOverview.vue'
import {
  about,
  career,
  profile,
  skillGroups,
  strengths,
  works,
  type WorkKind,
} from './data/profile'

type Filter = 'all' | WorkKind

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'design', label: 'デザイン' },
  { key: 'code', label: '実装' },
  { key: 'both', label: 'デザイン〜実装' },
]

const strengthKind = ['design', 'code', 'launch'] as const

const currentFilter = ref<Filter>('all')
const selectedIndex = ref<number | null>(null)

const filteredWorks = computed(() =>
  works
    .map((work, index) => ({ work, index }))
    .filter(({ work }) => currentFilter.value === 'all' || work.kind === currentFilter.value),
)

const countOf = (key: Filter) =>
  key === 'all' ? works.length : works.filter((w) => w.kind === key).length

const selectedWork = computed(() =>
  selectedIndex.value === null ? null : works[selectedIndex.value],
)

// 絞り込み後の一覧の中で、何番目を表示しているか（スマホの「3 / 13」表示用）
const selectedPosition = computed(() =>
  filteredWorks.value.findIndex(({ index }) => index === selectedIndex.value),
)

// PC（1024px以上）は右側パネル、それ未満はポップアップ
const isWide = ref(true)
let mediaQuery: MediaQueryList | null = null
const updateWide = () => {
  isWide.value = mediaQuery?.matches ?? true
}

const panelRef = ref<HTMLElement | null>(null)
const dialogCloseRef = ref<HTMLButtonElement | null>(null)
let returnFocusTo: HTMLElement | null = null

const select = async (index: number, event?: Event) => {
  if (selectedIndex.value === index) {
    close()
    return
  }
  if (selectedIndex.value === null) {
    returnFocusTo = (event?.currentTarget as HTMLElement | null) ?? null
  }
  selectedIndex.value = index
  await nextTick()
  if (isWide.value) panelRef.value?.focus({ preventScroll: true })
  else dialogCloseRef.value?.focus()
}

const close = () => {
  selectedIndex.value = null
  const target = returnFocusTo
  returnFocusTo = null
  nextTick(() => target?.focus({ preventScroll: true }))
}

const step = (delta: number) => {
  const list = filteredWorks.value
  if (!list.length || selectedPosition.value < 0) return
  const next = (selectedPosition.value + delta + list.length) % list.length
  selectedIndex.value = list[next]!.index
}

const onKeydown = (e: KeyboardEvent) => {
  if (selectedIndex.value === null) return
  if (e.key === 'Escape') close()
  if (!isWide.value && e.key === 'ArrowRight') step(1)
  if (!isWide.value && e.key === 'ArrowLeft') step(-1)
}

// 絞り込みで表示中の案件が消えたら閉じる
watch(currentFilter, () => {
  if (selectedIndex.value !== null && selectedPosition.value < 0) selectedIndex.value = null
})

// ポップアップ表示中は背面をスクロールさせない
watch([selectedIndex, isWide], ([index, wide]) => {
  document.documentElement.style.overflow = index !== null && !wide ? 'hidden' : ''
})

// 制作実績が画面に入ったら、カードをふわっと表示する
const worksRef = ref<HTMLElement | null>(null)
const worksRevealed = ref(false)
let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  updateWide()
  mediaQuery.addEventListener('change', updateWide)
  window.addEventListener('keydown', onKeydown)

  if (!('IntersectionObserver' in window) || !worksRef.value) {
    worksRevealed.value = true
    return
  }
  revealObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      worksRevealed.value = true
      revealObserver?.disconnect()
    },
    { rootMargin: '0px 0px -15% 0px' },
  )
  revealObserver.observe(worksRef.value)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateWide)
  window.removeEventListener('keydown', onKeydown)
  revealObserver?.disconnect()
})

// ページ内のセクションへ、なめらかにスクロールする（ヘッダーの高さ分だけ手前で止める）
// ブラウザ任せのスムーススクロールは OS の「視差効果を減らす」設定で無効になるため、自前で動かす
const HEADER_OFFSET = 88
let scrollAnimation = 0
const scrollToSection = (id: string) => {
  const target = document.getElementById(id)
  if (!target) return
  cancelAnimationFrame(scrollAnimation)
  const startY = window.scrollY
  const endY = Math.max(0, target.getBoundingClientRect().top + startY - HEADER_OFFSET)
  const distance = endY - startY
  // 距離に応じて 0.6〜1.2 秒
  const duration = Math.min(1200, Math.max(600, Math.abs(distance) * 0.5))
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  // 開始時刻は最初のフレームの時刻にそろえる（performance.now() より前の時刻が来ることがあるため）
  let startTime: number | null = null
  const step = (now: number) => {
    if (startTime === null) startTime = now
    const t = Math.min(1, Math.max(0, (now - startTime) / duration))
    window.scrollTo({ top: startY + distance * easeInOutCubic(t), behavior: 'instant' })
    if (t < 1) scrollAnimation = requestAnimationFrame(step)
  }
  scrollAnimation = requestAnimationFrame(step)
  history.replaceState(null, '', `#${id}`)
}

const nav = [
  { id: 'strength', label: '強み' },
  { id: 'works', label: '制作実績' },
  { id: 'skills', label: 'スキル' },
  { id: 'career', label: '経歴' },
  { id: 'about', label: '自己紹介' },
]

// スマホ（767px以下）はハンバーガーメニュー。タブレット以上は横並びのメニューが1行に収まるのでそのまま
const MENU_QUERY = '(max-width: 767px)'
const headerRef = ref<HTMLElement | null>(null)
const menuButtonRef = ref<HTMLButtonElement | null>(null)
const menuOpen = ref(false)
let menuQuery: MediaQueryList | null = null

const closeMenu = (returnFocus = false) => {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) menuButtonRef.value?.focus()
}

const onNavClick = (id: string) => {
  closeMenu()
  scrollToSection(id)
}

// メニューの外を押したら閉じる
const onPointerDownOutside = (e: PointerEvent) => {
  if (!headerRef.value?.contains(e.target as Node)) closeMenu()
}
const onMenuKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu(true)
}
// 画面を広げてPC表示に切り替わったら閉じる
const onMenuQueryChange = () => {
  if (!menuQuery?.matches) closeMenu()
}

watch(menuOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onPointerDownOutside)
    window.addEventListener('keydown', onMenuKeydown)
  } else {
    document.removeEventListener('pointerdown', onPointerDownOutside)
    window.removeEventListener('keydown', onMenuKeydown)
  }
})

onMounted(() => {
  menuQuery = window.matchMedia(MENU_QUERY)
  menuQuery.addEventListener('change', onMenuQueryChange)
})
onBeforeUnmount(() => {
  menuQuery?.removeEventListener('change', onMenuQueryChange)
  document.removeEventListener('pointerdown', onPointerDownOutside)
  window.removeEventListener('keydown', onMenuKeydown)
})
</script>

<template>
  <ShaderBackground />

  <!-- リキッドグラス用のフィルター：背景をノイズでわずかにゆがませ、レンズ越しのように見せる -->
  <svg class="_svg_defs" aria-hidden="true" focusable="false">
    <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="8" result="noise" />
      <feGaussianBlur in="noise" stdDeviation="3" result="blurredNoise" />
      <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>

  <header ref="headerRef" :class="[{ _header_open: menuOpen }, '_header glass']">
    <a href="#top" class="_logo" @click="closeMenu()">Taiga Suzuki</a>
    <button
      ref="menuButtonRef"
      type="button"
      class="_menu_button"
      aria-controls="site-nav"
      :aria-expanded="menuOpen"
      :aria-label="menuOpen ? 'メニューを閉じる' : 'メニューを開く'"
      @click="menuOpen = !menuOpen"
    >
      <span class="_menu_icon" aria-hidden="true"><span /><span /><span /></span>
    </button>
    <nav id="site-nav" class="_nav" aria-label="ページ内リンク">
      <a
        v-for="item in nav"
        :key="item.id"
        :href="`#${item.id}`"
        @click.prevent="onNavClick(item.id)"
      >
        {{ item.label }}
      </a>
    </nav>
  </header>

  <main id="top">
    <!-- FV：弁当グリッド（名刺／キャッチコピー／作品） -->
    <section class="_hero">
      <div class="_bento_meishi">
        <!-- 名刺の裏に、ひと回り大きい枠でトンボ（トリムマーク）を置く。Figma: contents_container / trimmark_wrapper -->
        <div class="_meishi_wrap">
          <div class="_trimmarks" aria-hidden="true">
            <img :src="trimGroup01" width="13.62" height="17.1821" alt="" class="_tm _tm_tl" />
            <img :src="trimGroup02" width="27.06" height="11.4689" alt="" class="_tm _tm_t" />
            <img :src="trimGroup03" width="13.6192" height="17.1821" alt="" class="_tm _tm_tr" />
            <img :src="trimGroup04" width="9.02" height="34.4067" alt="" class="_tm _tm_r" />
            <img :src="trimGroup05" width="13.6189" height="17.1821" alt="" class="_tm _tm_br" />
            <img :src="trimGroup06" width="26.705" height="11" alt="" class="_tm _tm_b" />
            <img :src="trimGroup07" width="13.62" height="17.1821" alt="" class="_tm _tm_bl" />
            <img :src="trimGroup08" width="9.02" height="34.4067" alt="" class="_tm _tm_l" />
          </div>
          <!-- 日本のシンプルな名刺（91×55mm の比率）。肩書き・氏名・ローマ字・所在地 -->
          <div class="_meishi glass">
            <p class="_hero_role" lang="en">{{ profile.title }}</p>
            <div class="_meishi_name">
              <h1 class="_hero_name">{{ profile.name }}</h1>
              <p class="_hero_name_en" lang="en">{{ profile.nameEn }}</p>
            </div>
            <address class="_meishi_address">
              <span class="_meishi_office">{{ profile.company }}　{{ profile.office }}</span>
              <span>{{ profile.postalCode }}</span>
              <span>{{ profile.address }}</span>
              <span class="_meishi_mail">
                <span lang="en">E-mail</span>
                <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
              </span>
            </address>
          </div>
        </div>
      </div>
      <div class="_bento_copy">
        <p class="_hero_copy">{{ profile.catchcopy }}</p>
      </div>
      <figure class="_hero_visual _bento_visual">
        <!--
          円形に回るループ文字（線のみ）。中心は画像の右上角の少し外にあり、
          円の左下が画像の右上にかかる。
        -->
        <div class="_ring" aria-hidden="true">
          <svg class="_ring_svg" viewBox="0 0 1000 1000">
            <defs>
              <path id="ring-path" d="M500,500 m-400,0 a400,400 0 1,1 800,0 a400,400 0 1,1 -800,0" />
            </defs>
            <text class="_ring_text">
              <textPath href="#ring-path" textLength="2513" lengthAdjust="spacing">
                UI DESIGNER &amp; FRONT-END ENGINEER ・
              </textPath>
            </text>
          </svg>
        </div>
        <!-- 作品をガラス板の奥に置く：中央はくっきり、縁だけぼかし・ゆがみ・ハイライトを重ねる -->
        <div class="_hero_glass">
          <img
            src="/first_image_fv.jpg"
            width="1422"
            height="1600"
            alt="雲の上に熊・ペンギン・鴨・イルカ・猫が集まり、惑星や月、桜を組み合わせたコラージュ作品"
          />
        </div>
      </figure>
    </section>

    <!-- FV の下：数字で見る実績（FV と同じ間隔で並べる） -->
    <section class="_facts_row" aria-label="実績の概要">
      <dl class="_facts">
        <!-- 押すと制作実績のセクションへ移動する（タイル全体が押せる） -->
        <div class="_fact _fact_clickable glass">
          <dt>制作実績</dt>
          <dd>
            <a href="#works" class="_fact_link" @click.prevent="scrollToSection('works')">
              <!-- 件数は出さず、作ってきたものの種類の幅で見せる -->
              コーポレート・採用・LP・SaaS<span class="_visually_hidden">（制作実績へ移動）</span>
            </a>
          </dd>
        </div>
        <div class="_fact glass">
          <dt>Web制作</dt>
          <dd>2021年〜</dd>
        </div>
        <div class="_fact glass">
          <dt>担当範囲</dt>
          <dd>打ち合わせ〜公開</dd>
        </div>
      </dl>
    </section>

    <section id="strength" class="_section _section_strength">
      <h2 class="_visually_hidden">From Design to Code（デザインと実装の、両方に関われる）</h2>
      <!-- 見出しの英語を横に流し続ける。下 1/3 はカードの裏に回り、すりガラス越しにぼけて見える -->
      <div class="_marquee" aria-hidden="true">
        <div class="_marquee_track">
          <span v-for="n in 4" :key="n" class="_marquee_text">From Design to Code</span>
        </div>
      </div>
      <div class="_strength_grid">
        <article
          v-for="(item, i) in strengths"
          :key="item.label"
          :class="[`_strength_${strengthKind[i]}`, '_strength', 'glass']"
        >
          <p class="_strength_label" lang="en">{{ item.label }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <section id="works" ref="worksRef" class="_section">
      <SectionHeading en="Works">制作実績</SectionHeading>

      <div class="_filter neu-zone" role="group" aria-label="担当範囲で絞り込む">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          class="neu-button"
          :aria-pressed="currentFilter === f.key"
          @click="currentFilter = f.key"
        >
          {{ f.label }}<span class="_filter_count">{{ countOf(f.key) }}</span>
        </button>
      </div>

      <div class="_works_layout">
        <!-- 並び替え時はカードがなめらかに移動する（クラスは TransitionGroup 自身に付けて位置の計測に間に合わせる） -->
        <TransitionGroup
          tag="div"
          name="card"
          :class="[
            {
              _works_grid_narrow: isWide && selectedWork,
              _works_grid_pending: !worksRevealed,
              _works_grid_reveal: worksRevealed,
            },
            '_works_grid',
          ]"
        >
          <article
            v-for="({ work, index }, i) in filteredWorks"
            :key="work.title"
            :style="{ '--i': i }"
            :class="[
              { _work_selected: selectedIndex === index, _work_tilt: isWide && selectedIndex === index },
              `_kind_${work.kind}`,
              '_work',
              'glass',
            ]"
            @click="select(index, $event)"
          >
            <WorkOverview :work="work" />
            <div class="_work_actions neu-zone">
              <button
                type="button"
                class="neu-button"
                :aria-pressed="selectedIndex === index"
                @click.stop="select(index, $event)"
              >
                {{ selectedIndex === index ? '表示中' : '詳しく見る' }}
              </button>
            </div>
          </article>
        </TransitionGroup>

        <!-- PC：右側の詳細パネル -->
        <Transition name="panel">
          <aside
            v-if="isWide && selectedWork"
            :key="selectedIndex ?? -1"
            ref="panelRef"
            :class="[`_kind_${selectedWork.kind}`, '_panel', 'glass']"
            tabindex="-1"
            aria-labelledby="panel-title"
          >
            <div class="_panel_close neu-zone">
              <button type="button" class="neu-button _round" aria-label="詳細を閉じる" @click="close">
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <WorkOverview :work="selectedWork" size="panel" title-id="panel-title" />
            <hr class="_divider" />
            <WorkDetail :work="selectedWork" />
          </aside>
        </Transition>
      </div>

      <!-- スマホ：ポップアップ -->
      <Teleport to="body">
        <Transition name="dialog">
          <div v-if="!isWide && selectedWork" class="_overlay" @click.self="close">
            <div
              :class="[`_kind_${selectedWork.kind}`, '_dialog']"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
            >
              <div class="_dialog_body">
                <div class="_dialog_close">
                  <button
                    ref="dialogCloseRef"
                    type="button"
                    class="neu-button _round"
                    aria-label="詳細を閉じる"
                    @click="close"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
                <WorkOverview :work="selectedWork" size="panel" title-id="dialog-title" />
                <hr class="_divider" />
                <WorkDetail :work="selectedWork" />
              </div>
              <div class="_dialog_nav">
                <button type="button" class="neu-button _round" aria-label="前の案件" @click="step(-1)">
                  <span aria-hidden="true">‹</span>
                </button>
                <span class="_dialog_count" aria-live="polite">
                  {{ selectedPosition + 1 }} / {{ filteredWorks.length }}
                </span>
                <button type="button" class="neu-button _round" aria-label="次の案件" @click="step(1)">
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </section>

    <section id="skills" class="_section">
      <SectionHeading en="Skills &amp; Tools">スキル・ツール</SectionHeading>
      <div class="_skills_grid">
        <div v-for="group in skillGroups" :key="group.label" class="_skill glass">
          <h3 lang="en">{{ group.label }}</h3>
          <ul class="_tags">
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 経歴と自己紹介：弁当グリッドで横並び -->
    <section class="_section _duo" aria-label="経歴と自己紹介">
      <article id="career" class="_duo_tile glass">
        <h2 class="_duo_heading">経歴</h2>
        <ol class="_timeline">
          <li v-for="item in career" :key="item.period">
            <span class="_timeline_period">{{ item.period }}</span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.body }}</p>
          </li>
        </ol>
      </article>

      <article id="about" class="_duo_tile glass">
        <h2 class="_duo_heading">自己紹介</h2>
        <div class="_about">
          <p v-for="(paragraph, i) in about" :key="i">{{ paragraph }}</p>
        </div>
      </article>
    </section>
  </main>

  <footer class="_footer">
    <div class="neu-zone"><a href="#top" class="neu-button">ページの先頭へ</a></div>
    <small>© {{ profile.nameEn }}</small>
  </footer>
</template>

<style scoped>
._svg_defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

._hero,
._section {
  position: relative;
}

/* ---- 円形に回るループ文字（右上） ---- */
._ring {
  --ring-size: clamp(460px, 52vw, 860px);
  position: absolute;
  /* 円の中心を、画像の右上角から右上へ少しずらした位置に置く */
  top: calc(var(--ring-size) * -0.62);
  right: calc(var(--ring-size) * -0.52);
  z-index: 3;
  width: var(--ring-size);
  height: var(--ring-size);
  pointer-events: none;
}
._ring_svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: ring-spin 70s linear infinite;
}
._ring_text {
  font-family: 'Archivo Black', var(--font-en);
  font-size: 92px;
  /* 塗りなし・線だけ。線の太さは表示サイズに関係なく一定にする */
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.5px;
  vector-effect: non-scaling-stroke;
}
@keyframes ring-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  ._ring_svg {
    animation: none !important;
  }
}

/* ---- header ---- */
._header {
  position: sticky;
  top: 12px;
  /* ナビゲーションは常に一番手前（バッジ・カード・詳細パネルより上） */
  z-index: 100;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  justify-content: space-between;
  align-items: center;
  margin: 12px var(--gutter) 0;
  padding: 12px 24px;
  border-radius: 18px;
}
._logo {
  font-family: var(--font-en);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
}
._nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  font-size: 14px;
}
._nav a {
  text-decoration: none;
  color: var(--sub);
}
._nav a:hover {
  color: var(--ink);
}
/* ハンバーガーボタン（PC・タブレットでは出さない） */
._menu_button {
  display: none;
}

/* ---- header：スマホはハンバーガーメニュー ---- */
@media (max-width: 767px) {
  ._header {
    flex-wrap: nowrap;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0;
    padding: 6px 8px 6px 18px;
  }
  ._menu_button {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  ._menu_button:hover {
    background: rgba(255, 255, 255, 0.35);
  }
  ._menu_icon {
    position: relative;
    display: block;
    width: 20px;
    height: 14px;
  }
  ._menu_icon span {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    transition:
      transform 0.3s ease,
      opacity 0.2s ease,
      top 0.3s ease;
  }
  ._menu_icon span:nth-child(1) {
    top: 0;
  }
  ._menu_icon span:nth-child(2) {
    top: 6px;
  }
  ._menu_icon span:nth-child(3) {
    top: 12px;
  }
  /* 開いているときは ✕ にする */
  ._header_open ._menu_icon span:nth-child(1) {
    top: 6px;
    transform: rotate(45deg);
  }
  ._header_open ._menu_icon span:nth-child(2) {
    opacity: 0;
  }
  ._header_open ._menu_icon span:nth-child(3) {
    top: 6px;
    transform: rotate(-45deg);
  }

  /*
   * メニューはヘッダーの下に重ねて開く（ページの流れに入れると、
   * 開閉のたびに本文が上下に動き、ページ内リンクの移動先もずれるため）
   */
  ._nav {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 4px 18px 8px;
    border-radius: 18px;
    /*
     * ヘッダーにぼかし・ゆがみがかかっているため、その中のメニューには背景のぼかしが効かず、
     * 半透明だとゆがんだ背景が透けて文字が読みにくくなる。縁の光（内側の影）でガラスの質感は残し、背景は不透明にする
     */
    background: rgb(244, 247, 251);
    box-shadow: var(--glass-shadow), 0 12px 32px rgba(31, 42, 68, 0.12);
    font-size: 16px;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-8px);
    transition:
      opacity 0.25s ease,
      transform 0.3s ease,
      visibility 0s linear 0.3s;
  }
  ._header_open ._nav {
    visibility: visible;
    opacity: 1;
    transform: none;
    transition:
      opacity 0.25s ease,
      transform 0.3s ease,
      visibility 0s;
  }
  ._nav a {
    display: flex;
    align-items: center;
    min-height: 52px;
    padding: 0 10px 0 0;
    color: var(--ink);
    font-weight: 500;
    border-top: 1px solid rgba(31, 42, 68, 0.08);
  }
  ._nav a:first-child {
    border-top: 0;
  }
  ._nav a::after {
    content: '';
    width: 7px;
    height: 7px;
    margin-left: auto;
    border-top: 1.5px solid var(--faint);
    border-right: 1.5px solid var(--faint);
    transform: rotate(45deg);
  }
}

/* ---- hero ---- */
/* ---- FV：弁当グリッド ---- */
._hero {
  --bento-gap: clamp(14px, 1.6vw, 20px);
  --trim-gap: clamp(16px, 2vw, 26px);
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  /* 画像の高さで余った分を上下の行に等しく配り、左の列を上下中央にそろえる */
  grid-template-rows: auto auto;
  gap: var(--bento-gap);
  padding: clamp(32px, 4vw, 56px) var(--gutter) 0;
}
/* 左の列はガラスなし：名刺とトンボを背景の上に直接置く */
._bento_meishi {
  grid-column: 1;
  grid-row: 1;
  /* 画像の高さに対して、名刺＋キャッチコピーをまとめて上下中央に置く */
  align-self: end;
}
._bento_copy {
  grid-column: 1;
  grid-row: 2;
  align-self: start;
  display: flex;
  align-items: center;
  /* 名刺の下で左右中央にそろえる */
  justify-content: center;
  padding: 0 var(--trim-gap);
  text-align: center;
}
._bento_visual {
  grid-column: 2;
  grid-row: 1 / span 2;
  /* 作品は元の比率のまま。画面の高さに収まる幅にして右寄せ */
  width: min(100%, calc(82vh * 1422 / 1600));
  justify-self: end;
}

/* FV の下の実績（FV と同じ間隔で3枚並べる） */
._facts_row {
  /* FV（名刺・キャッチコピー・作品）との間を少し広めにとる */
  padding: clamp(32px, 4vw, 56px) var(--gutter) 0;
  --bento-gap: clamp(14px, 1.6vw, 20px);
}
._facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--bento-gap);
  margin: 0;
}
._fact {
  padding: 18px 24px;
}
._fact dt {
  font-size: 12px;
  color: var(--sub);
}
._fact dd {
  margin: 2px 0 0;
  font-size: clamp(16px, 1.6vw, 20px);
  font-weight: 700;
}
._fact_clickable {
  position: relative;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
._fact_clickable:hover {
  background-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}
._fact_link {
  text-decoration: none;
}
/* リンクの当たり判定をタイル全体に広げる */
._fact_link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
._fact_link:focus-visible {
  outline: none;
}
._fact_clickable:has(._fact_link:focus-visible) {
  outline: 2px solid var(--indigo);
  outline-offset: 3px;
}

/* ---- 名刺（FV） ---- */
/* トンボの枠：名刺よりひと回り大きく、名刺はその中央に置く */
._meishi_wrap {
  position: relative;
  /* 名刺は 91:55 の比率のまま、左の列の横幅いっぱいに広げる */
  width: 100%;
  margin: 0;
  padding: var(--trim-gap);
}
._trimmarks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
._tm {
  position: absolute;
  display: block;
  max-width: none;
}
/* 四隅（Figma 上で 180° 回転して配置されている） */
._tm_tl {
  top: 0;
  left: 0;
  transform: rotate(180deg);
}
._tm_tr {
  top: 0;
  right: 0;
  transform: rotate(180deg);
}
._tm_br {
  bottom: 0;
  right: 0;
  transform: rotate(180deg);
}
._tm_bl {
  bottom: 0;
  left: 0;
  transform: rotate(180deg);
}
/* 各辺の中央（センタートンボ） */
._tm_t {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
._tm_b {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
._tm_r {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}
._tm_l {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

._meishi {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 100%;
  aspect-ratio: 91 / 55;
  margin: 0;
  padding: clamp(20px, 3.2vw, 36px) clamp(22px, 3.6vw, 44px);
  border-radius: 10px;
  /* 紙の名刺らしく、ガラスを少し白く */
  background: rgba(255, 255, 255, 0.5);
}
._hero_role {
  margin: 0;
  font-family: var(--font-en);
  font-size: clamp(10px, 1vw, 12px);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--sub);
}
._meishi_name {
  align-self: center;
  text-align: center;
}
._hero_name {
  margin: 0;
  font-family: 'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  font-size: clamp(30px, 4.2vw, 50px);
  font-weight: 600;
  line-height: 1.2;
  /* 名刺らしく字間を広くとる。末尾の字間ぶん左にずれないよう padding で相殺 */
  letter-spacing: 0.32em;
  padding-left: 0.32em;
}
._hero_name_en {
  margin: 10px 0 0;
  font-family: var(--font-en);
  font-size: clamp(11px, 1.1vw, 13px);
  font-weight: 400;
  letter-spacing: 0.28em;
  color: var(--sub);
}
._meishi_address {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 1em;
  margin: 0;
  padding-top: 12px;
  border-top: 1px solid rgba(31, 42, 68, 0.14);
  font-size: clamp(10px, 1vw, 12px);
  font-style: normal;
  line-height: 1.6;
  letter-spacing: 0.06em;
  color: var(--sub);
}
._meishi_mail {
  flex-basis: 100%;
  display: flex;
  gap: 0.8em;
}
._meishi_mail a {
  color: var(--ink);
  text-decoration: none;
  font-family: var(--font-en);
  letter-spacing: 0.02em;
}
._meishi_mail a:hover {
  text-decoration: underline;
}
._meishi_office {
  flex-basis: 100%;
  font-weight: 700;
  color: var(--ink);
}
/* キャッチコピーは名刺の外、すぐ下に置く */
._hero_copy {
  max-width: 30em;
  margin: 0;
  font-size: clamp(15px, 1.5vw, 18px);
  font-weight: 500;
  line-height: 1.7;
  /* 改行位置を文節にそろえ、1〜2文字だけ次の行に残らないようにする */
  word-break: auto-phrase;
  text-wrap: balance;
}
._hero_visual {
  position: relative;
  margin: 0;
}
._hero_glass {
  position: relative;
  aspect-ratio: 1422 / 1600;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--glass-bg);
  box-shadow:
    0 2px 6px rgba(31, 42, 68, 0.08),
    0 24px 56px rgba(31, 42, 68, 0.14);
}
/* ガラス板：縁にだけぼかし・ゆがみをかけ、内側の影で厚みを、斜めのグラデーションで映り込みを出す */
._hero_glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.38) 0%,
    rgba(255, 255, 255, 0.08) 28%,
    rgba(255, 255, 255, 0) 55%,
    rgba(255, 255, 255, 0.14) 100%
  );
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 2.5px 4px 0 -2px rgba(255, 255, 255, 0.95),
    inset -3px -3px 0 -2px rgba(255, 255, 255, 0.8),
    inset -4px -12px 2px -8px rgba(255, 255, 255, 0.7),
    inset -1px -2px 8px 0 rgba(31, 42, 68, 0.12),
    inset 0 6px 10px -4px rgba(31, 42, 68, 0.12);
  -webkit-backdrop-filter: blur(6px) saturate(1.3);
  backdrop-filter: blur(6px) url('#liquid-glass') saturate(1.3);
  /* 中央は透明（作品をくっきり見せる）、縁に向かってガラスの効果が強くなる */
  -webkit-mask-image: radial-gradient(closest-side, transparent 72%, #000 100%);
  mask-image: radial-gradient(closest-side, transparent 72%, #000 100%);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
@supports (-moz-appearance: none) {
  ._hero_glass::after {
    backdrop-filter: blur(6px) saturate(1.3);
  }
}

._hero_glass img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 作品の白い紙の部分に、背景の淡い色をうっすら写す */
  mix-blend-mode: multiply;
}

/* ---- sections ---- */
._section {
  padding: clamp(56px, 8vw, 112px) var(--gutter) 0;
}

/* ---- strength ---- */
/* FV との間を詰める（流れる大きな英字が見出しの役割を兼ねるため） */
._section_strength {
  /* 流れる大きな英字は上に少しはみ出すため、上の実績タイルと重ならない分だけ空ける */
  padding-top: clamp(48px, 7vw, 104px);
}
._marquee {
  --marquee-size: clamp(136px, 26vw, 420px);
  position: relative;
  z-index: 0;
  /* 画面の端から端まで流す。上はフォント自体の上側の余白（大文字の上の空き）を詰める */
  margin: calc(var(--marquee-size) * -0.12) calc(-1 * var(--gutter)) 0;
  /* 文字の高さの 1/3 ほどをカードに重ねる */
  margin-bottom: calc(var(--marquee-size) * -0.38);
  /* 文字だけ少し上へずらす（カードの位置は動かさず、重なりは残す） */
  translate: 0 calc(var(--marquee-size) * -0.08);
  overflow: hidden;
  pointer-events: none;
  user-select: none;
}
._marquee_track {
  display: flex;
  align-items: center;
  gap: 0.4em;
  width: max-content;
  font-size: var(--marquee-size);
  animation: marquee 80s linear infinite;
}
._marquee_text {
  /* 線だけで描くため、輪郭が重ならない静的フォントを使う（可変フォントは文字の中に余計な線が出る） */
  font-family: 'Archivo Black', var(--font-en);
  font-size: 1em;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  /* 塗りなし・線だけ（線の太さは文字の大きさに合わせる） */
  color: transparent;
  -webkit-text-stroke: max(1.5px, calc(var(--marquee-size) * 0.006)) var(--ink);
  paint-order: stroke fill;
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    /* 同じ文字を4つ並べているので、半分（2つ分＋間隔）動かすと継ぎ目なくループする */
    transform: translateX(calc(-50% - 0.2em));
  }
}
@media (prefers-reduced-motion: reduce) {
  ._marquee_track {
    animation: none !important;
  }
}

._strength_grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
._strength {
  padding: 28px;
}
._strength_label {
  margin: 0 0 4px;
  font-family: var(--font-en);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
._strength_design ._strength_label {
  color: var(--mauve);
}
._strength_code ._strength_label {
  color: var(--teal);
}
._strength_launch ._strength_label {
  color: var(--indigo);
}
._strength h3 {
  margin: 0 0 12px;
  font-size: 18px;
}
._strength p:last-child {
  margin: 0;
  color: var(--sub);
  font-size: 15px;
}

/* ---- works ---- */
._filter {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 36px;
}
._filter_count {
  min-width: 1.6em;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(31, 42, 68, 0.08);
  font-size: 12px;
  text-align: center;
}
._filter .neu-button[aria-pressed='true'] {
  color: var(--indigo);
  font-weight: 700;
}

._works_layout {
  position: relative;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  --panel-w: clamp(380px, 36vw, 500px);
}
._works_grid {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 20px;
  align-items: start;
}
._works_grid_narrow {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
}

._work {
  --kind: var(--indigo);
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-top: 4px solid var(--kind);
  cursor: pointer;
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}
._work:hover {
  background-color: rgba(255, 255, 255, 0.55);
}
._work_selected {
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 18px 48px rgba(31, 42, 68, 0.18);
}
/* PC：選んだカードは少し傾けて浮かせる */
._work_tilt {
  position: relative;
  z-index: 2;
  transform: rotate(3deg) translateY(-6px);
}
._kind_design {
  --kind: var(--mauve);
}
._kind_code {
  --kind: var(--teal);
}
._kind_both {
  --kind: var(--indigo);
}
._work_actions {
  margin-top: 20px;
}

/* カードの並び替えアニメーション */
.card-move {
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
/*
 * カードの表示：ふわっとフェードイン（少しずつ時間をずらす）
 * fill-mode は backwards のみ。終わったあとに transform を持ち越すと、
 * 選択中カードの傾き（_work_tilt）を打ち消してしまうため。
 */
@keyframes card-fade {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
._works_grid_pending ._work {
  opacity: 0;
}
._works_grid_reveal ._work,
.card-enter-active {
  animation: card-fade 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  animation-delay: calc(min(var(--i, 0), 12) * 60ms);
}
.card-leave-active {
  display: none;
}

/* ---- detail panel (PC) ---- */
._panel {
  position: sticky;
  top: 96px;
  flex: 0 0 var(--panel-w);
  width: var(--panel-w);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  /* ボタンまわりのぼかし（neu-zone）が端からはみ出して横スクロールが出ないよう、横は切る */
  overflow-x: hidden;
  padding: 28px;
  background: rgba(255, 255, 255, 0.62);
  overscroll-behavior: contain;
}
/* パネルは読み上げ位置を移すためにフォーカスするだけなので、枠線は出さない（中のボタンには出る） */
._panel:focus,
._panel:focus-visible {
  outline: none;
}
._panel_close {
  /* パネルをスクロールしても右上に残す（下を流れる内容より手前に） */
  position: sticky;
  top: 12px;
  z-index: 2;
  float: right;
  margin: -4px -4px 8px 12px;
}
._round {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
}
._divider {
  margin: 24px 0;
  border: 0;
  border-top: 1px solid rgba(31, 42, 68, 0.12);
}
.panel-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.panel-leave-active {
  position: absolute;
  top: 0;
  right: 0;
  transition: opacity 0.2s ease;
}
.panel-enter-from {
  opacity: 0;
  transform: translateX(32px);
}
.panel-leave-to {
  opacity: 0;
}

/* ---- dialog (SP) ---- */
._overlay {
  position: fixed;
  inset: 0;
  /* ポップアップは画面全体を覆うため、ナビゲーションより上に出す */
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(31, 42, 68, 0.38);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
._dialog {
  --kind: var(--indigo);
  display: flex;
  flex-direction: column;
  width: min(100%, 560px);
  max-height: calc(100dvh - 32px);
  overflow: hidden;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  background: rgba(240, 244, 249, 0.9);
  box-shadow: 0 24px 64px rgba(31, 42, 68, 0.3);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
}
._dialog_body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 24px 20px;
  overscroll-behavior: contain;
}
._dialog_close {
  float: right;
  margin: -4px -4px 8px 12px;
}
._dialog_nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--base);
  border-top: 1px solid rgba(255, 255, 255, 0.7);
}
._dialog_count {
  font-family: var(--font-en);
  font-size: 14px;
  color: var(--sub);
  font-variant-numeric: tabular-nums;
}
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.25s ease;
}
.dialog-enter-active ._dialog,
.dialog-leave-active ._dialog {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from ._dialog,
.dialog-leave-to ._dialog {
  transform: translateY(24px) scale(0.98);
}

/* ---- skills ---- */
._skills_grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 20px;
}
._skill {
  padding: 24px;
}
._tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
._tags li {
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
._skill h3 {
  margin: 0 0 14px;
  font-family: var(--font-en);
  font-size: 20px;
  font-weight: 600;
}

/* ---- 経歴・自己紹介（弁当グリッドで横並び） ---- */
._duo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: clamp(14px, 1.6vw, 20px);
  align-items: stretch;
}
._duo_tile {
  padding: clamp(24px, 3vw, 40px);
}
._duo_heading {
  margin: 0 0 24px;
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
}

/* 経歴：期間の下に社名・内容を縦に積む（タイルの幅に収まるように） */
._timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}
._timeline li {
  position: relative;
  padding: 0 0 24px 24px;
  border-left: 2px solid rgba(47, 127, 134, 0.3);
}
._timeline li:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}
._timeline li::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 5px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.7);
}
._timeline_period {
  display: block;
  font-family: var(--font-en);
  font-size: 13px;
  color: var(--sub);
  font-variant-numeric: tabular-nums;
}
._timeline h3 {
  margin: 2px 0 4px;
  font-size: 17px;
}
._timeline p {
  margin: 0;
  color: var(--sub);
  font-size: 15px;
}

/* 自己紹介 */
._about p {
  max-width: 40em;
  margin: 0 0 1.2em;
  font-size: 15px;
}
._about p:first-child {
  font-size: 17px;
  font-weight: 700;
}
._about p:last-child {
  margin-bottom: 0;
}

/* ---- footer ---- */
._footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 96px 16px 48px;
  color: var(--sub);
}

._visually_hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 860px) {
  ._hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
  }
  ._bento_meishi,
  ._bento_copy,
  ._bento_visual {
    grid-column: 1;
    grid-row: auto;
  }
  ._bento_visual {
    order: -1;
  }
  ._bento_meishi,
  ._bento_copy {
    align-self: auto;
  }
  ._bento_visual {
    width: min(100%, 440px);
    justify-self: center;
  }
  ._strength_grid {
    grid-template-columns: 1fr;
  }
  ._duo {
    grid-template-columns: minmax(0, 1fr);
  }
  /* SP：作品と名刺の間はゆとりを持たせ（トンボが作品に詰まって見えないように）、名刺とキャッチコピーの間は少し詰める */
  ._hero {
    row-gap: 20px;
  }
  ._bento_meishi {
    margin-top: 16px;
  }
  /* SP：キャッチコピーと実績カードの間を広めに */
  ._facts_row {
    padding-top: 56px;
  }
}

@media (max-width: 520px) {
  /* スマホは1列に。文字が途中で折り返さないようにする */
  ._facts {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
