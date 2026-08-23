# v-code-diff

[![NPM version](https://img.shields.io/npm/v/v-code-diff.svg?style=flat)](https://www.npmjs.com/package/v-code-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/v-code-diff?minimal=true)](https://www.npmjs.com/package/v-code-diff)

> 支持 Vue 2.6、Vue 2.7 和 Vue 3 的代码差异查看组件。

<p align='center'>
<a href="https://github.com/Shimada666/v-code-diff/blob/main/README.md">English</a> | <b>简体中文</b>
</p>

旧版本：

- 0.x 的最后一个版本是 0.3.12，基于 [vue-code-diff](https://github.com/ddchef/vue-code-diff) 改进，现已停止维护。
  1.x 尽量保留其核心功能，以降低迁移成本。

本项目参考了以下项目，在此对原作者表示感谢！

- [vue-diff](https://github.com/hoiheart/vue-diff)
- [vue-code-diff](https://github.com/ddchef/vue-code-diff)
- Github Code Diff

## 目录

- [安装](#安装)
- [开始使用](#开始使用)
  - [Vue3](#Vue3)
  - [Vue2](#Vue2)
- [在线演示](#Demo)
- [组件属性](#组件属性)
- [组件事件](#组件事件)
- [扩展高亮语言](#扩展高亮语言)
- [从 0.x 版本迁移](#从-0x-版本迁移)

## 安装

安装 `v-code-diff`

```bash
# npm
npm i v-code-diff

# yarn
yarn add v-code-diff

# pnpm
pnpm add v-code-diff
```

`v-code-diff` 通过 `postinstall` 选择与当前 Vue 版本匹配的构建产物，请勿使用 `--ignore-scripts` 安装。
如果 pnpm 提示构建脚本被阻止，请执行：

```shell
pnpm approve-builds v-code-diff
```

Vue 2.6 用户还需要安装并注册 `@vue/composition-api`：

```shell
pnpm add @vue/composition-api
```

```ts
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'

Vue.use(VueCompositionAPI)
```

## 开始使用

### Vue3

#### 单独引入
> 推荐使用，因为对 tree-shaking 有更好的支持。
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

#### 注册为全局组件

```ts
import { createApp } from 'vue'
import CodeDiff from 'v-code-diff'
import App from './App.vue'

createApp(App).use(CodeDiff).mount('#app')
```

注册后即可在模板中使用：

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

#### 单独引入
> 推荐使用，因为对 tree-shaking 有更好的支持。
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
#### 注册为全局组件
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

## 组件属性

| 参数                  | 说明                                                                                                                 | 类型        | 可选值                       | 默认值          |
|---------------------|--------------------------------------------------------------------------------------------------------------------|-----------|---------------------------|--------------|
| language            | 代码高亮语言，例如 javascript，默认为纯文本                                                                                       | string    | -                         | plaintext    |
| oldString           | 旧的字符串                                                                                                              | string    | -                         | -            |
| newString           | 新的字符串                                                                                                              | string    | -                         | -            |
| context             | 每处差异前后显示的未变行数                                                                                                       | number    | -                         | 10           |
| outputFormat        | 展示方式                                                                                                               | string    | line-by-line, side-by-side | line-by-line |
| diffStyle           | 行内差异粒度：词级或字符级                                                                                                       | string    | word, char                | word         |
| forceInlineComparison | 强制进行词级或字符级行内对比                                                                                                      | boolean   | -                         | false        |
| trim                | 移除字符串前后空白字符                                                                                                        | boolean   | -                         | false        |
| noDiffLineFeed      | 比较前统一 Windows（CRLF）与 Unix（LF）换行符                                                                                | boolean   | -                         | false        |
| maxHeight           | 组件最大高度，例如 300px                                                                                                    | string    | -                         | undefined    |
| filename            | 文件名                                                                                                                | string    | -                         | undefined    |
| newFilename         | 新文件文件名                                                                                                             | string    | -                         | undefined    |
| hideHeader          | 隐藏头部栏                                                                                                              | boolean   | -                         | false        |
| hideStat            | 隐藏头部栏中的统计信息                                                                                                        | boolean   | -                         | false        |
| hideNavigation      | 隐藏上一处/下一处差异按钮                                                                                                      | boolean   | -                         | false        |
| theme               | 用于切换日间模式/夜间模式                                                                                                      | ThemeType | light , dark              | light        |
| ignoreMatchingLines | 用于忽略匹配行的正则表达式，例如：'(time\|token)'                                                                                  | string    | -                         | undefined    |

## 组件事件

| Name | Description     | Type                                                                            |
| ---- | --------------- | ------------------------------------------------------------------------------- |
| diff | 差异计算完成后触发 | (result: {stat: { isChanged: boolean, addNum: number, delNum: number}}) => void |
| change-click | 点击新增或删除行时触发 | (payload: {side: 'old' \| 'new', type: 'added' \| 'removed', lineNumber: number, event: MouseEvent}) => void |

## 组件插槽

| Name | Description                     |
| ---- | ------------------------------- |
| stat | 自定义统计内容，插槽参数为 `{ stat }` |
| header-actions | 在头部区域显示自定义操作按钮 |

## 扩展高亮语言

为了减小打包体积，默认只注册以下语言：

- plaintext
- xml/html
- javascript
- json
- yaml
- python
- java
- bash
- sql

如需使用其他语言，可以手动引入并注册对应的高亮模块。

```shell
pnpm add highlight.js
```
#### 单独引入
> 推荐使用，因为对 tree-shaking 有更好的支持。
```vue
<script>
import { CodeDiff, hljs } from 'v-code-diff'
import c from 'highlight.js/lib/languages/c'
// 注册 C 语言
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
#### 全局注册
```typescript
import CodeDiff from 'v-code-diff'
// 注册 C 语言
import c from 'highlight.js/lib/languages/c'

CodeDiff.hljs.registerLanguage('c', c)
```

## 从 0.x 版本迁移

v-code-diff 1.x 相比 0.x 具有更小的打包体积和更好的性能，同时保留其核心功能。

重点：

- 1.x 不再自动识别并高亮语言。请显式指定语言，例如 `language="python"`；未指定时使用 `plaintext`，不进行语法高亮。
- 1.x 移除了旧的 `before-render` 和 `after-render` 事件，`diff` 事件仍然可用
- 1.x 版本中，以下组件属性(Prop)有变动
  - highlight - 移除
  - drawFileList - 移除
  - fileName - 更名为 filename
  - newFilename - 新增
  - theme - 新增

以下表格列出了两个版本的具体差异。

### 组件事件对比

1.x 不再提供 `before-render` 和 `after-render` 事件。

| 事件名称      | 说明     |
| ------------- | -------- |
| before-render | 不再提供 |
| after-render  | 不再提供 |

### 组件属性对比

| 参数                   | 含义                             | 变更情况                 |
| ---------------------- | -------------------------------- | ------------------------ |
| highlight              | 控制是否高亮代码                 | 1.x 版本移除             |
| language               | 代码语言                         | 无                       |
| old-string             | 旧的字符串                       | 无                       |
| new-string             | 新的字符串                       | 无                       |
| context                | 不同地方上下间隔多少行不隐藏     | 无                       |
| output-format          | 展示方式                         | 无                       |
| diff-style             | 差异风格, 单词级差异或字母级差异 | 无                       |
| drawFileList           | 展示对比文件列表                 | 1.x 版本移除             |
| renderNothingWhenEmpty | 当无对比时不渲染                 | 1.x 版本移除             |
| fileName               | 文件名                           | 1.x 版本更名为 filename  |
| newFilename            | 新文件文件名                     | 1.x 版本新增             |
| isShowNoChange         | 当无对比时展示源代码             | 1.x 变为默认情况，故移除 |
| trim                   | 移除字符串前后空白字符           | 无                       |
| noDiffLineFeed         | 忽视不同系统换行符差异           | 无                       |
| theme                  | 用于切换日间模式/夜间模式        | 1.x 版本新增             |
