<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { newShortText } from './text/new-short-text'
import { oldShortText } from './text/old-short-text'

const appVersion = __APP_VERSION__

const formState = reactive({
  language: 'json',
  theme: 'light',
  diffStyle: 'word',
  enableSplitDiff: false,
  outputFormat: 'side-by-side',
  context: 10,
  trim: false,
  noDiffLineFeed: false,
  filename: 'package.json',
  newFilename: 'newPackage.json',
  hideHeader: false,
  hideStat: false,
})

const oldString = ref(oldShortText.value)
const newString = ref(newShortText.value)
if (localStorage.getItem('oldString'))
  oldString.value = localStorage.getItem('oldString')

if (localStorage.getItem('newString'))
  newString.value = localStorage.getItem('newString')

function resetText() {
  localStorage.removeItem('oldString')
  localStorage.removeItem('newString')
  oldString.value = oldShortText.value
  newString.value = newShortText.value
}

function clearText() {
  localStorage.removeItem('oldString')
  localStorage.removeItem('newString')
  oldString.value = ''
  newString.value = ''
}

watch(oldString, () => localStorage.setItem('oldString', oldString.value))
watch(newString, () => localStorage.setItem('newString', newString.value))

function printEvent(e) {
  // eslint-disable-next-line no-console
  console.log('diff finished! below is data:')
  // eslint-disable-next-line no-console
  console.log(e)
}

const { locale, t } = useI18n()

function toggleLang() {
  locale.value = locale.value === 'en' ? 'cn' : 'en'
}
</script>

<template>
  <div style="padding:10px 35px">
    <div class="banner">
      <h1>v-code-diff</h1>
      <p>{{ t('desc') }}</p>
      <p align="center">
        Vue ver: {{ version }}. CodeDiff ver: {{ appVersion }}
      </p>
      <a-button type="primary">
        <a href="https://github.com/Shimada666/v-code-diff">GitHub</a>
      </a-button>
      <a-button v-model="locale" style="margin-left: 5px; width: 100px" @click="toggleLang">
        {{ t('tools.lang') }}
      </a-button>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <div style="margin-right: 5px;">
        <a-input v-model:value="formState.filename" />
        <textarea v-model="oldString" style="width: 48vw;" :rows="20" />
      </div>
      <div>
        <a-input v-model:value="formState.newFilename" />
        <textarea v-model="newString" style="width: 48vw;" :rows="20" />
      </div>
    </div>
    <div style="margin-top: 10px;">
      <a-button style="margin-right: 5px;" @click="resetText">
        {{ t('tools.resetText') }}
      </a-button>
      <a-button type="default" @click="clearText">
        {{ t('tools.clearText') }}
      </a-button>
    </div>
    <a-card style="margin-top:15px" :title="t('options.title')">
      <a-form layout="inline" :model="formState">
        <a-row :gutter="16">
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.language') }}</span> </slot>
              <a-select v-model:value="formState.language" style="width: 12vw;">
                <a-select-option
                  v-for="item in ['plaintext', 'json', 'yaml', 'javascript', 'java', 'python', 'sql', 'xml', 'bash']"
                  :key="item" :value="item"
                >
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.theme') }}</span> </slot>
              <a-radio-group v-model:value="formState.theme">
                <a-radio value="light">
                  {{ t('options.dayMode') }}
                </a-radio>
                <a-radio value="dark">
                  {{ t('options.nightMode') }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.contextRange') }}</span> </slot>
              <a-input-number v-model:value="formState.context" :min="0" style="width: 12vw;" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.outputFormat') }}</span> </slot>
              <a-radio-group v-model:value="formState.outputFormat">
                <a-radio value="line-by-line">
                  {{ t('options.lineByLine') }}
                </a-radio>
                <a-radio value="side-by-side">
                  {{ t('options.sideBySide') }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.diffStyle') }}</span> </slot>
              <a-radio-group v-model:value="formState.diffStyle">
                <a-radio value="word">
                  {{ t('options.word') }}
                </a-radio>
                <a-radio value="char">
                  {{ t('options.char') }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.trim') }}</span> </slot>
              <a-switch v-model:checked="formState.trim" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.noDiffLineFeed') }}</span> </slot>
              <a-switch v-model:checked="formState.noDiffLineFeed" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.hideHeader') }}</span> </slot>
              <a-switch v-model:checked="formState.hideHeader" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item>
              <slot><span class="form-item-label">{{ t('options.hideStatistics') }}</span> </slot>
              <a-switch v-model:checked="formState.hideStat" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="启用细分变更(enable split diff)">
              <a-switch v-model:checked="formState.enableSplitDiff" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <div>
      <CodeDiff
        :theme="formState.theme" :old-string="oldString" :new-string="newString" :language="formState.language"
        :diff-style="formState.diffStyle" :enable-split-diff="formState.enableSplitDiff" :output-format="formState.outputFormat" :context="formState.context"
        :trim="formState.trim" :no-diff-line-feed="formState.noDiffLineFeed" :filename="formState.filename"
        :new-filename="formState.newFilename" :hide-header="formState.hideHeader" :hide-stat="formState.hideStat"
        @diff="printEvent"
      />
    </div>
  </div>
</template>

<style lang="scss">
.banner {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

.banner h1 {
  background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  color: transparent;
  -webkit-background-clip: text;
  font-size: 88px;
  line-height: 90px;
  font-weight: bold;
  margin-bottom: 10px;
}

.banner p {
  font-size: 16px;
  color: #666;
}

.form-item-label {
  display: inline-block;
  flex-grow: 0;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
  vertical-align: middle;
}

.form-item-label:after {
  content: ":";
  position: relative;
  top: -0.5px;
  margin: 0 8px 0 2px;
}
</style>
