import type { HLJSApi } from 'highlight.js'
import plugin, { hljs } from '../types/index'
import type { CodeDiff, CodeDiffProps, CodeReader, CodeReaderProps, DiffResult, DiffStat } from '../types/index'

const codeDiffProps: CodeDiffProps = {
  oldString: 'old',
  newString: 'new',
  outputFormat: 'side-by-side',
  diffStyle: 'char',
  theme: 'dark',
}
const codeReaderProps: CodeReaderProps = { text: 'code', language: 'javascript' }
const result: DiffResult = { stat: { isChanged: true, addNum: 1, delNum: 1 } }
const stat: DiffStat = { additionsNum: 1, deletionsNum: 1, ignoreAdditionsNum: 0, ignoreDeletionsNum: 0 }
const highlighter: HLJSApi = hljs

declare const codeDiff: InstanceType<typeof CodeDiff>
declare const codeReader: InstanceType<typeof CodeReader>

codeDiff.$emit('diff', result)
codeDiff.$slots.stat({ stat })
codeDiffProps.oldString.toUpperCase()
codeReaderProps.text.toUpperCase()
codeReader.$props.text.toUpperCase()
plugin.install({ component: (_name, component) => component })
highlighter.highlight('const value = 1', { language: 'javascript' })

// @ts-expect-error oldString and newString are required
const missingStrings: CodeDiffProps = {}
// @ts-expect-error outputFormat only accepts the two documented layouts
codeDiffProps.outputFormat = 'inline'

void missingStrings
