<template>
  <button type="button" class="creator-trigger" :class="`creator-trigger--${variant}`" :aria-label="t('creatorOpen')" @click="openCreator">
    <img src="/creator/github.jpg" alt="" />
    <span class="creator-trigger__text"><strong>{{ t('creatorName') }}</strong><small>{{ t('creatorOpen') }}</small></span>
    <span class="creator-trigger__mobile-label">{{ t('creatorAbout') }}</span>
    <Icon icon="mdi:arrow-top-right" width="17" height="17" class="creator-trigger__arrow" />
  </button>

  <el-dialog v-model="show" class="creator-dialog" width="min(760px, calc(100vw - 28px))" align-center append-to-body :show-close="false">
    <template #header>
      <div class="creator-dialog__heading">
        <div class="creator-dialog__eyebrow">XIAOLINYX / CONNECT</div>
        <button type="button" class="creator-dialog__close" :aria-label="t('creatorClose')" @click="show = false"><Icon icon="mdi:close" width="20" height="20" /></button>
      </div>
    </template>
    <div class="creator-intro">
      <div class="creator-intro__photos"><img src="/creator/github.jpg" alt="" /><img src="/creator/x.jpg" alt="" /></div>
      <div><p class="creator-intro__kicker">{{ t('creatorKicker') }}</p><h2>{{ t('creatorTitle') }}</h2><p>{{ t('creatorDescription') }}</p></div>
    </div>

    <div class="creator-section-title"><span>{{ t('creatorOnline') }}</span><span>01 / 02</span></div>
    <div class="creator-socials">
      <a class="creator-social" href="https://github.com/linyuchao123" target="_blank" rel="noopener noreferrer">
        <span class="creator-social__icon"><Icon icon="mdi:github" width="25" height="25" /></span>
        <span class="creator-social__copy"><strong>GitHub</strong><small>{{ t('creatorGithubDesc') }}</small><em>@linyuchao123</em></span>
        <Icon icon="mdi:arrow-top-right" width="20" height="20" class="creator-social__arrow" />
      </a>
      <a class="creator-social" href="https://x.com/xiaolinyx123" target="_blank" rel="noopener noreferrer">
        <span class="creator-social__icon creator-social__icon--x"><Icon icon="simple-icons:x" width="20" height="20" /></span>
        <span class="creator-social__copy"><strong>X / Twitter</strong><small>{{ t('creatorXDesc') }}</small><em>@xiaolinyx123</em></span>
        <Icon icon="mdi:arrow-top-right" width="20" height="20" class="creator-social__arrow" />
      </a>
    </div>

    <div class="creator-section-title"><span>{{ t('creatorWechatSection') }}</span><span>03 / 05</span></div>
    <div class="creator-qr-grid">
      <div class="creator-qr-card">
        <el-image src="/creator/wechat-official.jpg" :preview-src-list="['/creator/wechat-official.jpg']" preview-teleported fit="contain" :alt="t('creatorOfficial')" />
        <div><strong>{{ t('creatorOfficial') }}</strong><p>{{ t('creatorOfficialDesc') }}</p><small>{{ t('creatorZoom') }}</small></div>
      </div>
      <div class="creator-qr-card">
        <el-image src="/creator/wechat-personal.jpg" :preview-src-list="['/creator/wechat-personal.jpg']" preview-teleported fit="contain" :alt="t('creatorWechat')" />
        <div><strong>{{ t('creatorWechat') }}</strong><p>{{ t('creatorWechatDesc') }}</p><small>{{ t('creatorZoom') }}</small></div>
      </div>
      <div class="creator-qr-card creator-qr-card--group">
        <el-image v-if="groupQrActive" src="/creator/ai-group.jpg" :preview-src-list="['/creator/ai-group.jpg']" preview-teleported fit="contain" :alt="t('creatorGroup')" />
        <span v-else class="creator-qr-card__expired"><Icon icon="mdi:account-group-outline" width="34" height="34" /></span>
        <div><strong>{{ t('creatorGroup') }}</strong><p>{{ groupQrActive ? t('creatorGroupDesc') : t('creatorGroupExpired') }}</p><small v-if="groupQrActive">{{ t('creatorGroupValidity') }}</small></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {Icon} from '@iconify/vue'

defineProps({variant: {type: String, default: 'header'}})
const {t} = useI18n()
const show = ref(false)
// The shared group QR is explicitly temporary; the personal card remains available afterwards.
const groupQrActive = ref(false)
function openCreator() {
  groupQrActive.value = Date.now() < Date.parse('2026-10-05T00:00:00+08:00')
  show.value = true
}
</script>

<style>
.creator-dialog.el-dialog { border-radius: 22px; padding: 0; overflow: hidden; background: #f8faff; box-shadow: 0 28px 90px rgba(16, 32, 57, .24); }
.creator-dialog .el-dialog__header { margin: 0; padding: 23px 28px 0; }
.creator-dialog .el-dialog__body { padding: 0 28px 28px; }
.creator-dialog__heading { display: flex; align-items: center; justify-content: space-between; }
.creator-dialog__eyebrow { font-size: 10px; letter-spacing: .2em; font-weight: 800; color: #6686b5; }
.creator-dialog__close { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #e3eaf4; border-radius: 11px; background: #fff; color: #57708f; cursor: pointer; }
.creator-intro { display: flex; align-items: center; gap: 22px; padding: 10px 0 24px; }
.creator-intro__photos { display: flex; flex: 0 0 auto; padding-left: 8px; }
.creator-intro__photos img { width: 72px; height: 72px; object-fit: cover; border-radius: 18px; border: 4px solid #f8faff; box-shadow: 0 7px 20px rgba(27, 48, 80, .16); }
.creator-intro__photos img + img { margin-left: -22px; transform: rotate(7deg) translateY(5px); }
.creator-intro__kicker { margin: 0 0 4px; color: #4c73b5; font-size: 12px; font-weight: 700; }
.creator-intro h2 { margin: 0; color: #152d4d; font-size: clamp(20px, 3vw, 29px); letter-spacing: -.04em; line-height: 1.2; }
.creator-intro p:last-child { margin: 8px 0 0; color: #6b7c96; font-size: 13px; line-height: 1.6; }
.creator-section-title { display: flex; justify-content: space-between; border-top: 1px solid #dfe7f2; padding: 13px 2px 11px; color: #36577e; font-size: 12px; font-weight: 800; letter-spacing: .06em; }
.creator-section-title span:last-child { color: #9aabc2; font-size: 11px; letter-spacing: .1em; }
.creator-socials { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 23px; }
.creator-social { display: flex; align-items: flex-start; min-width: 0; gap: 12px; padding: 16px; border: 1px solid #e1e9f4; border-radius: 16px; background: #fff; color: #192c48; text-decoration: none; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.creator-social:hover, .creator-social:focus-visible { transform: translateY(-3px); border-color: #b6cced; box-shadow: 0 12px 25px rgba(46, 83, 140, .11); }
.creator-social__icon { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border-radius: 12px; background: #1b2f4b; color: #fff; }
.creator-social__icon--x { background: #dce9ff; color: #153665; }
.creator-social__copy { display: flex; flex-direction: column; min-width: 0; gap: 3px; }
.creator-social__copy strong { font-size: 15px; }
.creator-social__copy small { color: #6c7c92; font-size: 12px; line-height: 1.35; }
.creator-social__copy em { color: #4d72a6; font-size: 11px; font-style: normal; }
.creator-social__arrow { margin-left: auto; flex: 0 0 auto; color: #6583ab; }
.creator-qr-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.creator-qr-card { min-width: 0; padding: 14px; border: 1px solid #e1e9f4; border-radius: 16px; background: #fff; }
.creator-qr-card .el-image, .creator-qr-card__expired { display: grid; place-items: center; width: 100%; height: 148px; padding: 7px; border-radius: 10px; background: #f5f7fa; cursor: zoom-in; }
.creator-qr-card .el-image img { object-fit: contain; }
.creator-qr-card__expired { cursor: default; color: #7c94b6; }
.creator-qr-card strong { display: block; margin-top: 11px; color: #192f4c; font-size: 14px; }
.creator-qr-card p { margin: 5px 0 0; color: #667a97; font-size: 11px; line-height: 1.5; }
.creator-qr-card small { display: block; margin-top: 8px; color: #7a96bc; font-size: 10px; }
.creator-trigger { display: inline-grid; grid-template-columns: 30px auto 17px; align-items: center; justify-items: center; flex: 0 0 auto; gap: 8px; height: 40px; padding: 4px 10px 4px 4px; border: 1px solid #dfe8f5; border-radius: 12px; background: #f7faff; color: #274d7c; cursor: pointer; vertical-align: middle; line-height: 1; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.creator-trigger:hover, .creator-trigger:focus-visible { transform: translateY(-2px); border-color: #abc8ed; box-shadow: 0 6px 18px rgba(36, 85, 157, .13); }
.creator-trigger img { display: block; width: 30px; height: 30px; border-radius: 8px; object-fit: cover; }
.creator-trigger__text { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; line-height: 1.12; white-space: nowrap; }
.creator-trigger__text strong { font-size: 12px; }
.creator-trigger__text small { margin-top: 3px; font-size: 10px; color: #7490b2; }
.creator-trigger__mobile-label { display: none; white-space: nowrap; font-size: 12px; font-weight: 700; letter-spacing: .02em; }
.creator-trigger__arrow { color: #6285b2; }
.creator-trigger--login { position: absolute; top: clamp(30px, 4vw, 55px); right: clamp(30px, 4vw, 55px); z-index: 3; border-color: rgba(255,255,255,.24); background: rgba(255,255,255,.13); color: #fff; backdrop-filter: blur(12px); }
.creator-trigger--login .creator-trigger__text small, .creator-trigger--login .creator-trigger__arrow { color: #d4e3fa; }
.dark .creator-trigger--header { border-color: #34435c; background: #1d2b40; color: #e6efff; }
.dark .creator-dialog.el-dialog { background: #172338; }
.dark .creator-dialog__close, .dark .creator-social, .dark .creator-qr-card { background: #1d2c43; border-color: #334762; color: #e8f0fc; }
.dark .creator-intro__photos img { border-color: #172338; }
.dark .creator-intro h2, .dark .creator-social__copy strong, .dark .creator-qr-card strong { color: #edf4ff; }
.dark .creator-section-title { border-color: #334762; color: #b7ccef; }
.dark .creator-qr-card .el-image, .dark .creator-qr-card__expired { background: #253752; }
@media (max-width: 760px) {
  .creator-dialog .el-dialog__header { padding: 18px 18px 0; }
  .creator-dialog .el-dialog__body { padding: 0 18px 20px; }
  .creator-qr-grid { grid-template-columns: 1fr; }
  .creator-qr-card { display: flex; gap: 15px; align-items: center; }
  .creator-qr-card .el-image, .creator-qr-card__expired { flex: 0 0 112px; width: 112px; height: 112px; }
  .creator-qr-card strong { margin-top: 0; }
  .creator-dialog.el-dialog { max-height: calc(100dvh - 28px); overflow-y: auto; }
}
@media (max-width: 767px) {
  .creator-trigger { grid-template-columns: 30px auto; gap: 6px; padding: 4px 9px 4px 4px; }
  .creator-trigger__text, .creator-trigger__arrow { display: none; }
  .creator-trigger__mobile-label { display: block; }
}
@media (max-width: 540px) {
  .creator-trigger--login { top: 20px; right: 20px; }
  .creator-intro { gap: 12px; }
  .creator-intro__photos img { width: 52px; height: 52px; border-radius: 14px; }
  .creator-intro__photos img + img { margin-left: -20px; }
  .creator-socials { grid-template-columns: 1fr; }
}
@media (max-width: 360px) {
  .creator-trigger--header { grid-template-columns: auto; padding: 0 7px; }
  .creator-trigger--header img { display: none; }
}
@media (prefers-reduced-motion: reduce) { .creator-trigger, .creator-social { transition: none; } }
</style>
