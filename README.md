# v-code-diff

[![NPM version](https://img.shields.io/npm/v/v-code-diff.svg?style=flat)](https://www.npmjs.com/package/v-code-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/v-code-diff?minimal=true)](https://www.npmjs.com/package/v-code-diff)

> A code diff viewer for Vue 2.6, Vue 2.7, and Vue 3.

<p align='center'>
<b>English</b> | <a href="https://github.com/Shimada666/v-code-diff/blob/main/README-zh.md">简体中文</a>
</p>

Old version:

The 0.x line ended at 0.3.12 and is no longer maintained. It was based on
[vue-code-diff](https://github.com/ddchef/vue-code-diff). Version 1.x aims to preserve its core behavior while keeping
migration straightforward.

This project draws inspiration from the following projects. Thanks to their original authors:

- [vue-diff](https://github.com/hoiheart/vue-diff)
- [vue-code-diff](https://github.com/ddchef/vue-code-diff)
- Github Code Diff

## Contents
- [Install](#Install)
- [Getting started](#Getting-started)
  - [Vue3](#Vue3)
  - [Vue2](#Vue2)
- [Props](#Props)
- [Events](#Events)
- [Demo](#Demo)
- [Extend languages](#extend-languages)
- [Migrate from 0.x version](#Migrate-from-0x-version)

## Install

Install `v-code-diff`:

```bash
# npm
npm i v-code-diff

# yarn
yarn add v-code-diff

# pnpm
pnpm add v-code-diff
```

`v-code-diff` uses `postinstall` to select the build for your Vue version. Do not install it with `--ignore-scripts`.
If pnpm reports that the build script was blocked, approve it and let pnpm run the script:

```shell
pnpm approve-builds v-code-diff
```

Vue 2.6 users must also install and register `@vue/composition-api`:

```shell
pnpm add @vue/composition-api
```

```ts
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
```

## Getting Started

### Vue3

#### Register locally
> Recommend using local registration for better tree-shaking support.
```vue
<script setup>
import { CodeDiff } from 'v-code-diff'
</script>

<template>
  <div>
    <CodeDiff
      old-string="12345"
      new-string="3456"
      output-format="side-by-side"
    />
  </div>
</template>
```

#### Register globally

```ts
import { createApp } from 'vue'
import CodeDiff from 'v-code-diff'
import App from './App.vue'

createApp(App).use(CodeDiff).mount('#app')
```

Then use the component in any template:

```vue
<template>
  <code-diff
    old-string="12345"
    new-string="3456"
    output-format="side-by-side"
  />
</template>
```

### Vue2

#### Register locally
> Recommend using local registration for better tree-shaking support.
```vue
<script>
import { CodeDiff } from 'v-code-diff'
export default {
  components: {
    CodeDiff
  }
}
</script>

<template>
  <div>
    <CodeDiff
      old-string="12345"
      new-string="3456"
      output-format="side-by-side"
    />
  </div>
</template>
```
#### Register globally
```ts
import Vue from 'vue'
import CodeDiff from 'v-code-diff'

Vue.use(CodeDiff)
```

## Demo

|        | npm | cdn                                                                            |
| ------ | --- | ------------------------------------------------------------------------------ |
| vue2   |     | [vue2-cdn](https://stackblitz.com/edit/v-code-diff-vue2-cdn?file=index.html)   |
| vue2.7 |     | [vue27-cdn](https://stackblitz.com/edit/v-code-diff-vue27-cdn?file=index.html) |
| vue3   |     | [vue3-cdn](https://stackblitz.com/edit/v-code-diff-vue3-cdn?file=index.html)   |

## Props

| Prop                | Description                                                                                                                                                             | Type      | Optional Values           | Default Value |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------------------------|---------------|
| language            | Syntax-highlighting language, such as javascript. Defaults to plain text.                                                                                               | string    | -                         | plaintext     |
| oldString           | Old string                                                                                                                                                              | string    | -                         | -             |
| newString           | New string                                                                                                                                                              | string    | -                         | -             |
| context             | Number of unchanged lines shown around each change                                                                                                                       | number    | -                         | 10            |
| outputFormat        | Display mode                                                                                                                                                            | string    | line-by-line, side-by-side | line-by-line  |
| diffStyle           | Inline difference granularity: words or characters                                                                                                                       | string    | word, char                | word          |
| forceInlineComparison | Force inline comparison (word or char level)                                                                                                                           | boolean   | -                         | false         |
| trim                | Remove blank characters at the beginning and end of the string                                                                                                          | boolean   | -                         | false         |
| noDiffLineFeed      | Normalize Windows (CRLF) and Unix (LF) line endings before comparison                                                                                                   | boolean   | -                         | false         |
| maxHeight           | Maximum height of component, for example: 300px                                                                                                                         | string    | -                         | undefined     |
| filename            | Filename                                                                                                                                                                | string    | -                         | undefined     |
| newFilename         | New filename                                                                                                                                                            | string    | -                         | undefined     |
| hideHeader          | Hide header bar                                                                                                                                                         | boolean   | -                         | false         |
| hideStat            | Hide statistical part in the header bar                                                                                                                                 | boolean   | -                         | false         |
| hideNavigation      | Hide the next/previous change buttons                                                                                                                                   | boolean   | -                         | false         |
| theme               | Add dark mode                                                                                                                                                           | ThemeType | light , dark              | light         |
| ignoreMatchingLines | Give a pattern to ignore matching lines eg: '(time\|token)'                                                                                                             | string    | -                         | undefined     |

## Events

| Name | Description                 | Type                                                                            |
| ---- | --------------------------- | ------------------------------------------------------------------------------- |
| diff | Emitted after the diff is calculated | (result: {stat: { isChanged: boolean, addNum: number, delNum: number}}) => void |
| change-click | Emitted when an added or removed line is clicked | (payload: {side: 'old' \| 'new', type: 'added' \| 'removed', lineNumber: number, event: MouseEvent}) => void |

## Slot

| Name | Description                                                 |
| ---- | ----------------------------------------------------------- |
| stat | Custom statistics content. The slot prop is `{ stat }`. |
| header-actions | Custom actions displayed in the header. |

## Extend languages

To keep the bundle small, the following languages are registered by default:

- plaintext
- xml/html
- javascript
- json
- yaml
- python
- java
- bash
- sql

To use another language, import and register its highlighting module manually.

```shell
pnpm add highlight.js
```
#### Register locally
> Recommend using local registration for better tree-shaking support.
```vue
<script>
import { CodeDiff, hljs } from 'v-code-diff'
import c from 'highlight.js/lib/languages/c'
// Extend C language
hljs.registerLanguage('c', c)
export default {
  components: {
    CodeDiff,
  }
}
</script>

<template>
  <div>
    <CodeDiff
      old-string="#include <stdio.h>"
      new-string="#include <stdio.h>\nint a = 1;"
      output-format="side-by-side"
      language="c"
    />
  </div>
</template>
```

#### Register globally
```typescript
import CodeDiff from 'v-code-diff'
// Extend C language
import c from 'highlight.js/lib/languages/c'

CodeDiff.hljs.registerLanguage('c', c)
```

## Migrate from 0.x version

Version 1.x has a smaller bundle and better performance than 0.x while preserving its core behavior.

Key points:

- Version 1.x no longer detects or highlights languages automatically. Set the language explicitly, such as
  `language="python"`; if omitted, it defaults to `plaintext` without syntax highlighting.
- The legacy `before-render` and `after-render` events were removed. The `diff` event remains available.
- Large results render 1,000 lines at a time. Use the load-more control to reveal the next batch.
- Inline word/character markers are skipped when a changed line pair exceeds 10,000 characters. Set
  `force-inline-comparison` to keep detailed markers when the extra processing time is acceptable.
- In the 1.x version, the following component properties (Prop) have been changed:
  - highlight - removed
  - drawFileList - removed
  - fileName - rename to "filename"
  - newFilename - new
  - theme - new

The tables below summarize the migration details.

### Event changes

The legacy `before-render` and `after-render` events are no longer provided in 1.x.

| Event Name    | Change Status      |
| ------------- | ------------------ |
| before-render | No longer provided |
| after-render  | No longer provided |

### Prop changes

| Prop                   | Description                                                                 | Change Status                                   |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| highlight              | Control code highlighting                                                   | Removed in version 1.x                          |
| language               | Code language                                                               | None                                            |
| oldString              | Old string                                                                  | None                                            |
| newString              | New string                                                                  | None                                            |
| context                | The number of lines to separate different parts so that they are not hidden | None                                            |
| output-format          | Display mode                                                                | None                                            |
| diffStyle              | Difference style, word-level differences or letter-level differences        | None                                            |
| drawFileList           | Display file comparison list                                                | Removed in version 1.x                          |
| renderNothingWhenEmpty | Do not render when there is no comparison                                   | Removed in version 1.x                          |
| fileName               | File name                                                                   | Renamed to `filename` in 1.x                    |
| newFilename            | New file name                                                               | Added in 1.x                                    |
| isShowNoChange         | Display source code when there is no comparison                             | Removed as it became the default in version 1.x |
| trim                   | Remove blank characters at the beginning and end of the string              | None                                            |
| noDiffLineFeed         | Don't diff Windows line feed (CRLF) and Linux line feed (LF)                | None                                            |
| theme                  | Add dark mode                                                               | New in version 1                                            |

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Shimada666/v-code-diff&type=Date)](https://star-history.com/#Shimada666/v-code-diff&Date)
