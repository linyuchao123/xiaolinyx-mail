<template>
  <div id="login-box" :style=" background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="登录中...">
    <section class="brand-stage" :aria-label="$t('loginHeroTitle')">
      <div id="background-wrap" v-if="!settingStore.settings.background"></div>
      <div v-else class="custom-background" :style="background"></div>
      <div class="brand-content">
        <div class="brand-mark">
          <span class="brand-mark-icon"><Icon icon="mdi:email-outline" width="22" height="22" /></span>
          <span>Xiaolinyx Mail</span>
        </div>
        <CreatorLinks variant="login" />
        <div class="brand-copy">
          <p class="brand-kicker">@xiaolinyx.me</p>
          <h1>你的名字，<br><span>就是你的邮箱。</span></h1>
          <p class="brand-description">创建属于你的地址，自在收信、写信，和世界保持联系。</p>
        </div>
        <div class="mail-scene"><AnimatedCharacters :mood="characterMood" :activity="characterActivity" /></div>
      </div>
    </section>
    <div class="form-wrapper">
      <div class="container">
        <div class="form-topline"><span>{{ $t('loginWelcome') }}</span><span class="form-topline-mark"></span></div>
        <span class="form-title">Xiaolinyx Mail</span>
        <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
        <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
        <div class="auth-avatar-picker">
          <div class="auth-avatar-preview" aria-hidden="true">
            <img v-if="avatarPreview" :src="avatarPreview" alt="" />
            <Icon v-else icon="mdi:account-outline" width="26" height="26" />
          </div>
          <div class="auth-avatar-copy">
            <strong>{{ $t('authAvatarTitle') }}</strong>
            <span>{{ $t('authAvatarHint') }}</span>
          </div>
          <input ref="avatarInput" class="auth-avatar-input" type="file" accept="image/*,.heic,.heif" :aria-label="$t('authAvatarChoose')" @change="handleAvatarFile" />
          <button type="button" class="auth-avatar-action" :disabled="avatarPreparing" @click="avatarInput?.click()">{{ avatarPreparing ? $t('authAvatarProcessing') : avatarPreview ? $t('authAvatarReplace') : $t('authAvatarChoose') }}</button>
          <button v-if="avatarPreview" type="button" class="auth-avatar-remove" :disabled="avatarPreparing" :aria-label="$t('removePhoto')" @click="clearAvatar"><Icon icon="mdi:close" width="16" height="16" /></button>
        </div>
        <Transition name="form-swap" mode="out-in" appear @after-enter="onFormEntered">
        <div v-if="show === 'login'" key="login" class="form-fields">
          <label class="field-label">{{ $t('emailAccount') }}</label>
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="form.email"
                    type="text" :placeholder="$t('emailAccount')" :aria-label="$t('emailAccount')" autocomplete="username" @focus="focusEmail" @input="characterActivity++" @blur="blurCharacterField" @keyup.enter="submit">
            <template #append v-if="!hideLoginDomain">
              <div @click.stop="openSelect">
                <el-select
                    v-if="show === 'login'"
                    ref="mySelect"
                    v-model="suffix"
                    :placeholder="$t('select')"
                    class="select"
                >
                  <el-option
                      v-for="item in domainList"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
                <div style="color: var(--el-text-color-primary)">
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <label class="field-label">{{ $t('password') }}</label>
          <el-input v-model="form.password" :placeholder="$t('password')" :aria-label="$t('password')" :type="passwordVisible.login ? 'text' : 'password'" autocomplete="current-password" @focus="focusPassword('login')" @input="inputPassword('login')" @blur="blurCharacterField" @keyup.enter="submit">
            <template #suffix><button type="button" class="password-toggle" :aria-label="passwordVisible.login ? $t('hidePassword') : $t('showPassword')" @mousedown.prevent @click="togglePassword('login')"><Icon :icon="passwordVisible.login ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" width="18" height="18" /></button></template>
          </el-input>
          <el-button class="btn" type="primary" @click="submit" :loading="loginLoading"
          ><span>{{ $t('loginBtn') }}</span><Icon icon="mdi:arrow-right" width="18" height="18" />
          </el-button>
          <el-button v-for="p in oauthProviders" :key="p.key" class="btn" style="margin-top: 10px" @click="oauthLogin(p.key)">
            <el-avatar v-if="p.iconType === 'image'" :src="p.icon" :size="18" style="margin-right: 10px" />
            <Icon v-else :icon="p.icon" width="18" height="18" style="margin-right: 10px" />
            {{ p.label }}
          </el-button>
          <div class="switch" v-if="settingStore.settings.register === 0">{{ $t('noAccount') }}
            <button type="button" @click="switchMode('register')">{{ $t('regSwitch') }}</button>
          </div>
        </div>
        <div v-else key="register" class="form-fields">
          <label class="field-label">{{ $t('emailAccount') }}</label>
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="registerForm.email" type="text" :placeholder="$t('emailAccount')"
                    :aria-label="$t('emailAccount')" autocomplete="username" @focus="focusEmail" @input="characterActivity++" @blur="blurCharacterField" @keyup.enter="submitRegister">
            <template #append v-if="!hideLoginDomain">
              <div @click.stop="openSelect">
                <el-select
                    v-if="show !== 'login'"
                    ref="mySelect"
                    v-model="suffix"
                    :placeholder="$t('select')"
                    class="select"
                >
                  <el-option
                      v-for="item in domainList"
                      :key="item"
                      :label="item"
                      :value="item"
                  />
                </el-select>
                <div>
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <label class="field-label">{{ $t('password') }}</label>
          <el-input v-model="registerForm.password" :placeholder="$t('password')" :aria-label="$t('password')" :type="passwordVisible.register ? 'text' : 'password'" autocomplete="new-password" @focus="focusPassword('register')" @input="inputPassword('register')" @blur="blurCharacterField" @keyup.enter="submitRegister">
            <template #suffix><button type="button" class="password-toggle" :aria-label="passwordVisible.register ? $t('hidePassword') : $t('showPassword')" @mousedown.prevent @click="togglePassword('register')"><Icon :icon="passwordVisible.register ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" width="18" height="18" /></button></template>
          </el-input>
          <label class="field-label">{{ $t('confirmPwd') }}</label>
          <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" :type="passwordVisible.confirm ? 'text' : 'password'"
                    :aria-label="$t('confirmPwd')" autocomplete="new-password" @focus="focusPassword('confirm')" @input="inputPassword('confirm')" @blur="blurCharacterField" @keyup.enter="submitRegister">
            <template #suffix><button type="button" class="password-toggle" :aria-label="passwordVisible.confirm ? $t('hidePassword') : $t('showPassword')" @mousedown.prevent @click="togglePassword('confirm')"><Icon :icon="passwordVisible.confirm ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" width="18" height="18" /></button></template>
          </el-input>
          <el-input v-if="settingStore.settings.regKey === 0" v-model="registerForm.code" :placeholder="$t('regKey')"
                    type="text" autocomplete="off" @keyup.enter="submitRegister"/>
          <el-input v-if="settingStore.settings.regKey === 2" v-model="registerForm.code"
                    :placeholder="$t('regKeyOptional')" type="text" autocomplete="off" @keyup.enter="submitRegister"/>
          <div v-show="verifyShow" class="register-verification">
            <div ref="turnstileElement" class="register-turnstile"></div>
            <div v-if="verifyState === 'loading'" class="verify-status" role="status">{{ $t('authVerifyLoading') }}</div>
            <div v-if="verifyState === 'error'" class="verify-status verify-error" role="status">
              <span>{{ $t('authVerifyStuck') }}</span>
              <button type="button" @click="retryTurnstile">{{ $t('authVerifyRetry') }}</button>
              <span class="verify-browser-tip">{{ $t('authVerifyBrowserTip') }}</span>
            </div>
          </div>
          <el-button class="btn" style="margin: 0" type="primary" @click="submitRegister" :loading="registerLoading" :disabled="avatarPreparing || (verifyShow && verifyState === 'loading')"
          ><span>{{ $t('regBtn') }}</span><Icon icon="mdi:arrow-right" width="18" height="18" />
          </el-button>
          <el-button v-for="p in oauthProviders" :key="p.key" class="btn" style="margin-top: 10px" @click="oauthLogin(p.key)">
            <el-avatar v-if="p.iconType === 'image'" :src="p.icon" :size="18" style="margin-right: 10px" />
            <Icon v-else :icon="p.icon" width="18" height="18" style="margin-right: 10px" />
            {{ p.label }}
          </el-button>
          <div class="switch" v-if="settingStore.settings.register === 0">{{ $t('hasAccount') }}
            <button type="button" @click="switchMode('login')">{{ $t('loginSwitch') }}</button>
          </div>
        </div>
        </Transition>
      </div>
    </div>
    <el-dialog class="bind-dialog" v-model="showBindForm"  title="注册邮箱" >
      <div class="bind-container">
        <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="bindForm.email" type="text" :placeholder="$t('emailAccount')" autocomplete="off" @keyup.enter="bind">
          <template #append v-if="!hideLoginDomain">
            <div @click.stop="openSelect">
              <el-select
                  ref="mySelect"
                  v-model="suffix"
                  :placeholder="$t('select')"
                  class="select"
              >
                <el-option
                    v-for="item in domainList"
                    :key="item"
                    :label="item"
                    :value="item"
                />
              </el-select>
              <div>
                <span>{{ suffix }}</span>
                <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
              </div>
            </div>
          </template>
        </el-input>
        <el-input v-if="settingStore.settings.regKey === 0" v-model="bindForm.code" :placeholder="$t('regKey')"
                  type="text" autocomplete="off" @keyup.enter="bind"/>
        <el-input v-if="settingStore.settings.regKey === 2" v-model="bindForm.code"
                  :placeholder="$t('regKeyOptional')" type="text" autocomplete="off" @keyup.enter="bind"/>
        <el-button class="btn" type="primary" @click="bind" :loading="bindLoading"
        >绑定
        </el-button>
      </div>
    </el-dialog>
    <a v-show="settingStore.settings.projectLink" class="github" href="https://github.com/maillab/cloud-mail">
      <Icon icon="mingcute:github-line" color="#1890ff" width="20" height="20" />
    </a>
  </div>
</template>

<script setup>
import router from "@/router";
import {useRoute} from "vue-router";
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef} from "vue";
import {login} from "@/request/login.js";
import {register} from "@/request/login.js";
import {websiteConfig} from "@/request/setting.js";
import {isEmail} from "@/utils/verify-utils.js";
import {useSettingStore} from "@/store/setting.js";
import {useAccountStore} from "@/store/account.js";
import {useUserStore} from "@/store/user.js";
import {useUiStore} from "@/store/ui.js";
import {Icon} from "@iconify/vue";
import {cvtR2Url} from "@/utils/convert.js";
import {loginUserInfo, uploadAvatar} from "@/request/my.js";
import {prepareAvatar, avatarDataUrl} from "@/utils/avatar.js";
import {permsToRouter} from "@/perm/perm.js";
import {useI18n} from "vue-i18n";
import {oauthBindUser, oauthLinuxDoLogin, oauthGithubLogin, oauthGoogleLogin} from "@/request/ouath.js";
import AnimatedCharacters from './AnimatedCharacters.vue'
import CreatorLinks from '@/components/creator-links/index.vue'

const {t} = useI18n();
const accountStore = useAccountStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const settingStore = useSettingStore();
const route = useRoute();
const loginLoading = ref(false)
const bindLoading = ref(false)
const oauthLoading = ref(false);
const showBindForm = ref(false);
const show = ref('login')
const characterMood = ref('idle')
const characterActivity = ref(0)
const passwordVisible = reactive({login: false, register: false, confirm: false})
const avatarInput = ref(null)
const avatarFile = shallowRef(null)
const avatarPreview = ref('')
const avatarPreparing = ref(false)

onMounted(() => { document.title = 'Xiaolinyx Mail' })
onBeforeUnmount(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  clearTurnstile()
})

function clearAvatar() {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = ''
  avatarFile.value = null
  if (avatarInput.value) avatarInput.value.value = ''
}

async function handleAvatarFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  avatarPreparing.value = true
  try {
    const prepared = await prepareAvatar(file)
    clearAvatar()
    avatarFile.value = prepared
    avatarPreview.value = URL.createObjectURL(prepared)
  } catch {
    ElMessage.error(t('profilePhotoInvalid'))
  } finally {
    avatarPreparing.value = false
  }
}

function passwordValue(field) {
  return field === 'login' ? form.password : field === 'register' ? registerForm.password : registerForm.confirmPassword
}

function hasExposedPassword() {
  return show.value === 'login'
    ? passwordVisible.login && !!form.password
    : (passwordVisible.register && !!registerForm.password) || (passwordVisible.confirm && !!registerForm.confirmPassword)
}

function passwordMood(field) {
  if (hasExposedPassword()) return 'revealed'
  return passwordValue(field) ? 'password' : 'idle'
}

function focusEmail() {
  characterMood.value = hasExposedPassword() ? 'revealed' : 'email'
}

function blurCharacterField() {
  characterMood.value = hasExposedPassword() ? 'revealed' : 'idle'
}

function focusPassword(field) {
  characterMood.value = passwordMood(field)
}

function inputPassword(field) {
  characterActivity.value++
  characterMood.value = passwordMood(field)
}

function togglePassword(field) {
  passwordVisible[field] = !passwordVisible[field]
  characterMood.value = passwordMood(field)
}

function switchMode(mode) {
  if (mode === 'login') clearTurnstile()
  show.value = mode
  passwordVisible.login = false
  passwordVisible.register = false
  passwordVisible.confirm = false
  characterMood.value = 'idle'
}

const oauthKeys = ['linuxdo', 'github', 'google']

const oauthProvider = computed(() => {
  const fromState = route.query.state
  if (oauthKeys.includes(fromState)) return fromState
  const fromStore = sessionStorage.getItem('oauthProvider')
  return oauthKeys.includes(fromStore) ? fromStore : null
})

const oauthProviders = computed(() => {
  const allProviders = [
    { key: 'google', label: 'Google', icon: 'devicon:google', iconType: 'iconify' },
    { key: 'github', label: 'GitHub', icon: 'codicon:github-inverted', iconType: 'iconify' },
    { key: 'linuxdo', label: 'LinuxDo', icon: '/image/linuxdo.webp', iconType: 'image' },
  ]
  return allProviders.filter(p => settingStore.settings[p.key + 'Switch'] === 0)
})

const bindForm = reactive({
  email: '',
  oauthUserId: '',
  code: ''
})

const form = reactive({
  email: '',
  password: '',

});
const mySelect = ref()
const suffix = ref('')
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  code: null
})
const domainList = settingStore.domainList;
const registerLoading = ref(false)
suffix.value = domainList[0]
const verifyShow = ref(false)
const verifyState = ref('idle')
const turnstileElement = ref(null)
let verifyToken = ''
let turnstileId = null
let turnstileWatchdog = null
let turnstileStarting = null
const needsTurnstile = computed(() => settingStore.settings.registerVerify === 0 ||
  (settingStore.settings.registerVerify === 2 && settingStore.settings.regVerifyOpen))

function stopTurnstileWatchdog() {
  if (turnstileWatchdog) clearTimeout(turnstileWatchdog)
  turnstileWatchdog = null
}

function startTurnstileWatchdog() {
  stopTurnstileWatchdog()
  turnstileWatchdog = window.setTimeout(() => {
    if (show.value === 'register' && !verifyToken) verifyState.value = 'error'
  }, 25000)
}

function clearTurnstile() {
  stopTurnstileWatchdog()
  if (turnstileId !== null && window.turnstile?.remove) {
    window.turnstile.remove(turnstileId)
  }
  turnstileId = null
  verifyToken = ''
  verifyShow.value = false
  verifyState.value = 'idle'
}

async function waitForTurnstile() {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (window.turnstile?.render) return window.turnstile
    if (show.value !== 'register') throw new Error('Verification closed')
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error('Verification script unavailable')
}

async function startTurnstile(reset = false) {
  if (!needsTurnstile.value || show.value !== 'register') return
  if (turnstileStarting) return turnstileStarting
  turnstileStarting = (async () => {
    verifyShow.value = true
    verifyState.value = 'loading'
    verifyToken = ''
    await nextTick()
    const api = await waitForTurnstile()
    if (show.value !== 'register' || !turnstileElement.value) return
    if (turnstileId !== null) {
      if (reset) api.reset(turnstileId)
    } else {
      turnstileId = api.render(turnstileElement.value, {
        sitekey: settingStore.settings.siteKey,
        size: 'flexible',
        retry: 'auto',
        'retry-interval': 5000,
        'refresh-expired': 'auto',
        'refresh-timeout': 'auto',
        callback(token) {
          verifyToken = token
          verifyState.value = 'ready'
          stopTurnstileWatchdog()
        },
        'error-callback'() {
          verifyToken = ''
          verifyState.value = 'error'
          stopTurnstileWatchdog()
        },
        'expired-callback'() {
          verifyToken = ''
          verifyState.value = 'loading'
          startTurnstileWatchdog()
        },
        'timeout-callback'() {
          verifyToken = ''
          verifyState.value = 'error'
          stopTurnstileWatchdog()
        }
      })
    }
    if (verifyState.value !== 'ready') startTurnstileWatchdog()
  })().catch(() => {
    if (show.value === 'register') verifyState.value = 'error'
  }).finally(() => { turnstileStarting = null })
  return turnstileStarting
}

function onFormEntered() {
  if (show.value === 'register') startTurnstile()
}

function retryTurnstile() {
  if (!window.turnstile?.render) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    document.head.appendChild(script)
  }
  startTurnstile(true)
}

const loginOpacity = computed(() => {
  const opacity = settingStore.settings.loginOpacity
  return uiStore.dark ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
})

const hideLoginDomain = computed(() => settingStore.settings.loginDomain === 1)

const background = computed(() => {

  return settingStore.settings.background ? {
    'background-image': `url(${cvtR2Url(settingStore.settings.background)})`,
    'background-repeat': 'no-repeat',
    'background-size': 'cover',
    'background-position': 'center'
  } : ''
})

const openSelect = () => {
  mySelect.value.toggleMenu()
}

const getFullEmail = (email) => {
  return hideLoginDomain.value ? email : email + suffix.value
}

const getEmailName = (email) => {
  return email.split('@')[0]
}

function oauthLogin(provider) {
  const clientId = settingStore.settings[provider + 'ClientId']
  const redirectUri = encodeURIComponent(window.location.origin + '/login')
  sessionStorage.setItem('oauthProvider', provider)
  const authorizeUrls = {
    linuxdo: `https://connect.linux.do/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email&state=${provider}`,
    github: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=${provider}`,
    google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email&state=${provider}`,
  }
  window.location.href = authorizeUrls[provider]
}

const loginFns = {
  linuxdo: oauthLinuxDoLogin,
  github: oauthGithubLogin,
  google: oauthGoogleLogin,
}

oauthGetUser();

async function oauthGetUser() {

  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code || !oauthProvider.value) return

  const provider = oauthProvider.value
  oauthLoading.value = true
  sessionStorage.removeItem('oauthProvider')
  window.history.replaceState({}, '', window.location.origin + window.location.pathname)

  loginFns[provider](code, window.location.origin + '/login').then(data => {

    bindForm.oauthUserId = data.userInfo.oauthUserId;

    if (!data.token) {
      showBindForm.value = true
      oauthLoading.value = false
      ElMessage({
        message: '请注册绑定一个邮箱',
        type: 'warning',
        duration: 4000,
        plain: true,
      })
      return;
    }

    saveToken(data.token);
  }).catch(() => {
    oauthLoading.value = false
  })
}

function bind() {

  if (bindLoading.value) return

  if (!bindForm.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }


  if (getEmailName(bindForm.email).length < settingStore.settings.minEmailPrefix) {
    ElMessage({
      message: t('minEmailPrefix', {msg: settingStore.settings.minEmailPrefix}),
      type: 'error',
      plain: true,
    })
    return
  }

  let email = getFullEmail(bindForm.email);


  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (settingStore.settings.regKey === 0) {

    if (!bindForm.code) {

      ElMessage({
        message: t('emptyRegKeyMsg'),
        type: 'error',
        plain: true,
      })
      return
    }

  }

  const form = {email, oauthUserId: bindForm.oauthUserId, code: bindForm.code}

  bindLoading.value = true
  oauthBindUser(form).then(data => {
    saveToken(data.token)
  }).catch(() => {
    bindLoading.value = false
  })
}

const submit = () => {

  if (loginLoading.value || avatarPreparing.value) return

  if (!form.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  let email = getFullEmail(form.email);

  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!form.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  loginLoading.value = true
  characterMood.value = 'submit'
  login(email, form.password).then(async data => {
    await saveToken(data.token, avatarFile.value)
  }).catch(() => {
    characterMood.value = 'error'
    window.setTimeout(() => {
      if (characterMood.value === 'error') blurCharacterField()
    }, 1250)
  }).finally(() => {
    loginLoading.value = false
    if (characterMood.value === 'submit') blurCharacterField()
  })
}

async function saveToken(token, selectedAvatar = null) {
  localStorage.setItem('token', token)
  refreshWebsiteConfig()
  const user = await loginUserInfo();
  if (selectedAvatar) {
    let uploaded = null
    for (let attempt = 0; attempt < 2 && !uploaded; attempt++) {
      try {
        uploaded = await uploadAvatar(selectedAvatar)
      } catch (error) {
        if (error?.code === 401) throw error
        if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 600))
      }
    }
    if (uploaded) {
      user.uploadedAvatar = await avatarDataUrl(selectedAvatar).catch(() => uploaded.avatarUrl)
    } else {
      ElMessage({ message: t('authAvatarUploadFailed'), type: 'warning', duration: 8000 })
    }
  }
  accountStore.currentAccountId = user.account.accountId;
  accountStore.currentAccount = user.account;
  userStore.user = user;
  const routers = permsToRouter(user.permKeys);
  routers.forEach(routerData => {
    router.addRoute('layout', routerData);
  });
  await router.replace({name: 'layout'})
  uiStore.showNotice()
  oauthLoading.value = false;
  bindLoading.value = false;
}

function refreshWebsiteConfig() {
  websiteConfig().then(setting => {
    settingStore.settings = setting
    settingStore.domainList = setting.domainList
    if (!suffix.value && setting.domainList.length > 0) {
      suffix.value = setting.domainList[0]
    }
    document.title = 'Xiaolinyx Mail'
  }).catch(e => {
    console.error(e)
  })
}


async function submitRegister() {

  if (registerLoading.value || avatarPreparing.value) return

  if (!registerForm.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (getEmailName(registerForm.email).length < settingStore.settings.minEmailPrefix) {
    ElMessage({
      message: t('minEmailPrefix', {msg: settingStore.settings.minEmailPrefix}),
      type: 'error',
      plain: true,
    })
    return
  }

  const email = getFullEmail(registerForm.email);

  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!registerForm.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage({
      message: t('pwdLengthMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {

    ElMessage({
      message: t('confirmPwdFailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (settingStore.settings.regKey === 0) {

    if (!registerForm.code) {

      ElMessage({
        message: t('emptyRegKeyMsg'),
        type: 'error',
        plain: true,
      })
      return
    }

  }

  if (needsTurnstile.value && !verifyToken) {
    await startTurnstile(verifyState.value === 'error')
    turnstileElement.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    return
  }

  registerLoading.value = true
  characterMood.value = 'submit'

  const registration = {
    email,
    password: registerForm.password,
    token: verifyToken,
    code: registerForm.code
  }

  let created = false
  try {
    const {regVerifyOpen} = await register(registration)
    created = true
    settingStore.settings.regVerifyOpen = regVerifyOpen
    verifyToken = ''
    verifyShow.value = false
    stopTurnstileWatchdog()
    const {token} = await login(email, registration.password)
    await saveToken(token, avatarFile.value)
    ElMessage({ message: t('regSuccessMsg'), type: 'success', plain: true })
  } catch (res) {
    characterMood.value = 'idle'
    if (created) {
      localStorage.removeItem('token')
      form.email = registerForm.email
      switchMode('login')
      ElMessage.warning(t('authAvatarLoginFallback'))
    } else if (res.code === 400) {
      verifyToken = ''
      settingStore.settings.regVerifyOpen = true
      await startTurnstile(true)

    }
  } finally {
    registerLoading.value = false
  }
}

</script>


<style>
.el-select-dropdown__item {
  padding: 0 15px;
}

.no-autofill-pwd {
  .el-input__inner {
    -webkit-text-security: disc !important;
  }
}
</style>

<style lang="scss" scoped>

.form-wrapper {
  position: fixed;
  right: 0;
  height: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(460px, 100%);
  @media (max-width: 767px) {
    width: 100%;
  }
}

.container {
  background: v-bind(loginOpacity);
  padding-left: 48px;
  padding-right: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-left: 1px solid var(--login-border);
  box-shadow: -24px 0 80px rgba(19, 43, 82, .08);
  @media (max-width: 1024px) {
    padding: 20px 18px;
    width: 384px;
    margin-left: 18px;
  }
  @media (max-width: 767px) {
    border: 1px solid var(--login-border);
    padding: 20px 18px;
    border-radius: 6px;
    height: fit-content;
    width: 100%;
    margin-right: 18px;
    margin-left: 18px;
  }

  .btn {
    height: 44px;
    width: 100%;
    border-radius: 10px;
    font-weight: 650;
  }

  .form-desc {
    margin-top: 5px;
    margin-bottom: 18px;
    color: var(--form-desc-color);
  }

  .form-title {
    font-weight: 750;
    font-size: 30px !important;
    letter-spacing: -.035em;
  }

  .switch {
    margin-top: 20px;
    text-align: center;

    span {
      color: var(--login-switch-color);
      cursor: pointer;
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
    background: var(--el-bg-color);
  }

  .email-input :deep(.el-input__wrapper) {
    border-radius: 6px 0 0 6px;
    background: var(--el-bg-color);
  }

  .el-input {
    height: 44px;
    width: 100%;
    margin-bottom: 18px;

    :deep(.el-input__inner) {
      height: 42px;
    }
  }
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

:deep(.bind-dialog) {
  width: 400px !important;
  @media (max-width: 440px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.bind-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.setting-icon {
  position: relative;
  top: 6px;
}

.github {
  position: fixed;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: var(--el-bg-color);
  bottom: 10px;
  right: 10px;
  z-index: 1000;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  cursor: pointer;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: var(--el-bg-color);
  border-radius: 0 8px 8px 0;
}

:deep(.el-button+.el-button) {
  margin: 0;
}

.register-turnstile {
  min-height: 65px;
  max-width: 100%;
}
.register-verification { margin: 0 0 18px; }
.verify-status {
  margin-top: 7px;
  color: #667a96;
  font-size: 12px;
  line-height: 1.5;
}
.verify-error { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 9px; color: #a84754; }
.verify-error button { padding: 0; border: 0; background: none; color: #245bd2; font-weight: 700; cursor: pointer; }
.verify-error button:hover { text-decoration: underline; }
.verify-browser-tip { flex-basis: 100%; color: #667a96; }
:global(.dark) .verify-status, :global(.dark) .verify-browser-tip { color: #a4b5ce; }
:global(.dark) .verify-error { color: #ff9da8; }
.verify-error button:focus-visible { outline: 2px solid #3c70d7; outline-offset: 2px; border-radius: 3px; }
.register-verification :deep(iframe) {
  max-width: 100%;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.password-toggle {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--el-text-color-secondary);
  display: inline-grid;
  place-items: center;
  cursor: pointer;
}
.password-toggle:hover { color: var(--el-color-primary); background: rgba(88, 122, 185, .09); }
.password-toggle:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }

.custom-style {
  margin-bottom: 10px;
}

.custom-style .el-segmented {
  --el-border-radius-base: 6px;
  width: 180px;
}


#login-box {
  background: #eaf1fb;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr;
}


#background-wrap {
  height: 100%;
  z-index: 0;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 24%, rgba(68, 123, 214, .26), transparent 30%),
    radial-gradient(circle at 72% 80%, rgba(141, 182, 240, .2), transparent 36%),
    linear-gradient(135deg, #f6f9fe 0%, #dbe7f7 100%);
}

#background-wrap::before {
  content: "";
  position: absolute;
  inset: -35% 10% -35% -25%;
  border: 1px solid rgba(45, 91, 164, .1);
  border-radius: 50%;
  box-shadow: 0 0 0 115px rgba(255, 255, 255, .12),
              0 0 0 116px rgba(45, 91, 164, .08),
              0 0 0 235px rgba(255, 255, 255, .1),
              0 0 0 236px rgba(45, 91, 164, .06);
  animation: login-drift 18s ease-in-out infinite alternate;
}

#background-wrap::after {
  content: "";
  position: absolute;
  width: min(30vw, 420px);
  aspect-ratio: 1;
  top: 22%;
  left: 18%;
  border-radius: 26%;
  background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(255,255,255,.08));
  border: 1px solid rgba(255,255,255,.8);
  box-shadow: 24px 30px 70px rgba(28, 69, 133, .12), inset 0 1px 0 #fff;
  transform: rotate(-16deg);
  animation: login-float 9s ease-in-out infinite;
}

@keyframes login-drift {
  to { transform: translate3d(3%, -2%, 0) scale(1.03); }
}

@keyframes login-float {
  50% { transform: translateY(-16px) rotate(-13deg); }
}

:global(.dark) #background-wrap {
  background: transparent;
}

:global(.dark) #background-wrap::before {
  border-color: rgba(187, 207, 244, .1);
}

:global(.dark) #background-wrap::after {
  background: linear-gradient(145deg, rgba(129,169,255,.13), rgba(255,255,255,.02));
  border-color: rgba(175,198,238,.2);
}

@media (max-width: 767px) {
  #background-wrap::after { width: 62vw; left: -25%; top: 5%; }
  .container { box-shadow: 0 24px 70px rgba(19,43,82,.16); }
}

@media (prefers-reduced-motion: reduce) {
  #background-wrap::before,
  #background-wrap::after { animation: none; }
}

/* Auth experience: an intentional split layout with motion tied to incoming mail. */
#login-box {
  min-height: 100dvh;
  height: auto;
  grid-template-columns: minmax(0, 1fr) minmax(430px, 1fr);
  overflow: auto;
  background: #f8fafc;
}

.brand-stage {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(ellipse 66% 48% at 50% 70%, rgba(195, 211, 231, .50) 0%, rgba(154, 177, 207, .22) 55%, transparent 100%),
    radial-gradient(ellipse at 4% 4%, rgba(181, 202, 226, .24), transparent 48%),
    linear-gradient(150deg, #526986 0%, #485e7b 42%, #293f5c 100%);
  color: #f6f9ff;
  isolation: isolate;
}

.brand-stage::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, .055), transparent 34%, rgba(13, 28, 52, .13) 100%);
}

#background-wrap,
.custom-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

#background-wrap {
  background: transparent;
}

#background-wrap::before { display: none; }

#background-wrap::after {
  display: none;
}

.custom-background {
  background-size: cover;
  background-position: center;
}

.brand-content {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  padding: clamp(30px, 4vw, 55px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 13px;
  width: fit-content;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -.02em;
  animation: reveal-up .7s both;
}

.brand-mark-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, .16);
  color: #fff;
  box-shadow: none;
}

.brand-copy {
  position: absolute;
  z-index: 2;
  max-width: min(82%, 650px);
  top: clamp(110px, 15vh, 180px);
  left: clamp(30px, 4vw, 64px);
  animation: reveal-up .8s .12s both;
}

.brand-kicker {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #dce9fb;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: .03em;
  margin-bottom: 20px;
}

.brand-kicker::after {
  content: '';
  width: 48px;
  height: 1px;
  background: rgba(234, 243, 255, .62);
}

.brand-copy h1 {
  font-size: clamp(40px, 3.8vw, 60px);
  line-height: 1.17;
  font-weight: 720;
  letter-spacing: -.045em;
  max-width: 11em;
  text-shadow: 0 2px 22px rgba(15, 33, 59, .10);
}

.brand-copy h1 span {
  color: #d9e7ff;
}

.brand-description {
  max-width: 27em;
  margin-top: 24px;
  color: #e2ebf7;
  font-size: clamp(15px, 1.2vw, 17px);
  line-height: 1.75;
}

.brand-foot {
  position: absolute;
  z-index: 3;
  right: 34px;
  bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a9bddb;
  font-size: 12px;
  letter-spacing: .03em;
  animation: reveal-up .8s .35s both;
}

.brand-foot span {
  width: 22px;
  height: 1px;
  background: #6889b8;
}

.mail-scene {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 67%;
  width: min(68%, 570px);
  aspect-ratio: 11 / 8;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: none;
}

.form-wrapper {
  position: relative;
  grid-column: 2;
  width: 100%;
  height: auto;
  min-height: 100dvh;
  padding: 34px;
  background: #f8fafc;
  align-items: flex-start;
}

.container {
  width: min(100%, 430px);
  height: auto;
  margin: clamp(76px, 16vh, 190px) auto 42px;
  padding: 34px 0;
  justify-content: flex-start;
  border: 0;
  background: transparent;
  box-shadow: none;
  animation: reveal-up .7s .16s both;
}

.form-topline {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  color: #4269a9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .05em;
}

.form-topline-mark { flex: 1; height: 1px; background: #dbe4f1; }

.container .form-title {
  font-size: clamp(32px, 3vw, 40px) !important;
  letter-spacing: -.055em;
  color: #14243b;
}

.container .form-desc {
  margin: 8px 0 30px;
  color: #6d7b91;
  font-size: 14px;
  line-height: 1.6;
}

.auth-avatar-picker {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 68px;
  margin: -9px 0 25px;
  padding: 9px 11px;
  border: 1px solid #e2eaf4;
  border-radius: 12px;
  background: rgba(255, 255, 255, .72);
}
.auth-avatar-preview {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: #edf3fd;
  color: #577ab9;
}
.auth-avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.auth-avatar-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 3px; }
.auth-avatar-copy strong { color: #213958; font-size: 13px; font-weight: 700; }
.auth-avatar-copy span { color: #7a899d; font-size: 11px; line-height: 1.35; }
.auth-avatar-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.auth-avatar-action, .auth-avatar-remove {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: #245bd2;
  cursor: pointer;
}
.auth-avatar-action { padding: 8px 2px; font-size: 12px; font-weight: 700; }
.auth-avatar-action:hover { text-decoration: underline; }
.auth-avatar-action:disabled { opacity: .55; cursor: wait; }
.auth-avatar-remove { display: grid; padding: 6px; place-items: center; color: #7a899d; }
.auth-avatar-remove:hover { color: #d34b61; }
.auth-avatar-action:focus-visible, .auth-avatar-remove:focus-visible { outline: 2px solid #3c70d7; outline-offset: 2px; border-radius: 4px; }

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #243b5e;
  font-size: 13px;
  font-weight: 650;
}

.container .el-input { height: 48px; margin-bottom: 20px; }
.form-fields { width: 100%; }
.container :deep(.el-input__wrapper) {
  min-height: 48px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 1px #dce5f0;
}

.container :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px #a9bddc; }
.container :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px #3c70d7, 0 6px 20px rgba(49, 102, 205, .11); }
.container .email-input {
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 1px #dce5f0;
  transition: box-shadow .2s ease;
}
.container .email-input:hover { box-shadow: 0 0 0 1px #a9bddc; }
.container .email-input:focus-within { box-shadow: 0 0 0 2px #3c70d7, 0 6px 20px rgba(49, 102, 205, .11); }
.container .email-input :deep(.el-input__wrapper),
.container .email-input :deep(.el-input__wrapper:hover),
.container .email-input :deep(.el-input__wrapper.is-focus) {
  min-width: 0;
  border-radius: 10px 0 0 10px;
  background: transparent;
  box-shadow: none;
}
.container .email-input :deep(.el-input-group__append) {
  border-left: 1px solid #e4eaf3;
  border-radius: 0 10px 10px 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}
.container .email-input :deep(.el-input-group__append > div) {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.container .btn {
  position: relative;
  height: 50px;
  margin-top: 7px;
  border-radius: 10px;
  background: #245bd2;
  border-color: #245bd2;
  box-shadow: 0 10px 22px rgba(36, 91, 210, .2);
  transition: transform .22s ease, box-shadow .22s ease, background-color .22s ease;
}

.container .btn :deep(span) { display: flex; align-items: center; justify-content: center; gap: 10px; }
.container .btn :deep(svg) { transition: transform .22s ease; }
.container .btn:hover { background: #164bbd; box-shadow: 0 15px 28px rgba(36, 91, 210, .28); transform: translateY(-2px); }
.container .btn:hover :deep(svg) { transform: translateX(4px); }

.container .switch { margin-top: 25px; color: #6d7b91; font-size: 13px; }
.container .switch button { padding: 3px 4px; color: #245bd2; font-weight: 700; cursor: pointer; }
.container .switch button:hover { text-decoration: underline; }

.form-swap-enter-active { animation: form-enter .26s cubic-bezier(.2,.75,.25,1) both; }
.form-swap-leave-active { animation: form-leave .13s ease-in both; }
@keyframes form-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes form-leave { to { opacity: 0; transform: translateY(-5px); } }

@keyframes reveal-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scene-breathe { to { transform: scale(1.04); } }

@media (max-width: 1100px) {
  .mail-scene { width: min(70%, 530px); }
  .container { width: min(100%, 430px); margin: auto; padding: 34px 0; }
}

@media (max-height: 760px) and (min-width: 901px) {
  .brand-copy { top: 94px; }
  .brand-copy h1 { font-size: clamp(31px, 3vw, 42px); }
  .brand-description { margin-top: 10px; }
  .mail-scene { width: min(57%, 420px); top: 67%; }
}

@media (max-width: 900px) {
  #login-box { display: block; background: #eef3fb; }
  .brand-stage { min-height: 270px; height: 270px; }
  .brand-content { min-height: 270px; padding: 25px 26px 54px; }
  .brand-copy, .brand-foot { display: none; }
  .mail-scene { width: min(52%, 240px); left: 50%; top: 55%; }
  .form-wrapper { min-height: calc(100dvh - 270px); padding: 0 18px 24px; background: #eef3fb; align-items: flex-start; }
  .container {
    width: min(100%, 520px);
    padding: 32px clamp(22px, 5vw, 34px);
    margin: -38px auto 0;
    border: 1px solid #e2e9f3;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 22px 55px rgba(19, 43, 82, .13);
  }
}

@media (max-width: 420px) {
  .brand-stage, .brand-content { height: 240px; min-height: 240px; }
  .brand-content { padding: 20px 20px 42px; }
  .brand-mark { font-size: 14px; }
  .brand-mark-icon { width: 34px; height: 34px; }
  .mail-scene { width: min(55%, 225px); top: 58%; }
  .form-wrapper { min-height: calc(100dvh - 240px); padding: 0 12px 18px; }
  .container { padding: 26px 20px; }
}

:global(.dark) .form-wrapper { background: #111a2a; }
:global(.dark) .container .form-title { color: #edf3ff; }
:global(.dark) .container .field-label { color: #d6e3fa; }
:global(.dark) .container .form-desc,
:global(.dark) .container .switch { color: #a4b5ce; }
:global(.dark) .container :deep(.el-input__wrapper),
:global(.dark) .container :deep(.el-input-group__append) { background: #19263a; }
:global(.dark) .container .email-input { background: #19263a; }
:global(.dark) .container .email-input :deep(.el-input-group__append) { border-left-color: #34435a; }
:global(.dark) .auth-avatar-picker { border-color: #34435a; background: #19263a; }
:global(.dark) .auth-avatar-preview { background: #273c5c; color: #b7d0ff; }
:global(.dark) .auth-avatar-copy strong { color: #edf3ff; }
:global(.dark) .auth-avatar-copy span { color: #a4b5ce; }
@media (max-width: 900px) {
  :global(.dark) #login-box,
  :global(.dark) .form-wrapper { background: #0c1422; }
  :global(.dark) .container { background: #172338; border-color: #2e3e58; }
}

@media (prefers-reduced-motion: reduce) {
  .brand-mark, .brand-copy, .brand-foot, .mail-scene,
  .container,
  .form-swap-enter-active, .form-swap-leave-active,
  #background-wrap::before { animation: none !important; }
}

</style>
