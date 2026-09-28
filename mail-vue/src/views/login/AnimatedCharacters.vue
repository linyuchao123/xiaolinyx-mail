<template>
  <div ref="scene" class="character-scene" :class="[`is-${mood}`, { 'is-glancing': glancing, 'is-blinking-purple': blinking.purple, 'is-blinking-black': blinking.black }]" :style="sceneStyle" aria-hidden="true">
    <div class="character purple"><div class="face"><span class="eye"><i /></span><span class="eye"><i /></span></div></div>
    <div class="character black"><div class="face"><span class="eye"><i /></span><span class="eye"><i /></span></div></div>
    <div class="character orange"><div class="face"><span class="eye" /><span class="eye" /></div></div>
    <div class="character yellow"><div class="face"><span class="eye" /><span class="eye" /></div><span class="mouth" /></div>
  </div>
</template>

<script setup>
// Character proportions and behavior adapted from CareerCompass (MIT).
// Only focus, pointer position and input activity are observed; input values stay in the form.
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  mood: { type: String, default: 'idle' },
  activity: { type: Number, default: 0 },
})

const scene = ref(null)
const positions = ref({
  purple: { x: 0, y: 0, skew: 0 }, black: { x: 0, y: 0, skew: 0 },
  orange: { x: 0, y: 0, skew: 0 }, yellow: { x: 0, y: 0, skew: 0 },
})
const glancing = ref(false)
const blinking = ref({ purple: false, black: false })
const sceneStyle = computed(() => {
  const result = {}
  for (const [name, position] of Object.entries(positions.value)) {
    result[`--${name}-face-x`] = `${position.x}px`
    result[`--${name}-face-y`] = `${position.y}px`
    result[`--${name}-skew`] = `${position.skew}deg`
    result[`--${name}-pupil-x`] = `${position.pupilX || 0}px`
    result[`--${name}-pupil-y`] = `${position.pupilY || 0}px`
  }
  return result
})

let pointer = { x: 0, y: 0 }
let pointerFrame = 0
let glanceTimer
const blinkTimers = { purple: {}, black: {} }
let reduceMotion
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function updatePointer() {
  pointerFrame = 0
  if (reduceMotion?.matches || !['idle', 'email', 'password'].includes(props.mood)) return
  const scale = Math.min(1, (scene.value?.getBoundingClientRect().width || 550) / 550)
  // Map across the viewport. Element-relative deltas saturate while the pointer is over the form.
  const x = clamp(pointer.x / window.innerWidth * 2 - 1, -1, 1)
  const y = clamp(pointer.y / window.innerHeight * 2 - 1, -1, 1)
  const next = {}
  for (const [name, response] of Object.entries({ purple: 1, black: .85, orange: .72, yellow: .93 })) {
    next[name] = {
      x: Math.round(x * 20 * response * scale * 10) / 10,
      y: Math.round(y * 12 * response * scale * 10) / 10,
      skew: Math.round(-x * 7.5 * response * 10) / 10,
      // Pupils move separately from the slower body, but stay inside the eye whites.
      pupilX: Math.round(x * 5.5 * response * 10) / 10,
      pupilY: Math.round(y * 4.5 * response * 10) / 10,
    }
  }
  positions.value = next
}

function handlePointerMove(event) {
  pointer = { x: event.clientX, y: event.clientY }
  if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer)
}

function handleResize() {
  pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer)
}

function scheduleBlink(name, delay) {
  if (reduceMotion?.matches) return
  blinkTimers[name].start = window.setTimeout(() => {
    blinking.value = { ...blinking.value, [name]: true }
    blinkTimers[name].end = window.setTimeout(() => {
      blinking.value = { ...blinking.value, [name]: false }
      scheduleBlink(name, name === 'purple' ? 3900 : 5200)
    }, 150)
  }, delay)
}

function glance() {
  if (reduceMotion?.matches) return
  clearTimeout(glanceTimer)
  glancing.value = true
  glanceTimer = window.setTimeout(() => { glancing.value = false }, 800)
}

watch(() => props.mood, (next, previous) => {
  if (next === 'email' && previous !== 'email') glance()
  else if (next !== 'email') glancing.value = false
  if (!['idle', 'email', 'password'].includes(next)) positions.value = {
    purple: { x: 0, y: 0, skew: 0 }, black: { x: 0, y: 0, skew: 0 },
    orange: { x: 0, y: 0, skew: 0 }, yellow: { x: 0, y: 0, skew: 0 },
  }
  else if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer)
})

watch(() => props.activity, () => {
  if (props.mood === 'email') glance()
})

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
  handleResize()
  scheduleBlink('purple', 2900)
  scheduleBlink('black', 4300)
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('resize', handleResize)
  if (pointerFrame) cancelAnimationFrame(pointerFrame)
  clearTimeout(glanceTimer)
  for (const timers of Object.values(blinkTimers)) {
    clearTimeout(timers.start)
    clearTimeout(timers.end)
  }
})
</script>

<style scoped>
.character-scene {
  position: relative;
  width: 100%;
  aspect-ratio: 11 / 8;
  overflow: visible;
  pointer-events: none;
  --purple-face-x: 0px; --purple-face-y: 0px; --purple-skew: 0deg;
  --black-face-x: 0px; --black-face-y: 0px; --black-skew: 0deg;
  --orange-face-x: 0px; --orange-face-y: 0px; --orange-skew: 0deg;
  --yellow-face-x: 0px; --yellow-face-y: 0px; --yellow-skew: 0deg;
}
.character {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  transition: transform .7s ease-in-out, height .7s ease-in-out;
}
.purple { left: 12.73%; width: 32.73%; height: 100%; background: #6c3ff5; border-radius: 10px 10px 0 0; z-index: 1; transform: skewX(var(--purple-skew)); }
.black { left: 43.64%; width: 21.82%; height: 77.5%; background: #2d2d2d; border-radius: 8px 8px 0 0; z-index: 2; transform: skewX(var(--black-skew)); }
.orange { left: 0; width: 43.64%; height: 50%; background: #ff9b6b; border-radius: 50% 50% 0 0 / 60% 60% 0 0; z-index: 3; transform: skewX(var(--orange-skew)); }
.yellow { left: 56.36%; width: 25.45%; height: 57.5%; background: #e8d754; border-radius: 50% 50% 0 0 / 30% 30% 0 0; z-index: 4; transform: skewX(var(--yellow-skew)); }
.is-idle .character { transform: skewX(0deg); }
.face { position: absolute; display: flex; justify-content: space-between; align-items: center; transition: left .7s ease-in-out, top .7s ease-in-out, transform .7s ease-in-out; }
.orange .face, .yellow .face { transition-duration: .2s; transition-timing-function: ease-out; }
.purple .face { width: 42%; left: 25%; top: 10%; transform: translate(var(--purple-face-x), var(--purple-face-y)); }
.black .face { width: 49%; left: 22%; top: 10%; transform: translate(var(--black-face-x), var(--black-face-y)); }
.orange .face { width: 30%; left: 34%; top: 45%; transform: translate(var(--orange-face-x), var(--orange-face-y)); }
.yellow .face { width: 36%; left: 37%; top: 17%; transform: translate(var(--yellow-face-x), var(--yellow-face-y)); }
.eye { display: grid; place-items: center; flex: 0 0 auto; width: 24%; aspect-ratio: 1; border-radius: 50%; background: #fff; transition: height .15s ease, transform .12s ease; }
.black .eye { width: 27%; }
.eye i { display: block; width: 39%; height: 39%; border-radius: 50%; background: #2d2d2d; transform: translate(var(--pupil-x, 0px), var(--pupil-y, 0px)); transition: transform .1s ease-out; }
.orange .eye, .yellow .eye { width: 17%; background: #2d2d2d; transform: translate(var(--pupil-x, 0px), var(--pupil-y, 0px)); }
.yellow .eye { width: 24%; }
.mouth { position: absolute; left: 29%; top: 38%; width: 57%; height: 4px; border-radius: 99px; background: #2d2d2d; transition: left .2s ease-out, top .2s ease-out, transform .2s ease-out; }
.is-blinking-purple .purple .eye, .is-blinking-black .black .eye { transform: scaleY(.12); }
.is-idle .purple .eye i, .is-email .purple .eye i, .is-password .purple .eye i { --pupil-x: var(--purple-pupil-x); --pupil-y: var(--purple-pupil-y); }
.is-idle .black .eye i, .is-email .black .eye i, .is-password .black .eye i { --pupil-x: var(--black-pupil-x); --pupil-y: var(--black-pupil-y); }
.is-idle .orange .eye, .is-email .orange .eye, .is-password .orange .eye { --pupil-x: var(--orange-pupil-x); --pupil-y: var(--orange-pupil-y); }
.is-idle .yellow .eye, .is-email .yellow .eye, .is-password .yellow .eye { --pupil-x: var(--yellow-pupil-x); --pupil-y: var(--yellow-pupil-y); }

/* Email: a shared glance and gentle lean, as in the reference interaction. */
.is-email .purple, .is-password .purple { height: 110%; transform: skewX(calc(var(--purple-skew) - 12deg)) translateX(22%); }
.is-email .black, .is-password .black { transform: skewX(calc(var(--black-skew) - 4deg)) translateX(9%); }
.is-email.is-glancing .black { transform: skewX(calc(var(--black-skew) - 7deg)) translateX(17%); }
.is-email.is-glancing .purple .face { left: 31%; top: 16%; }
.is-email.is-glancing .black .face { left: 27%; top: 4%; }

/* A masked password is safe to watch; revealing it makes everyone turn away at once. */
.is-revealed .purple, .is-revealed .black, .is-revealed .orange, .is-revealed .yellow { transform: skewX(0deg); }
.is-revealed .purple .face { left: 11%; top: 9%; }
.is-revealed .black .face { left: 8%; top: 9%; }
.is-revealed .orange .face { left: 21%; top: 42%; }
.is-revealed .yellow .face { left: 14%; top: 15%; }
.is-revealed .yellow .mouth { left: 7%; }
.is-revealed .eye i { --pupil-x: -4px; --pupil-y: -4px; }
.is-revealed .orange .eye, .is-revealed .yellow .eye { --pupil-x: -5px; --pupil-y: -4px; }
.is-error { animation: shake .5s ease-in-out; }
.is-error .yellow .mouth { transform: rotate(9deg); }
@keyframes shake { 20%, 60% { translate: -5px 0; } 40%, 80% { translate: 5px 0; } }
@media (prefers-reduced-motion: reduce) {
  .character, .face, .eye, .eye i, .mouth { transition: none; }
  .is-error { animation: none; }
}
</style>
