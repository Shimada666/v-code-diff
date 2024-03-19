<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive, ref, watch } from 'vue'
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
</script>

<template>
  <div style="padding:10px 35px">
    <div class="banner">
      <h1>v-code-diff</h1>
      <p>A code diff display plugin, available for Vue2 / Vue3.</p>
      <p align="center">
        Vue version: {{ version }}. CodeDiff version: {{ appVersion }}
      </p>
      <a-button type="primary">
        <a href="https://github.com/Shimada666/v-code-diff">View on Github</a>
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
        重置文本(reset text)
      </a-button>
      <a-button type="default" @click="clearText">
        清空文本(clear text)
      </a-button>
    </div>
    <a-card style="margin-top:15px" title="Options">
      <a-form layout="inline" :model="formState">
        <a-row :gutter="16">
          <a-col :md="8" :sm="24">
            <a-form-item label="语言(langauge)">
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
            <a-form-item label="主题模式(theme)">
              <a-radio-group v-model:value="formState.theme">
                <a-radio value="light">
                  日间模式(light)
                </a-radio>
                <a-radio value="dark">
                  夜间模式(dark)
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="差异化范围(context)">
              <a-input-number v-model:value="formState.context" :min="0" style="width: 12vw;" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="显示方式(outputFormat)">
              <a-radio-group v-model:value="formState.outputFormat">
                <a-radio value="line-by-line">
                  line-by-line
                </a-radio>
                <a-radio value="side-by-side">
                  side-by-side
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="差异级别(diffStyle)">
              <a-radio-group v-model:value="formState.diffStyle">
                <a-radio value="word">
                  word
                </a-radio>
                <a-radio value="char">
                  char
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="移除字符串前后空白字符(trim)">
              <a-switch v-model:checked="formState.trim" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="不 diff 换行符(noDiffLineFeed)">
              <a-switch v-model:checked="formState.noDiffLineFeed" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="隐藏首部(hide Header)">
              <a-switch v-model:checked="formState.hideHeader" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="隐藏统计信息(hide Statistics)">
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
</style>
