import type { HLJSApi } from 'highlight.js'
import type { DefineComponent, VNode } from 'vue-demi'

export interface CodeDiffProps {
  newString: string
  oldString: string
  language?: string
  context?: number
  diffStyle?: 'word' | 'char'
  forceInlineComparison?: boolean
  outputFormat?: 'line-by-line' | 'side-by-side'
  trim?: boolean
  noDiffLineFeed?: boolean
  maxHeight?: string
  filename?: string
  newFilename?: string
  hideHeader?: boolean
  hideStat?: boolean
  theme?: 'light' | 'dark'
  ignoreMatchingLines?: string
}

export interface CodeReaderProps {
  text: string
  language?: string
}

export interface DiffStat {
  additionsNum: number
  deletionsNum: number
  ignoreAdditionsNum: number
  ignoreDeletionsNum: number
}

export interface DiffResult {
  stat: {
    isChanged: boolean
    addNum: number
    delNum: number
  }
}

export interface CodeDiffSlots {
  stat: (props: { stat: DiffStat }) => VNode[]
}

interface CodeDiffEmits {
  diff: (diffResult: DiffResult) => void
}

type Empty = Record<string, never>
type CodeDiffComponent = DefineComponent<CodeDiffProps, Empty, Empty, Empty, Empty, Empty, Empty, CodeDiffEmits, 'diff'>

export declare const CodeDiff: CodeDiffComponent & {
  new (): InstanceType<CodeDiffComponent> & { $slots: CodeDiffSlots }
}

export declare const CodeReader: DefineComponent<CodeReaderProps>
export declare const hljs: HLJSApi

declare const plugin: {
  install: (app: { component: (name: string, component: unknown) => unknown }) => void
  hljs: HLJSApi
}

export default plugin
