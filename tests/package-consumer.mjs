import { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)
const entry = process.env.PACKAGE_ENTRY
const vueVersion = process.env.VUE_VERSION
const esm = await import(entry)
const cjs = require(entry)

if (!esm.CodeDiff || !cjs.CodeDiff)
  throw new Error(`${entry} does not expose CodeDiff through ESM and CJS`)

let html
if (vueVersion.startsWith('2.')) {
  const Vue = require('vue')
  if (vueVersion.startsWith('2.6.'))
    Vue.use(require('@vue/composition-api').default)

  const renderer = require('vue-server-renderer').createRenderer()
  html = await renderer.renderToString(new Vue({
    render: h => h(cjs.CodeDiff, { props: { oldString: 'old', newString: 'new' } }),
  }))
}
else {
  const { createSSRApp, h } = require('vue')
  const { renderToString } = require('@vue/server-renderer')
  html = await renderToString(createSSRApp({
    render: () => h(cjs.CodeDiff, { oldString: 'old', newString: 'new' }),
  }))
}

if (!html.includes('code-diff-view'))
  throw new Error(`${entry} did not render CodeDiff through SSR`)
