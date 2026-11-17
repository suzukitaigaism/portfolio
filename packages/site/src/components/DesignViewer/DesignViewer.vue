<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { DesignImage } from '../../data/profile'

// デザイン・画面の画像ビューア（画面全体に重ねて表示）。
// - PC / スマホの画像があるときは切り替えボタンを出す
// - 縦に長い画像（ページ全体のキャプチャ）は、横幅に合わせてスクロールで見せる
// - 複数枚あるときは ‹ › ボタン・左右キーで切り替え、Esc か ✕ で閉じる
const props = defineProps<{
  images: DesignImage[]
  title: string
  label: string
}>()

const open = defineModel<boolean>('open', { required: true })

type Device = 'pc' | 'sp'
const deviceLabel: Record<Device, string> = { pc: 'PC', sp: 'スマホ' }

const devices = computed(() => {
  const list: Device[] = []
  for (const d of ['pc', 'sp'] as const) if (props.images.some((img) => img.device === d)) list.push(d)
  return list
})
const device = ref<Device | null>(null)

// 選んでいる端末の画像だけを並べる（端末の指定がない画像は常に表示）
const visible = computed(() =>
  device.value ? props.images.filter((img) => !img.device || img.device === device.value) : props.images,
)

const index = ref(0)
const current = computed(() => visible.value[index.value])
const hasMany = computed(() => visible.value.length > 1)
// 1画面に収まらない長さのページは、枠に縮めると読めなくなるので、横幅に合わせてスクロールで見せる。
// 1画面分の縦横比は端末で違うため、しきい値を分ける
// - PC：1画面分は 0.7:1 前後（1440×1024 など）なので、0.8:1 を超えたら1画面を超えるページ
// - スマホ：1画面分が 2.2:1 前後あるので、2.4:1 を超えたらページ全体
const isTall = computed(() => {
  const img = current.value
  if (!img) return false
  const ratio = img.height / img.width
  return img.device === 'pc' ? ratio > 0.8 : ratio > 2.4
})

const stageRef = ref<HTMLElement | null>(null)
const closeRef = ref<HTMLButtonElement | null>(null)
let returnFocusTo: HTMLElement | null = null
let prevOverflow = ''

const resetScroll = () => nextTick(() => stageRef.value?.scrollTo({ top: 0 }))

const step = (delta: number) => {
  const n = visible.value.length
  if (n < 2) return
  index.value = (index.value + delta + n) % n
  resetScroll()
}

const goTo = (i: number) => {
  if (i === index.value) return
  index.value = i
  resetScroll()
}

// 画面名がそろっているときは、下のバーに画面の一覧を出して直接移動できるようにする
const hasPageList = computed(() => hasMany.value && visible.value.every((img) => img.caption))
const pageListRef = ref<HTMLElement | null>(null)
// いま見ている画面のボタンが一覧の外に隠れないよう、見える位置までずらす
watch([index, device], () =>
  nextTick(() =>
    pageListRef.value
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' }),
  ),
)

// 端末を切り替えても、いま見ている画面のまま見比べられるようにする
// （同じ画面名 → 同じ順番 → 先頭 の順で探す）
const selectDevice = (d: Device) => {
  if (d === device.value) return
  const caption = current.value?.caption
  const prevIndex = index.value
  device.value = d
  const list = visible.value
  const sameCaption = caption ? list.findIndex((img) => img.caption === caption) : -1
  index.value = sameCaption >= 0 ? sameCaption : prevIndex < list.length ? prevIndex : 0
  resetScroll()
}

const close = () => {
  open.value = false
}

// 開いている間はこのビューアだけがキーを受け取る（後ろのパネルが Esc で閉じないように）
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight' && hasMany.value) step(1)
  else if (e.key === 'ArrowLeft' && hasMany.value) step(-1)
  else return
  e.preventDefault()
  e.stopPropagation()
}

watch(open, async (isOpen) => {
  if (isOpen) {
    // スマホで開いたときは、スマホのデザインから見せる
    const preferSp = window.matchMedia('(max-width: 767px)').matches && devices.value.includes('sp')
    device.value = preferSp ? 'sp' : (devices.value[0] ?? null)
    index.value = 0
    returnFocusTo = document.activeElement as HTMLElement | null
    prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown, true)
    await nextTick()
    closeRef.value?.focus()
  } else {
    document.documentElement.style.overflow = prevOverflow
    window.removeEventListener('keydown', onKeydown, true)
    returnFocusTo?.focus({ preventScroll: true })
    returnFocusTo = null
  }
})

onBeforeUnmount(() => {
  if (open.value) {
    document.documentElement.style.overflow = prevOverflow
    window.removeEventListener('keydown', onKeydown, true)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="viewer">
      <div v-if="open && current" class="_viewer" @click.self="close">
        <div class="_frame" role="dialog" aria-modal="true" :aria-label="`${title}：${label}`">
          <div class="_bar">
            <p class="_title">
              {{ title }}
              <span v-if="current.caption" class="_caption" aria-live="polite">{{ current.caption }}</span>
            </p>
            <div v-if="devices.length > 1" class="_tabs" role="group" aria-label="表示する端末">
              <button
                v-for="d in devices"
                :key="d"
                type="button"
                class="neu-button _tab"
                :aria-pressed="device === d"
                @click="selectDevice(d)"
              >
                {{ deviceLabel[d] }}
              </button>
            </div>
            <span v-if="hasMany" class="_count" aria-live="polite">{{ index + 1 }} / {{ visible.length }}</span>
            <button ref="closeRef" type="button" class="neu-button _round" :aria-label="`${label}を閉じる`" @click="close">
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div ref="stageRef" :class="[{ _stage_tall: isTall }, '_stage']" tabindex="0" @click.self="close">
            <img
              :key="current.src"
              :src="current.src"
              :alt="current.alt"
              :width="current.width"
              :height="current.height"
              :class="[{ _image_tall: isTall, _image_sp: current.device === 'sp' }, '_image']"
            />
          </div>

          <div v-if="hasMany" class="_nav">
            <button type="button" class="neu-button _round" aria-label="前の画像" @click="step(-1)">
              <span aria-hidden="true">‹</span>
            </button>
            <div v-if="hasPageList" ref="pageListRef" class="_pages" role="group" aria-label="画面の一覧">
              <button
                v-for="(img, i) in visible"
                :key="img.src"
                type="button"
                class="neu-button _page"
                :aria-current="i === index"
                @click="goTo(i)"
              >
                {{ img.caption }}
              </button>
            </div>
            <button type="button" class="neu-button _round" aria-label="次の画像" @click="step(1)">
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
._viewer {
  position: fixed;
  inset: 0;
  /* 詳細パネル（PC）・ポップアップ（スマホ）・ヘッダーより上 */
  z-index: 300;
  display: grid;
  place-items: center;
  padding: clamp(12px, 3vw, 40px);
  background: rgba(31, 42, 68, 0.5);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
._frame {
  display: flex;
  flex-direction: column;
  width: min(100%, 1200px);
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  border-radius: var(--radius-card);
  background: rgba(240, 244, 249, 0.94);
  box-shadow: 0 24px 64px rgba(31, 42, 68, 0.3);
}
._bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 16px 12px 24px;
  background: var(--base);
}
._title {
  flex: 1 1 12em;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* いま見ている画面名（複数ページある案件で、どの画面かがわかるように） */
._caption {
  display: block;
  overflow: hidden;
  color: var(--sub);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
}
._tabs {
  display: flex;
  gap: 10px;
}
._tab {
  padding: 8px 18px;
  font-size: 13px;
}
._tab[aria-pressed='true'] {
  color: var(--indigo);
  font-weight: 700;
}
._count {
  font-family: var(--font-en);
  font-size: 14px;
  color: var(--sub);
  font-variant-numeric: tabular-nums;
}
._stage {
  flex: 1 1 auto;
  min-height: 0;
  /*
   * flex にして高さを確定させる（grid だと画像の max-height: 100% が効かず、
   * 短い画面も枠からはみ出してスクロールが必要になっていた）
   */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 16px;
  overscroll-behavior: contain;
}
._stage:focus-visible {
  outline: 2px solid var(--indigo);
  outline-offset: -4px;
}
/* 縦長のページ全体キャプチャは、上から順にスクロールして見せる */
._stage_tall {
  align-items: flex-start;
}
._image {
  flex: 0 0 auto;
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(31, 42, 68, 0.12);
}
._image_tall {
  max-height: none;
}
/* スマホの画像は実際の画面幅（390px）を上限に見せる */
._image_sp {
  max-width: min(100%, 390px);
}
/* ページ全体のキャプチャは、画像の解像度にかかわらず実際の画面幅にそろえる */
._image_sp._image_tall {
  width: min(100%, 390px);
}
._nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--base);
}
/* 画面の一覧（横に並べ、収まらないぶんは横スクロール） */
._pages {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  justify-content: safe center;
  gap: 10px;
  /* ボタンの影が切れないよう、上下左右に余白をとる */
  padding: 8px 10px;
  overflow-x: auto;
  scrollbar-width: none;
  /* 端をふんわり消して、横に続きがあることを示す */
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
}
._pages::-webkit-scrollbar {
  display: none;
}
._page {
  flex: 0 0 auto;
  padding: 7px 14px;
  font-size: 12px;
  white-space: nowrap;
}
._page[aria-current='true'] {
  box-shadow: var(--neu-pressed);
  color: var(--indigo);
  font-weight: 700;
}
._round {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
}
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.25s ease;
}
.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}
</style>
