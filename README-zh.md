# v-code-diff

[![NPM version](https://img.shields.io/npm/v/v-code-diff.svg?style=flat)](https://www.npmjs.com/package/v-code-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/v-code-diff?minimal=true)](https://www.npmjs.com/package/v-code-diff)

> Vue2 / Vue3 可用的 code diff 插件

<p align='center'>
<a href="https://github.com/Shimada666/v-code-diff/blob/master/README.md">English</a> | <b>简体中文</b>
</p>

旧版本：

- 0.x 版本, 最新版本 0.3.12 (传统版本，基于 [vue-code-diff](https://github.com/ddchef/vue-code-diff) 进行改进，目前不再进行维护，我们会在
  1.x 版本尽量对齐 0.x 版本功能，尽量降低迁移成本)

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
- [拓展高亮语言](#拓展高亮语言)
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

Vue2.6 及以下用户需要额外安装 composition-api

```shell
pnpm add @vue/composition-api
```

## 开始使用

### Vue3

#### 注册为全局组件

```ts
import { createApp } from "vue";
import CodeDiff from "v-code-diff";

app.use(CodeDiff).mount("#app");
```

然后

```vue
<template>
  <code-diff
    old-string="12345"
    new-string="3456"
    output-format="side-by-side"
  />
</template>
```

#### 单独引入

不推荐，但保留相关能力，方便 0.x 用户迁移

### Vue2

#### 注册为全局组件

```ts
import Vue from "vue";
import CodeDiff from "v-code-diff";

Vue.use(CodeDiff);
```

#### 单独引入

不推荐，但保留相关能力，方便 0.x 用户迁移

## Demo

|        | npm | cdn                                                                            |
| ------ | --- | ------------------------------------------------------------------------------ |
| vue2   |     | [vue2-cdn](https://stackblitz.com/edit/v-code-diff-vue2-cdn?file=index.html)   |
| vue2.7 |     | [vue27-cdn](https://stackblitz.com/edit/v-code-diff-vue27-cdn?file=index.html) |
| vue3   |     | [vue3-cdn](https://stackblitz.com/edit/v-code-diff-vue3-cdn?file=index.html)   |

## 组件属性

| 参数           | 说明                                                                                                                                    | 类型      | 可选值                     | 默认值       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------- | ------------ |
| language       | 代码语言，如`typescript`，默认纯文本。 [查看全部支持语言](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md) | string    | -                          | plaintext    |
| oldString      | 旧的字符串                                                                                                                              | string    | -                          | -            |
| newString      | 新的字符串                                                                                                                              | string    | -                          | -            |
| context        | 不同地方上下间隔多少行不隐藏                                                                                                            | number    | -                          | 10           |
| outputFormat   | 展示方式                                                                                                                                | string    | line-by-line，side-by-side | line-by-line |
| diffStyle      | 差异风格, 单词级差异或字母级差异                                                                                                        | string    | word, char                 | word         |
| trim           | 移除字符串前后空白字符                                                                                                                  | boolean   | -                          | false        |
| noDiffLineFeed | 不 diff windows 换行符(CRLF)与 linux 换行符(LF)                                                                                         | boolean   | -                          | false        |
| maxHeight      | 组件最大高度，例如 300px                                                                                                                | string    | -                          | undefined    |
| filename       | 文件名                                                                                                                                  | string    | -                          | undefined    |
| newFilename    | 新文件文件名                                                                                                                   | string    | -                          | undefined    |
| theme          | 用于切换日间模式/夜间模式                                                                                                               | ThemeType | light , dark               | 'light'      |

## 组件事件

| Name | Description     | Type                                                                            |
| ---- | --------------- | ------------------------------------------------------------------------------- |
| diff | diff 完成后触发 | (result: {stat: { isChanged: boolean, addNum: number, delNum: number}}) => void |

## 拓展高亮语言

为了减小打包后的体积，系统默认仅支持以下常用语言

- plaintext
- xml/html
- javascript
- json
- yaml
- python
- java
- bash
- sql

如果您需要的语言不在其中，可以手动引入相关的语言高亮模块

```shell
pnpm add highlight.js
```

```typescript
import CodeDiff from "v-code-diff";
// Extend C language
import c from "highlight.js/lib/languages/c";

CodeDiff.hljs.registerLanguage("c", c);
```

## 从 0.x 版本迁移

v-code-diff 的 1.x 版本相较于 0.x 版本，具有打包体积减小、性能提升等特性。并且我们会在功能上尽量对齐 0.x 版本，降低您的迁移成本。

重点：

- 1.x 版本中，不再会自动识别语言并高亮，您需要手动指定语言类型，如 `language="python"`，若不指定则默认为纯文本`plaintext`
  ，不会进行高亮。
- 1.x 版本中，由于渲染和高亮是同时进行，因此移除了组件事件
- 1.x 版本中，以下组件属性(Prop)有变动
  - highlight - 移除
  - drawFileList - 移除
  - fileName - 更名为 filename
  - newFilename - 新增
  - theme - 新增

以下是两个版本具体的差异点，您可以参照阅读完成迁移。

### 组件事件对比

1.x 版本中，由于渲染与高亮是同时进行，因此不再提供组件事件

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
