<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/*
 * 固定背景：WebGL で描く淡いグレイン・グラデーション。
 * - 白を土台に、FV作品の色（青緑・ピンク・空色・ラベンダー）をごく淡く流す
 * - 時間でゆっくり動き、スクロールでも少しだけ色の流れがずれる
 * - WebGL が使えない環境では CSS のグラデーションがそのまま背景になる
 * - 「動きを減らす」設定のときは止めた1枚を描き、スクロール時だけ描き直す
 */

const canvasRef = ref<HTMLCanvasElement | null>(null)
let teardown: (() => void) | null = null

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.035;
  float s = uScroll * 0.00022;

  // 座標をノイズでゆがめて、絵の具が混ざるような流れをつくる
  vec2 q = vec2(
    fbm(p * 1.1 + vec2(t, -t * 0.8) + s),
    fbm(p * 1.1 + vec2(-t * 0.7, t) + vec2(3.1, 1.3) - s)
  );
  float n1 = fbm(p * 0.9 + q * 1.8 + vec2(t * 0.5, s));
  float n2 = fbm(p * 1.2 - q * 1.5 + vec2(5.2, -t * 0.6 + s));

  vec3 base  = vec3(0.933, 0.949, 0.969); // #EEF2F7
  vec3 teal  = vec3(0.686, 0.851, 0.843); // 淡い青緑
  vec3 blush = vec3(0.949, 0.800, 0.863); // 淡いピンク
  vec3 sky   = vec3(0.773, 0.871, 0.941); // 淡い空色
  vec3 lav   = vec3(0.827, 0.839, 0.949); // 淡いラベンダー

  vec3 col = base;
  col = mix(col, sky,   smoothstep(0.38, 0.78, q.x) * 0.70);
  col = mix(col, teal,  smoothstep(0.44, 0.80, n1) * 0.80);
  col = mix(col, blush, smoothstep(0.44, 0.80, n2) * 0.75);
  col = mix(col, lav,   smoothstep(0.52, 0.85, q.y) * 0.55);

  // 細かなグレイン（フィルムの粒子感）
  float g = hash(gl_FragCoord.xy) - 0.5;
  col += g * 0.022;

  gl_FragColor = vec4(col, 1.0);
}
`

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  })
  if (!gl) return

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
  gl.useProgram(program)

  // 画面全体を覆う三角形1枚
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const uRes = gl.getUniformLocation(program, 'uRes')
  const uTime = gl.getUniformLocation(program, 'uTime')
  const uScroll = gl.getUniformLocation(program, 'uScroll')

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  // キャンバスが消去されたときの色。黒（既定）ではなく背景の淡い白にして、一瞬でも黒く見えないようにする
  gl.clearColor(0.933, 0.949, 0.969, 1)

  // やわらかいグラデーションなので、解像度は落として描いて負荷を下げる
  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5
    const w = Math.max(1, Math.round(window.innerWidth * scale))
    const h = Math.max(1, Math.round(window.innerHeight * scale))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    gl.uniform2f(uRes, w, h)
  }

  let scrollTarget = window.scrollY
  let scrollCurrent = scrollTarget
  let raf = 0
  let last = 0
  const start = performance.now()

  const draw = (now: number) => {
    gl.uniform1f(uTime, ((now - start) / 1000) % 1000)
    gl.uniform1f(uScroll, scrollCurrent)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (now - last < 33) return // 約30fpsで十分
    last = now
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.08
    draw(now)
  }

  const onScroll = () => {
    scrollTarget = window.scrollY
    if (reducedMotion.matches) {
      scrollCurrent = scrollTarget
      draw(start)
    }
  }

  // キャンバスの大きさを変えると中身が消えるため、次のフレームを待たずにその場で描き直す
  // （待つと最大 1/30 秒ほど消えたままになり、幅を変えたときにチカチカして見える）
  const onResize = () => {
    resize()
    draw(reducedMotion.matches ? start : performance.now())
  }

  const run = () => {
    cancelAnimationFrame(raf)
    if (reducedMotion.matches) draw(start)
    else raf = requestAnimationFrame(loop)
  }

  const onContextLost = (e: Event) => {
    e.preventDefault()
    cancelAnimationFrame(raf)
  }

  resize()
  gl.clear(gl.COLOR_BUFFER_BIT)
  run()
  canvas.classList.add('_ready')
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  reducedMotion.addEventListener('change', run)
  canvas.addEventListener('webglcontextlost', onContextLost)

  teardown = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    reducedMotion.removeEventListener('change', run)
    canvas.removeEventListener('webglcontextlost', onContextLost)
  }
})

onBeforeUnmount(() => teardown?.())
</script>

<template>
  <canvas ref="canvasRef" class="_shader" aria-hidden="true" />
</template>

<style scoped>
._shader {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  /* WebGL が使えないとき・描画前に見える代わりの背景 */
  background:
    radial-gradient(60% 50% at 15% 10%, #d7ebea 0%, transparent 70%),
    radial-gradient(55% 45% at 90% 40%, #f4dfe8 0%, transparent 70%),
    radial-gradient(60% 50% at 40% 95%, #dbe8f3 0%, transparent 70%),
    #eef2f7;
}
</style>
