import * as path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import { isVue2 } from 'vue-demi'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

const umd = process.env.format === 'umd'

const outputName = 'index'
export const defaultPlugins = [
  cssInjectedByJsPlugin(),
]

// https://vitejs.dev/config/
export const baseBuildConfig = defineConfig({
  build: {
    outDir: path.resolve(__dirname, `../dist/${isVue2 ? 'v2' : 'v3'}`),
    emptyOutDir: false,
    target: 'es2018',
    lib: {
      entry: path.resolve(__dirname, umd ? '../src/global.ts' : '../src/index.ts'),
      formats: umd ? ['umd'] : ['es', 'cjs'],
      name: 'CodeDiff',
      fileName: format => format === 'cjs' ? `${outputName}.cjs` : `${outputName}.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@vue/composition-api/dist/vue-composition-api.mjs'],
      output: {
        globals: {
          'vue': 'Vue',
          '@vue/composition-api/dist/vue-composition-api.mjs':
            'VueCompositionAPI',
        },
        paths: {
          '@vue/composition-api/dist/vue-composition-api.mjs': '@vue/composition-api',
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['vue-demi', 'vue', 'vue2'],
  },
})
