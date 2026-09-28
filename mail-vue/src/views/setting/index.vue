<template>
  <div class="box">
    <div class="container">
      <div class="title">{{$t('profile')}}</div>
      <div class="avatar-setting">
        <UserAvatar :src="userStore.user.uploadedAvatar" :name="userStore.user.name" :email="userStore.user.email" :size="72" />
        <div class="avatar-copy">
          <strong>{{ $t('profilePhoto') }}</strong>
          <span>{{ $t('profilePhotoHint') }}</span>
          <div class="avatar-actions">
            <el-button type="primary" :loading="avatarLoading" @click="avatarInput?.click()">{{ $t('uploadPhoto') }}</el-button>
            <el-button v-if="userStore.user.uploadedAvatar" :disabled="avatarLoading" @click="removeAvatar">{{ $t('removePhoto') }}</el-button>
          </div>
        </div>
        <input ref="avatarInput" class="file-input" type="file" accept="image/*,.heic,.heif" @change="handleAvatarFile" />
      </div>
      <div class="item">
        <div>{{$t('username')}}</div>
        <div>
          <span v-if="setNameShow" class="edit-name-input">
            <el-input v-model="accountName"  ></el-input>
            <span class="edit-name" @click="setName">
             {{$t('save')}}
            </span>
          </span>
          <span v-else class="user-name">
            <span >{{ userStore.user.name }}</span>
            <span class="edit-name" @click="showSetName">
             {{$t('change')}}
            </span>
          </span>
        </div>
      </div>
      <div class="item">
        <div>{{$t('emailAccount')}}</div>
        <div>{{ userStore.user.email }}</div>
      </div>
      <div class="item">
        <div>{{$t('password')}}</div>
        <div>
          <el-button type="primary" @click="pwdShow = true">{{$t('changePwdBtn')}}</el-button>
        </div>
      </div>
    </div>
    <div class="language">
      <div class="title">{{$t('language')}}</div>
      <el-select
          :model-value="langSelect"
          class="language-select"
          placeholder="Select"
          @change="changeLang"
      >
        <el-option label="中文" value="zh" @pointerdown.prevent.stop="changeLang('zh')"/>
        <el-option label="English" value="en" @pointerdown.prevent.stop="changeLang('en')"/>
      </el-select>
    </div>
    <div class="del-email" v-perm="'my:delete'">
      <div class="title">{{$t('deleteUser')}}</div>
      <div style="color: var(--regular-text-color);">
        {{$t('delAccountMsg')}}
      </div>
      <div>
        <el-button type="primary" @click="deleteConfirm">{{$t('deleteUserBtn')}}</el-button>
      </div>
    </div>
    <el-dialog v-model="pwdShow" :title="$t('changePassword')" width="340">
      <div class="update-pwd">
        <el-input type="password" :placeholder="$t('newPassword')" v-model="form.password" autocomplete="off" @keyup.enter="submitPwd"/>
        <el-input type="password" :placeholder="$t('confirmPassword')" v-model="form.newPwd" autocomplete="off" @keyup.enter="submitPwd"/>
        <el-button type="primary" :loading="setPwdLoading" @click="submitPwd">{{$t('save')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import {reactive, ref, defineOptions} from 'vue'
import {resetPassword, userDelete, uploadAvatar, deleteAvatar} from "@/request/my.js";
import UserAvatar from '@/components/user-avatar/index.vue'
import { prepareAvatar, avatarDataUrl } from '@/utils/avatar.js'
import {useUserStore} from "@/store/user.js";
import router from "@/router/index.js";
import {accountSetName} from "@/request/account.js";
import {useAccountStore} from "@/store/account.js";
import {useI18n} from "vue-i18n";
import {useSettingStore} from "@/store/setting.js";

const { t } = useI18n()
const accountStore = useAccountStore()
const settingStore = useSettingStore()
const userStore = useUserStore();
const setPwdLoading = ref(false)
const setNameShow = ref(false)
const accountName = ref(null)
const langSelect = ref(settingStore.lang)
const avatarInput = ref(null)
const avatarLoading = ref(false)

async function handleAvatarFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  avatarLoading.value = true
  let prepared
  try {
    prepared = await prepareAvatar(file)
  } catch {
    ElMessage.error(t('profilePhotoInvalid'))
    avatarLoading.value = false
    return
  }
  try {
    const { avatarUrl } = await uploadAvatar(prepared)
    userStore.user.uploadedAvatar = await avatarDataUrl(prepared).catch(() => avatarUrl)
    ElMessage.success(t('profilePhotoSaved'))
  } catch {
    ElMessage.error(t('reqFailErrorMsg'))
  } finally {
    avatarLoading.value = false
  }
}

async function removeAvatar() {
  avatarLoading.value = true
  try {
    await deleteAvatar()
    userStore.user.uploadedAvatar = null
    ElMessage.success(t('profilePhotoRemoved'))
  } catch (error) {
    ElMessage.error(t('reqFailErrorMsg'))
  } finally {
    avatarLoading.value = false
  }
}

defineOptions({
  name: 'setting'
})

function showSetName() {
  accountName.value = userStore.user.name
  setNameShow.value = true
}

function setName() {

  if (!accountName.value) {
    ElMessage({
      message: t('emptyUserNameMsg'),
      type: 'error',
      plain: true,
    })
    return;
  }

  setNameShow.value = false
  let name = accountName.value

  if (name === userStore.user.name) {
    return
  }

  userStore.user.name = accountName.value

  accountSetName(userStore.user.account.accountId,name).then(() => {
    ElMessage({
      message: t('saveSuccessMsg'),
      type: 'success',
      plain: true,
    })

    accountStore.changeUserAccountName = name

  }).catch(() => {
    userStore.user.name = name
  })
}

function changeLang(lang) {
  let setting = {}
  try {
    setting = JSON.parse(localStorage.getItem('setting') || '{}')
  } catch (e) {
    setting = {}
  }
  localStorage.setItem('setting', JSON.stringify({...setting, lang}))
  window.location.reload()
}

const pwdShow = ref(false)
const form = reactive({
  password: '',
  newPwd: '',
})

const deleteConfirm = () => {
  ElMessageBox.confirm(t('delAccountConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    userDelete().then(() => {
      localStorage.removeItem('token');
      router.replace('/login');
      ElMessage({
        message: t('delSuccessMsg'),
        type: 'success',
        plain: true,
      })
    })
  })
}


function submitPwd() {

  if (setPwdLoading.value) return

  if (!form.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (form.password.length < 6) {
    ElMessage({
      message: t('pwdLengthMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (form.password !== form.newPwd) {
    ElMessage({
      message: t('confirmPwdFailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  setPwdLoading.value = true
  resetPassword(form.password).then(() => {
    ElMessage({
      message: t('saveSuccessMsg'),
      type: 'success',
      plain: true,
    })
    pwdShow.value = false
    setPwdLoading.value = false
    form.password = ''
    form.newPwd = ''
  }).catch(() => {
    setPwdLoading.value = false
  })

}

</script>
<style scoped lang="scss">
.box { height: 100%; overflow: auto; padding: clamp(22px, 3vw, 42px); color: var(--el-text-color-primary); }
.container, .language, .del-email { max-width: 780px; }
.container { display: grid; gap: 0; }
.title { color: var(--el-text-color-primary); font-size: 18px; font-weight: 750; letter-spacing: -.025em; margin-bottom: 20px; }
.avatar-setting { display: flex; align-items: center; gap: 22px; padding: 8px 0 28px; border-bottom: 1px solid var(--el-border-color-light); margin-bottom: 10px; }
.avatar-copy { display: grid; gap: 5px; color: var(--el-text-color-primary); }
.avatar-copy strong { font-size: 15px; }
.avatar-copy span { color: var(--regular-text-color); font-size: 13px; }
.avatar-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 9px; }
.avatar-actions :deep(.el-button) { margin: 0; border-radius: 9px; }
.file-input { display: none; }
.item { display: grid; grid-template-columns: 150px minmax(0, 1fr); align-items: center; min-height: 62px; gap: 18px; border-bottom: 1px solid var(--el-border-color-lighter); font-size: 14px; }
.item > div:first-child { font-weight: 650; color: var(--regular-text-color); }
.item > div:last-child { min-width: 0; overflow-wrap: anywhere; }
.user-name, .edit-name-input { display: inline-flex; align-items: center; gap: 8px; }
.edit-name { color: #3265c5; cursor: pointer; font-weight: 650; }
.edit-name-input :deep(.el-input) { width: min(230px, 48vw); }
.language { margin-top: 34px; }
.language-select { width: 155px; }
.del-email { margin-top: 38px; border-top: 1px solid var(--el-border-color-light); padding-top: 30px; font-size: 14px; }
.del-email .title { margin-bottom: 8px; }
.del-email > div:last-child { margin-top: 14px; }
.del-email :deep(.el-button) { border-radius: 9px; }
.update-pwd { display: grid; gap: 14px; }
@media (max-width: 600px) { .item { grid-template-columns: 95px minmax(0,1fr); } .avatar-setting { gap: 14px; align-items: flex-start; } }
</style>
