<template>
  <div :class="accountShow && hasPerm('account:query') ? 'main-box-show' : 'main-box-hide'">
    <div :class="accountShow && hasPerm('account:query') ? 'block-show' : 'block-hide'" @click="uiStore.accountShow = false"></div>
    <account  :class="accountShow && hasPerm('account:query') ? 'show' : 'hide'" />
    <div class="workspace-frame" :class="{ 'workspace-frame--plain': route.name === 'email' || route.name === 'content' }">
      <div v-if="route.name !== 'email' && route.name !== 'content'" class="workspace-intro">
        <div>
          <span class="workspace-eyebrow">XIAOLINYX MAIL / {{ String(route.name || 'WORKSPACE').toUpperCase() }}</span>
          <h1>{{ $t(route.meta.title || 'inbox') }}</h1>
          <p>{{ $t(pageIntroKey) }}</p>
        </div>
        <span class="workspace-intro-icon" aria-hidden="true"><Icon :icon="pageIcon" width="28" height="28" /></span>
      </div>
      <router-view class="main-view" v-slot="{ Component,route }">
        <keep-alive :include="['email','all-email','send','sys-setting','star','user','role','analysis','reg-key','draft']">
          <component :is="Component" :key="route.name"/>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script setup>
import account from '@/layout/account/index.vue'
import {useUiStore} from "@/store/ui.js";
import {useSettingStore} from "@/store/setting.js";
import {computed, onBeforeUnmount, onMounted, watch} from "vue";
import { useRoute } from 'vue-router'
import { hasPerm } from "@/perm/perm.js"
import { Icon } from '@iconify/vue'

const settingStore = useSettingStore()
const uiStore = useUiStore();
const route = useRoute()
const pageIntroKey = computed(() => ({
  send: 'sentIntro', draft: 'draftIntro', star: 'starIntro', setting: 'settingsIntro',
  user: 'usersIntro', 'all-email': 'allMailIntro', role: 'rolesIntro',
  analysis: 'analyticsIntro', 'reg-key': 'inviteIntro', 'sys-setting': 'systemIntro'
}[route.name] || 'inboxIntro'))
const pageIcon = computed(() => ({
  send: 'solar:plain-linear', draft: 'solar:document-text-linear', star: 'solar:star-linear',
  setting: 'solar:user-circle-linear', user: 'solar:users-group-rounded-linear',
  'all-email': 'solar:letter-linear', role: 'solar:shield-keyhole-linear',
  analysis: 'solar:chart-2-linear', 'reg-key': 'solar:key-linear',
  'sys-setting': 'solar:settings-linear'
}[route.name] || 'solar:letter-opened-linear'))
let  innerWidth =  window.innerWidth

let elNotification = null

const accountShow = computed(() => {
  return uiStore.accountShow && settingStore.settings.manyEmail === 0
})

watch(() => uiStore.changeNotice, () => {

  const settings = settingStore.settings

  let data = {
    notice: settings.notice,
    noticeWidth: settings.noticeWidth,
    noticeTitle: settings.noticeTitle,
    noticeContent: settings.noticeContent,
    noticeType: settings.noticeType,
    noticeDuration: settings.noticeDuration,
    noticePosition: settings.noticePosition,
    noticeOffset: settings.noticeOffset
  }

  showNotice(data)
})

watch(() => uiStore.changePreview, () => {
  showNotice(uiStore.previewData)
})

function showNotice(data) {

  if (data.notice === 1) {
    return;
  }

  if (elNotification) {
    elNotification.close()
  }

  const style = document.createElement('style');
  style.innerHTML = `
  .custom-notice.el-notification {
    --el-notification-width: min(${data.noticeWidth}px,calc(100% - 30px)) !important;
  }
  `;

  document.head.appendChild(style);

  elNotification = ElNotification({
    title: data.noticeTitle,
    message: `<div style="width: 100%;height: 100%;">${data.noticeContent}</div>`,
    type: data.noticeType === 'none' ? '' : data.noticeType,
    duration: data.noticeDuration,
    position: data.noticePosition,
    offset: data.noticeOffset,
    dangerouslyUseHTMLString: true,
    customClass: 'custom-notice'
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (['content','email','send'].includes(route.meta.name)) {
    if (innerWidth !==  window.innerWidth) {
      innerWidth = window.innerWidth;
      uiStore.accountShow = window.innerWidth >= 767;
    }
  }
}

</script>
<style lang="scss" scoped>

.block-show {
  position: fixed;
  @media (max-width: 767px) {
    position: absolute;
    right: 0;
    border: 0;
    height: 100%;
    width: 100%;
    background: #000000;
    opacity: 0.6;
    z-index: 10;
    transition: all 300ms;
  }
}

.block-hide {
  position: fixed;
  pointer-events: none;
  transition: all 300ms;
}

.show {
  transition: all 100ms;
  @media (max-width: 767px) {
    position: fixed;
    z-index: 100;
    width: 260px;
  }
}

.hide {
  transition: all 100ms;
  position: fixed;
  transform: translateX(-100%);
  opacity: 0;
  @media (max-width: 1024px) {
    width: 260px;
    z-index: 100;
  }
}


.main-box-show {
  display: grid;
  grid-template-columns: 260px  1fr;
  height: calc(100% - 60px);
  min-height: 0;
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.main-box-hide {
  display: grid;
  grid-template-columns: 1fr;
  height: calc(100% - 60px);
  min-height: 0;
}


.workspace-frame {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  min-height: 0;
  padding: clamp(18px, 2.3vw, 32px);
  background: radial-gradient(circle at 76% 0%, rgba(213, 225, 246, .32), transparent 42%), #f6f8fc;
}
.workspace-frame--plain { padding: 0; gap: 0; background: transparent; }
.workspace-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 1420px);
  margin: 0 auto;
  color: #172a45;
}
.workspace-eyebrow { color: #567db8; font-size: 11px; font-weight: 750; letter-spacing: .15em; }
.workspace-intro h1 { margin: 7px 0 4px; font-size: clamp(25px, 2vw, 31px); font-weight: 750; letter-spacing: -.04em; }
.workspace-intro p { margin: 0; color: #78879b; font-size: 13px; }
.workspace-intro-icon { display: grid; place-items: center; width: 56px; height: 56px; border: 1px solid #dce7f5; border-radius: 18px; background: rgba(255,255,255,.76); color: #3969bc; box-shadow: 0 10px 28px rgba(33,75,136,.06); }
.workspace-frame:not(.workspace-frame--plain) :deep(.main-view) { width: min(100%, 1420px); flex: 1; min-height: 0; height: auto; margin: 0 auto; overflow: hidden; border: 1px solid #e3eaf4; border-radius: 18px; background: var(--el-bg-color); box-shadow: 0 18px 45px rgba(26,55,98,.055); }
.workspace-frame--plain :deep(.main-view) { min-height: 0; height: 100%; }
:global(.dark) .workspace-frame { background: radial-gradient(circle at 76% 0%, rgba(53,80,123,.18), transparent 42%), #111a2a; }
:global(.dark) .workspace-intro { color: #e6efff; }
:global(.dark) .workspace-intro p { color: #9eacc2; }
:global(.dark) .workspace-intro-icon { background: #1c2a40; border-color: #304159; color: #a8c4f4; }
:global(.dark) .workspace-frame:not(.workspace-frame--plain) :deep(.main-view) { border-color: #304159; }
@media (max-width: 767px) { .workspace-frame { padding: 13px; gap: 13px; } .workspace-frame--plain { padding: 0; gap: 0; } .workspace-intro-icon { width: 44px; height: 44px; border-radius: 14px; } }

.main-view {
  background: var(--el-bg-color);
}


.navigation {
  height: 30px;
  border-bottom: solid 1px var(--el-menu-border-color);
  display: inline-flex;
  justify-items: center;
  align-items: center;
  width: 100%;
  .tag {
    background: var(--el-bg-color);
    margin-left: 5px;
  }
}
</style>
