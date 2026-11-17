<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Work } from '../../data/profile'
import DesignViewer from '../DesignViewer/DesignViewer.vue'

// 案件の詳細（公開サイト／デザイン・概要・ポイント・役割）。
// PC の右側パネルとスマホのポップアップで使う。
const props = defineProps<{
  work: Work
}>()

const viewerOpen = ref(false)
// 実装のみ担当した案件は、デザインを自分で作ったと誤解されないよう「画面を見る」にする
const viewerLabel = computed(() => (props.work.kind === 'code' ? '画面を見る' : 'デザインを見る'))
</script>

<template>
  <div class="_detail">
    <!--
      一番下だとスクロールしないと気づかないため、概要の上に置く。
      「デザインを見る／画面を見る」は画像があるときだけ出す
    -->
    <div v-if="work.url || work.designImages?.length" class="_actions neu-zone">
      <a v-if="work.url" :href="work.url" target="_blank" rel="noopener" class="neu-button">
        公開サイトを開く<span class="_visually_hidden">（新しいタブ）</span>
      </a>
      <button
        v-if="work.designImages?.length"
        type="button"
        class="neu-button"
        aria-haspopup="dialog"
        @click="viewerOpen = true"
      >
        {{ viewerLabel }}
      </button>
    </div>
    <DesignViewer
      v-if="work.designImages?.length"
      v-model:open="viewerOpen"
      :images="work.designImages"
      :title="work.title"
      :label="viewerLabel"
    />
    <div class="_block">
      <h4>概要</h4>
      <p>{{ work.summary }}</p>
    </div>
    <div class="_block">
      <h4>ポイント</h4>
      <ul class="_points">
        <li v-for="point in work.points" :key="point">{{ point }}</li>
      </ul>
    </div>
    <div class="_block">
      <h4>役割</h4>
      <p>{{ work.role }}</p>
    </div>
  </div>
</template>

<style scoped>
._detail {
  display: grid;
  gap: 20px;
}
._actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
._block h4 {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--kind, var(--indigo));
}
._block p {
  max-width: 38em;
  margin: 0;
  font-size: 15px;
}
._points {
  margin: 0;
  padding-left: 1.2em;
  font-size: 15px;
}
._points li + li {
  margin-top: 6px;
}
._visually_hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
