<template>
  <main class="inbox-page">
    <div class="inbox-intro">
      <div>
        <span class="inbox-eyebrow">XIAOLINYX MAIL / INBOX</span>
        <h1>{{ $t('inbox') }}</h1>
        <p>{{ $t('inboxIntro') }}</p>
      </div>
      <span class="inbox-intro-icon" aria-hidden="true"><Icon icon="solar:letter-opened-linear" width="29" height="29" /></span>
    </div>
  <emailScroll ref="scroll" :inbox-design="true"
               :cancel-success="cancelStar"
               :star-success="addStar"
               :getEmailList="getEmailList"
               :emailDelete="emailDelete"
               :star-add="starAdd"
               :star-cancel="starCancel"
               :time-sort="params.timeSort"
               :email-read="emailRead"
               :show-unread="true"
               actionLeft="4px"
               @jump="jumpContent"
  >
    <template #first>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-down-outline"
            v-if="params.timeSort === 0" width="28" height="28"/>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-up-outline" v-else
            width="28" height="28"/>
    </template>

  </emailScroll>
  </main>
</template>

<script setup>
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import {useSettingStore} from "@/store/setting.js";
import emailScroll from "@/components/email-scroll/index.vue"
import {emailList, emailDelete, emailLatest, emailRead} from "@/request/email.js";
import {starAdd, starCancel} from "@/request/star.js";
import {defineOptions, h, onMounted, onBeforeUnmount, reactive, ref, watch} from "vue";
import {sleep} from "@/utils/time-utils.js";
import router from "@/router/index.js";
import {Icon} from "@iconify/vue";
import { useRoute } from 'vue-router'

defineOptions({
  name: 'email'
})

const route = useRoute();
const emailStore = useEmailStore();
const accountStore = useAccountStore();
const settingStore = useSettingStore();
const scroll = ref({})
const params = reactive({
  timeSort: 0,
})
let refreshActive = true

onBeforeUnmount(() => {
  refreshActive = false
})

onMounted(() => {
  emailStore.emailScroll = scroll;
  latest()
})


watch(() => accountStore.currentAccountId, () => {
  scroll.value.refreshList();
})

function changeTimeSort() {
  params.timeSort = params.timeSort ? 0 : 1
  scroll.value.refreshList();
}

function jumpContent(email) {
  emailStore.contentData.email = emailStore.toContentEmail(email)
  emailStore.contentData.delType = 'logic'
  emailStore.contentData.showUnread = true
  emailStore.contentData.showStar = true
  emailStore.contentData.showReply = true
  router.push('/mail')
}

const existIds = new Set();

async function latest() {
  while (refreshActive) {

    let autoRefresh = settingStore.settings.autoRefresh;
    await sleep(autoRefresh > 1 ? autoRefresh * 1000 : 3000);

    if (!refreshActive) break

    if (route.name !== 'email') {
      continue;
    }

    const latestId = scroll.value.latestEmail?.emailId

    if (!scroll.value.firstLoad && autoRefresh > 1) {
      try {
        const accountId = accountStore.currentAccountId
        const allReceive = scroll.value.latestEmail?.allReceive
        const curTimeSort = params.timeSort
        let list = []

        //确保发起请求时最后一个邮件是当前账号的,或者
        if (accountId === scroll.value.latestEmail?.reqAccountId) {
          list = await emailLatest(latestId, accountId, allReceive);
        }

        //确保请求回来后，账号没有切换，时间排序没有改变，全部邮件类型没变
        if (accountId === accountStore.currentAccountId && params.timeSort === curTimeSort && allReceive === accountStore.currentAccount.allReceive) {
          if (list.length > 0) {
            emailStore.applyFullList(list)

            for (let email of list) {

              email.reqAccountId = accountId;
              email.allReceive = allReceive;

              if (!existIds.has(email.emailId)) {

                existIds.add(email.emailId)
                scroll.value.addItem(email)

                await sleep(50)
              }

            }

          }

        }
      } catch (e) {
        if (e.code === 401 || e.code === 403) {
          settingStore.settings.autoRefresh = 0;
        }
        console.error(e)
      }
    }
  }
}

function addStar(email) {
  emailStore.starScroll?.addItem(email)
}

function cancelStar(email) {
  emailStore.starScroll?.deleteEmail([email.emailId])
}

function getEmailList(emailId, size) {
  const accountId =  accountStore.currentAccountId;
  const allReceive = accountStore.currentAccount.allReceive;
  return emailStore.fetchList(full =>
    emailList(accountId, allReceive, emailId, params.timeSort, size, 0, full)
  ).then(data => {
    data.latestEmail.reqAccountId = accountId;
    data.latestEmail.allReceive = allReceive;
    return data;
  })
}

</script>
<style>
.icon {
  cursor: pointer;
}
</style>
<style scoped>
.inbox-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
  min-height: 0;
  padding: clamp(18px, 2.3vw, 32px);
  background: radial-gradient(circle at 76% 0%, rgba(213, 225, 246, .32), transparent 42%), #f6f8fc;
}
.inbox-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 1420px);
  margin: 0 auto;
  color: #172a45;
}
.inbox-eyebrow {
  color: #567db8;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .15em;
}
.inbox-intro h1 {
  margin: 7px 0 4px;
  font-size: clamp(25px, 2vw, 31px);
  font-weight: 750;
  letter-spacing: -.04em;
}
.inbox-intro p { margin: 0; color: #78879b; font-size: 13px; }
.inbox-intro-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border: 1px solid #dce7f5;
  border-radius: 18px;
  background: rgba(255,255,255,.76);
  color: #3969bc;
  box-shadow: 0 10px 28px rgba(33,75,136,.06);
}
.inbox-page :deep(.email-container--inbox) {
  width: min(100%, 1420px);
  height: auto;
  min-height: 0;
  flex: 1;
  margin: 0 auto;
  border: 1px solid #e3eaf4;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(26, 55, 98, .055);
}
.inbox-page :deep(.email-container--inbox .header-actions) {
  min-height: 58px;
  padding-inline: 20px;
  border-bottom: 1px solid #e9eef5;
  box-shadow: none;
}
.inbox-page :deep(.email-container--inbox .email-count) {
  color: #68809e;
  font-size: 12px;
  font-weight: 650;
}
.inbox-page :deep(.email-container--inbox .email-row) {
  padding-inline: 20px;
  height: 64px;
  box-shadow: inset 0 -1px 0 #edf1f6;
}
.inbox-page :deep(.email-container--inbox .email-row .title) {
  grid-template-columns: 210px minmax(0, 1fr);
}
.inbox-page :deep(.email-container--inbox .email-row .email-sender .name) {
  font-weight: 650;
}
.inbox-page :deep(.email-container--inbox .email-row .email-content) {
  color: #8190a3;
}
:global(.dark) .inbox-page { background: radial-gradient(circle at 76% 0%, rgba(53, 80, 123, .18), transparent 42%), #111a2a; }
:global(.dark) .inbox-intro { color: #e6efff; }
:global(.dark) .inbox-intro p { color: #9eacc2; }
:global(.dark) .inbox-intro-icon { background: #1c2a40; border-color: #304159; color: #a8c4f4; }
:global(.dark) .inbox-page :deep(.email-container--inbox) { background: #192436; border-color: #304159; }
:global(.dark) .inbox-page :deep(.email-container--inbox .header-actions) { border-color: #304159; }
:global(.dark) .inbox-page :deep(.email-container--inbox .email-row) { box-shadow: inset 0 -1px 0 #304159; }
@media (max-width: 1366px) {
  .inbox-page :deep(.email-container--inbox .email-row) { height: 86px; }
  .inbox-page :deep(.email-container--inbox .email-row .title) { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .inbox-page { padding: 13px; gap: 13px; }
  .inbox-intro-icon { width: 44px; height: 44px; border-radius: 14px; }
  .inbox-page :deep(.email-container--inbox .header-actions) { min-height: 50px; padding-inline: 12px; }
  .inbox-page :deep(.email-container--inbox .email-row) { padding-inline: 10px; }
}
</style>
