import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import CodeDiff from '../src/index'
import App from './App.vue'

function getDefaultLang() {
  // 用户指定了默认语言时，使用用户指定的
  if (localStorage.getItem('lang') !== null) {
    return localStorage.getItem('lang')
  }
  else {
    // 用户未指定时，根据游览器选择:
    if (navigator.language === 'zh')
      return 'cn'
    else if (navigator.language === 'en')
      return 'en'
    else
      return 'en'
  }
}

const i18n = createI18n({
  locale: getDefaultLang() || 'cn', // 设置当前语言类型
  legacy: false, // 如果要支持compositionAPI，此项必须设置为false
  messages: {
    cn: {
      desc: '一个代码差异展示插件，支持 Vue 2 和 Vue 3',
      tools: {
        resetText: '重置文本',
        clearText: '清空文本',
        lang: 'English',
      },
      options: {
        title: '选项',
        language: '语言',
        theme: '主题',
        dayMode: '日间模式',
        nightMode: '夜间模式',
        contextRange: '差异化范围',
        outputFormat: '显示方式',
        lineByLine: '逐行显示',
        sideBySide: '并排显示',
        diffStyle: '差异风格',
        word: '按单词',
        char: '按字符',
        trim: '移除字符串前后空白字符',
        noDiffLineFeed: '不显示差异换行符',
        hideHeader: '隐藏首部',
        hideStatistics: '隐藏统计信息',
        forceInlineComparison: '强制行内对比',
        maxHeight: '固定高度(带上单位）',
      },
    },
    en: {
      desc: 'A code diff display plugin, available for Vue2 / Vue3.',
      tools: {
        resetText: 'Reset Text',
        clearText: 'Clear Text',
        lang: '简体中文',
      },
      options: {
        title: 'Options',
        language: 'Language',
        theme: 'Theme',
        dayMode: 'Day Mode',
        nightMode: 'Night Mode',
        contextRange: 'Context Range',
        outputFormat: 'Output Format',
        lineByLine: 'Line by Line',
        sideBySide: 'Side by Side',
        diffStyle: 'Diff Level',
        word: 'Word',
        char: 'Character',
        trim: 'Trim',
        noDiffLineFeed: 'No Diff Line Feed',
        hideHeader: 'Hide Header',
        hideStatistics: 'Hide Statistics',
        forceInlineComparison: 'Force Inline Comparison',
        maxHeight: 'Height(with unit)',
      },
    },
  },
},
)

export default i18n

const app = createApp(App)
app.use(CodeDiff)
app.use(i18n)

app.mount('#app')
