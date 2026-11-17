<script setup lang="ts">
// セクション見出し：後ろに線だけの大きな英字、下に線と3色の丸を添える。
// 3色はサイト内で「デザイン・実装・その両方」を表している色（ピンク・青緑・藍色）。
defineProps<{
  en: string
}>()
</script>

<template>
  <div class="_head">
    <span class="_en" lang="en" aria-hidden="true">{{ en }}</span>
    <h2 class="_ja"><slot /></h2>
    <span class="_deco" aria-hidden="true">
      <span class="_line" />
      <span class="_dot _dot_design" />
      <span class="_dot _dot_code" />
      <span class="_dot _dot_both" />
    </span>
  </div>
</template>

<style scoped>
._head {
  position: relative;
  margin: 0 0 36px;
  /* 英字の上側がはみ出す分だけ上に余白をとる */
  padding-top: clamp(28px, 4vw, 60px);
}
/* 線だけの大きな英字（流れる文字・回る丸文字と同じ書体） */
._en {
  position: absolute;
  top: 0;
  left: -0.04em;
  z-index: -1;
  font-family: 'Archivo Black', var(--font-en);
  font-size: clamp(56px, 8.5vw, 132px);
  line-height: 1;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1.2px rgba(31, 42, 68, 0.28);
  pointer-events: none;
  user-select: none;
}
._ja {
  position: relative;
  margin: 0;
  font-size: clamp(26px, 3.4vw, 40px);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.02em;
}
._deco {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
}
._line {
  width: 40px;
  height: 2px;
  margin-right: 6px;
  border-radius: 2px;
  background: var(--ink);
}
._dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
._dot_design {
  background: var(--mauve);
}
._dot_code {
  background: var(--teal);
}
._dot_both {
  background: var(--indigo);
}
</style>
