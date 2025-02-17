<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { newShortText } from './text/new-short-text'
import { oldShortText } from './text/old-short-text'

declare const __APP_VERSION__: string
const appVersion = __APP_VERSION__


interface FormState {
  language: string
  theme: 'light' | 'dark'
  diffStyle: 'word' | 'char'
  forceInlineComparison: boolean
  outputFormat: 'line-by-line' | 'side-by-side'
  context: number
  trim: boolean
  noDiffLineFeed: boolean
  filename: string
  newFilename: string
  hideHeader: boolean
  hideStat: boolean
  maxHeight: string
}

const formState = reactive<FormState>({
  language: 'json',
  theme: 'light',
  diffStyle: 'word',
  forceInlineComparison: false,
  outputFormat: 'side-by-side',
  context: 10,
  trim: false,
  noDiffLineFeed: false,
  filename: 'package.json',
  newFilename: 'newPackage.json',
  hideHeader: false,
  hideStat: false,
  maxHeight: '',
})

const oldString = ref(oldShortText.value)
const newString = ref(newShortText.value)
if (localStorage.getItem('oldString'))
  oldString.value = localStorage.getItem('oldString') ?? oldShortText.value

if (localStorage.getItem('newString'))
  newString.value = localStorage.getItem('newString') ?? newShortText.value

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

// 监听主题变化并更新 body class
watch(() => formState.theme, (newTheme) => {
  if (newTheme === 'dark')
    document.body.classList.add('dark')
  else
    document.body.classList.remove('dark')
}, { immediate: true })
</script>

<template>
  <div class="app-container">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-title">
          <div class="title-wrapper">
            <h1>
              v-code-diff
              <span class="version-tag">
                v{{ appVersion }}
              </span>
            </h1>
            <div class="subtitle">
              {{ t('desc') }}
            </div>
          </div>
          <div class="hero-actions">
            <button
              class="action-button theme-button"
              :class="{ 'is-dark': formState.theme === 'dark' }"
              @click="formState.theme = formState.theme === 'light' ? 'dark' : 'light'"
            >
              <span class="icon light">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor" />
                  <path d="M12 3V5M12 19V21M5 12H3M21 12H19M18.364 5.636L16.95 7.05M7.05 16.95L5.636 18.364M18.364 18.364L16.95 16.95M7.05 7.05L5.636 5.636" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="icon dark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </button>
            <button class="action-button lang-button" @click="toggleLang">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2" />
                  <path d="M3 12H21M12 3C14.5 6 15.5 9 15.5 12C15.5 15 14.5 18 12 21C9.5 18 8.5 15 8.5 12C8.5 9 9.5 6 12 3Z" stroke="currentColor" stroke-width="2" />
                </svg>
              </span>
            </button>
            <a href="https://github.com/Shimada666/v-code-diff" target="_blank" class="action-button github-button">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="editor-container">
        <div class="editor-section">
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <a-button-group>
                <a-button type="primary" @click="resetText">
                  {{ t('tools.resetText') }}
                </a-button>
                <a-button @click="clearText">
                  {{ t('tools.clearText') }}
                </a-button>
              </a-button-group>
            </div>
          </div>
          <div class="editor-content">
            <div class="editor-pane">
              <div class="editor-header">
                <a-input v-model:value="formState.filename" class="filename-input" placeholder="Original file name" />
              </div>
              <textarea v-model="oldString" class="code-editor" :rows="20" />
            </div>
            <div class="editor-pane">
              <div class="editor-header">
                <a-input v-model:value="formState.newFilename" class="filename-input" placeholder="Modified file name" />
              </div>
              <textarea v-model="newString" class="code-editor" :rows="20" />
            </div>
          </div>
        </div>
      </div>

      <div class="options-panel">
        <div class="options-header">
          <h2>{{ t('options.title') }}</h2>
          <div class="vue-version-info">
            Vue v{{ version }}
          </div>
        </div>
        <div class="options-content">
          <a-form layout="vertical" :model="formState">
            <a-row :gutter="16">
              <a-col :span="5">
                <a-form-item :label="t('options.language')">
                  <a-select v-model:value="formState.language">
                    <a-select-option
                      v-for="item in ['plaintext', 'json', 'yaml', 'javascript', 'java', 'python', 'sql', 'xml', 'bash']"
                      :key="item" :value="item"
                    >
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('options.outputFormat')">
                  <a-radio-group v-model:value="formState.outputFormat" button-style="solid">
                    <a-radio-button value="line-by-line">
                      {{ t('options.lineByLine') }}
                    </a-radio-button>
                    <a-radio-button value="side-by-side">
                      {{ t('options.sideBySide') }}
                    </a-radio-button>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('options.diffStyle')">
                  <a-radio-group v-model:value="formState.diffStyle" button-style="solid">
                    <a-radio-button value="word">
                      {{ t('options.word') }}
                    </a-radio-button>
                    <a-radio-button value="char">
                      {{ t('options.char') }}
                    </a-radio-button>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('options.contextRange')">
                  <a-input-number v-model:value="formState.context" :min="0" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="4">
                <a-form-item :label="t('options.maxHeight')">
                  <a-input v-model:value="formState.maxHeight" placeholder="500px" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('options.trim')">
                  <a-switch v-model:checked="formState.trim" />
                </a-form-item>
              </a-col>
              <a-col :span="5">
                <a-form-item :label="t('options.noDiffLineFeed')">
                  <a-switch v-model:checked="formState.noDiffLineFeed" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('options.hideHeader')">
                  <a-switch v-model:checked="formState.hideHeader" />
                </a-form-item>
              </a-col>
              <a-col :span="4">
                <a-form-item :label="t('options.hideStatistics')">
                  <a-switch v-model:checked="formState.hideStat" />
                </a-form-item>
              </a-col>
              <a-col :span="3">
                <a-form-item :label="t('options.forceInlineComparison')">
                  <a-switch v-model:checked="formState.forceInlineComparison" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>

      <div class="diff-viewer">
        <CodeDiff
          style="border-radius: 12px; border: 0; transition: all 0.3s ease; transform: translateY(0); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
          v-bind="formState"
          :old-string="oldString"
          :new-string="newString"
          @diff="printEvent"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.app-container {
  min-height: 100vh;
  background: #f8fafc;
}

.hero-section {
  position: relative;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 40px 0;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    background:
      repeating-linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.12) 0px,
        rgba(255, 255, 255, 0.12) 1px,
        transparent 1px,
        transparent 10px
      );
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .hero-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .title-wrapper {
    h1 {
      font-size: 56px;
      font-weight: 800;
      margin: 0;
      color: white;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: relative;
      display: inline-block;

      .version-tag {
        position: absolute;
        top: 2px;
        right: -52px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.95);
        padding: 4px 8px 4px 24px;
        border-radius: 6px;
        font-weight: 500;
        transform: rotate(15deg);
        backdrop-filter: blur(8px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;

        &::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%) rotate(25deg);
          width: 12px;
          height: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z' /%3E%3Ccircle cx='6.75' cy='6.75' r='1' fill='white' /%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.95;
        }

        &:hover {
          transform: rotate(15deg) translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }
      }
    }

    .subtitle {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.95);
      max-width: 600px;
      line-height: 1.5;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
  }

  .hero-actions {
    display: flex;
    gap: 8px;
    align-items: center;

    .action-button {
      width: 40px;
      height: 40px;
      padding: 0;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
      }
    }

    .theme-button {
      position: relative;
      overflow: hidden;

      .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;

        &.light {
          opacity: 1;
          transform: translate(-50%, -50%) rotate(0);
        }

        &.dark {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(90deg);
        }
      }

      &.is-dark {
        .icon.light {
          opacity: 0;
          transform: translate(-50%, -50%) rotate(-90deg);
        }

        .icon.dark {
          opacity: 1;
          transform: translate(-50%, -50%) rotate(0);
        }
      }
    }
  }
}

.main-content {
  max-width: 1400px;
  margin: -40px auto 0;
  padding: 0 24px 40px;
  position: relative;
  z-index: 1;
}

.editor-container {
  margin-bottom: 24px;

  .editor-section {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .editor-toolbar {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .editor-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #e5e7eb;
  }

  .editor-pane {
    background: white;

    .editor-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .code-editor {
      width: 100%;
      padding: 16px;
      border: none;
      resize: vertical;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      background: white;
      min-height: 300px;

      &:focus {
        outline: none;
        background: #f8fafc;
      }
    }
  }
}

.options-panel {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  .options-header {
    padding: 12px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .vue-version-info {
      font-size: 13px;
      color: #64748b;
    }
  }

  .options-content {
    padding: 12px 24px;
  }

  .ant-form-item {
    margin-bottom: 0;

    .ant-form-item-label {
      padding-bottom: 4px;

      > label {
        color: #4b5563;
        font-size: 13px;
        height: 20px;
      }
    }

    .ant-form-item-control {
      line-height: 1;
    }
  }

  .ant-radio-group {
    width: 100%;
    display: flex;
    gap: 4px;

    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
      padding: 0 8px;
      height: 28px;
      line-height: 26px;
      font-size: 13px;
    }
  }

  .ant-select,
  .ant-input,
  .ant-input-number {
    width: 100%;
  }

  .ant-switch {
    min-width: 36px;
    height: 18px;
    line-height: 18px;

    .ant-switch-handle {
      width: 14px;
      height: 14px;
    }
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector {
    height: 28px !important;
    font-size: 13px;
  }

  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
    height: 28px !important;

    .ant-select-selection-search-input {
      height: 26px;
    }

    .ant-select-selection-item {
      line-height: 26px;
    }
  }

  .ant-row {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Dark theme support
body.dark {
  background: #020617;
  color: #e2e8f0;

  .app-container {
    background: #020617;
  }

  .editor-container {
    .editor-section {
      background: #0f172a;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .editor-toolbar {
      background: #0f172a;
      border-color: #1e293b;
    }

    .editor-content {
      background: #1e293b;
    }

    .editor-pane {
      background: #0f172a;

      .editor-header {
        background: #0f172a;
        border-color: #1e293b;
      }

      .code-editor {
        color: #e2e8f0;
        background: #0f172a;

        &:focus {
          background: #090f1d;
        }
      }
    }
  }

  .options-panel {
    background: #0f172a;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);

    .options-header {
      border-color: #1e293b;

      h2 {
        color: #e2e8f0;
      }

      .vue-version-info {
        color: #94a3b8;
      }
    }

    .options-group {
      h3 {
        color: #94a3b8;
      }
    }

    .ant-form-item-label > label {
      color: #e2e8f0;
    }
  }

  .editor-toolbar {
    .theme-button,
    .lang-button {
      background: #1e293b;
      border-color: #334155;
      color: #94a3b8;

      &:hover {
        border-color: #475569;
        color: #e2e8f0;
      }
    }
  }

  .hero-actions {
    .action-button {
      background: rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .diff-viewer {
    .v-code-diff {
      &:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
      }
    }
  }

  // Ant Design dark mode overrides
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background-color: #1e293b;
    border-color: #334155;
    color: #e2e8f0;
  }

  .ant-select-dropdown {
    background-color: #1e293b;
    border-color: #334155;

    .ant-select-item {
      color: #e2e8f0;

      &-option-active,
      &-option-selected {
        background-color: #2d3748;
      }

      &:hover {
        background-color: #2d3748;
      }
    }
  }

  .ant-input,
  .ant-input-number {
    background-color: #1e293b;
    border-color: #334155;
    color: #e2e8f0;

    &:hover,
    &:focus {
      border-color: #4b5563;
    }

    .ant-input-number-handler-wrap {
      background-color: #2d3748;
      border-color: #334155;
    }
  }

  .ant-radio-button-wrapper {
    background-color: #1e293b;
    border-color: #334155;
    color: #e2e8f0;

    &:hover {
      color: #60a5fa;
    }

    &-checked {
      background-color: #2563eb;
      border-color: #2563eb;
      color: white;

      &:hover {
        color: white;
      }
    }
  }

  .ant-switch {
    background-color: #4b5563;

    &-checked {
      background-color: #2563eb;
    }
  }

  .ant-form-item-label > label {
    color: #e2e8f0;
  }

  .ant-btn {
    background-color: #1e293b;
    border-color: #334155;
    color: #e2e8f0;

    &:hover {
      background-color: #2d3748;
      border-color: #4b5563;
      color: #f8fafc;
    }

    &.ant-btn-primary {
      background-color: #2563eb;
      border-color: #2563eb;
      color: white;

      &:hover {
        background-color: #1d4ed8;
        border-color: #1d4ed8;
      }
    }
  }

  .hero-section {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);

    &::before {
      opacity: 0.15;
    }

    &::after {
      background: radial-gradient(
        circle at 50% 50%,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.2) 100%
      );
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.85);
    }

    .version-tag {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.diff-viewer {
  .v-code-diff {
    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15) !important;
    }
  }
}
</style>
