import CodeDiff from './CodeDiff.vue'
import CodeReader from './CodeReader.vue'
import hljs from './highlight'

function install(app: any) {
  app.component('CodeDiff', CodeDiff)
  app.component('CodeReader', CodeReader)
}

export default {
  install,
  hljs,
}
