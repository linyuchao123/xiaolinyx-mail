<template>
  <span class="user-avatar" :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * .43)}px` }">
    <img v-if="activeSrc" :src="activeSrc" alt="" @error="onImageError" />
    <span v-else>{{ (name || email || '?').trim().charAt(0).toUpperCase() }}</span>
  </span>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  fallbackSrc: { type: String, default: '' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  size: { type: Number, default: 36 }
})
const activeSrc = ref('')
const retryDelays = [1000, 2000, 4000, 8000, 16000, 30000]
let retryTimer = null
let retryCount = 0
watch(() => [props.src, props.fallbackSrc], () => {
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = null
  retryCount = 0
  activeSrc.value = props.src || props.fallbackSrc || ''
}, { immediate: true })
onBeforeUnmount(() => { if (retryTimer) clearTimeout(retryTimer) })
function onImageError() {
  if (props.src?.startsWith('/api/avatar/') && activeSrc.value.startsWith(props.src) && retryCount < retryDelays.length) {
    const attempt = ++retryCount
    activeSrc.value = ''
    retryTimer = setTimeout(() => {
      activeSrc.value = `${props.src}${props.src.includes('?') ? '&' : '?'}retry=${attempt}`
      retryTimer = null
    }, retryDelays[attempt - 1])
    return
  }
  activeSrc.value = activeSrc.value !== props.fallbackSrc ? (props.fallbackSrc || '') : ''
}
</script>

<style scoped>
.user-avatar { display: inline-flex; flex: none; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; color: #315faf; background: #e7effd; font-weight: 750; line-height: 1; vertical-align: middle; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
</style>
