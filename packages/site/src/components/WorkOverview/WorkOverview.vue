<script setup lang="ts">
import { PROCESSES, type Work, type WorkKind } from '../../data/profile'

// 案件の見出し部分（担当範囲・会社・案件名・期間・担当工程・ツール）。
// カードと詳細パネルの両方で使う。
defineProps<{
  work: Work
  titleId?: string
  size?: 'card' | 'panel'
}>()

const kindLabel: Record<WorkKind, string> = {
  design: 'デザイン',
  code: '実装',
  both: 'デザイン〜実装',
}
</script>

<template>
  <div :class="[`_overview_${size ?? 'card'}`, '_overview']">
    <div class="_meta">
      <span class="_badge">{{ kindLabel[work.kind] }}</span>
      <span>{{ work.company }}</span>
    </div>
    <h3 :id="titleId" class="_title">{{ work.title }}</h3>
    <p class="_sub">{{ work.period }}（{{ work.duration }}）／ {{ work.members }}名体制</p>

    <ol class="_process" aria-label="担当工程">
      <li
        v-for="p in PROCESSES"
        :key="p"
        :class="[{ _process_on: work.processes.includes(p) }, '_process_item']"
      >
        <span class="_dot" aria-hidden="true" />{{ p }}
        <span v-if="work.processes.includes(p)" class="_visually_hidden">（担当）</span>
      </li>
    </ol>

    <ul class="_tags" aria-label="使用ツール">
      <li v-for="tool in work.tools" :key="tool">{{ tool }}</li>
    </ul>
  </div>
</template>

<style scoped>
._meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
  font-size: 12px;
  color: var(--sub);
}
._badge {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--kind, var(--indigo));
  color: #fff;
  font-weight: 700;
}
._title {
  margin: 12px 0 4px;
  font-size: 18px;
  line-height: 1.5;
}
._overview_panel ._title {
  font-size: clamp(20px, 2vw, 24px);
  line-height: 1.45;
}
._sub {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--sub);
}

._process {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.35);
  list-style: none;
  font-size: 12px;
  color: var(--faint);
}
._process_item {
  display: flex;
  gap: 5px;
  align-items: center;
}
._dot {
  width: 9px;
  height: 9px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
}
._process_on {
  color: var(--ink);
  font-weight: 700;
}
._process_on ._dot {
  border-color: var(--kind, var(--indigo));
  background: var(--kind, var(--indigo));
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

._visually_hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
