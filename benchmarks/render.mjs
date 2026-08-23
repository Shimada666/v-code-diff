import process from 'node:process'
import { performance } from 'node:perf_hooks'

process.env.NODE_ENV = 'production'

const { createSSRApp, h } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { CodeDiff } = await import('../dist/v3/index.es.js')

const lines = Array.from({ length: 15_000 }, (_, index) => `const value${index} = ${index}`)
const changedLines = [...lines]
changedLines[7_500] = 'const value7500 = "changed"'
const oldString = lines.join('\n')
const newString = changedLines.join('\n')

for (const outputFormat of ['line-by-line', 'side-by-side']) {
  const samples = []
  let renderedRows = 0
  for (let index = 0; index < 3; index++) {
    globalThis.gc?.()
    const startedAt = performance.now()
    const html = await renderToString(createSSRApp({
      render: () => h(CodeDiff, {
        context: 3,
        hideHeader: true,
        language: 'plaintext',
        newString,
        oldString,
        outputFormat,
      }),
    }))
    samples.push(performance.now() - startedAt)
    renderedRows = html.match(/<tr/g)?.length ?? 0
  }
  samples.sort((a, b) => a - b)
  process.stdout.write(`${outputFormat}: ${samples[1].toFixed(1)}ms median, ${renderedRows} rows\n`)
}
