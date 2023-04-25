# v-code-diff

[![NPM version](https://img.shields.io/npm/v/v-code-diff.svg?style=flat)](https://www.npmjs.com/package/v-code-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/v-code-diff?minimal=true)](https://www.npmjs.com/package/v-code-diff)

> Vue2 / Vue3 可用的 code diff 插件

<p align='center'>
<a href="https://github.com/Shimada666/v-code-diff/blob/master/README.md">English</a> | <b>简体中文</b>
</p>

旧版本：

* 0.x 版本, 最新版本 0.3.12 (传统版本，基于 [vue-code-diff](https://github.com/ddchef/vue-code-diff) 进行改进，目前不再进行维护，我们会在
  1.x 版本尽量对齐 0.x 版本功能，尽量降低迁移成本)

本项目参考了以下项目，在此对原作者表示感谢！

* [vue-diff](https://github.com/hoiheart/vue-diff)
* [vue-code-diff](https://github.com/ddchef/vue-code-diff)
* Github Code Diff

## 效果展示

### line-by-line

![line-by-line](doc/vue3-playground-line-by-line.jpg)

### side-by-side

![side-by-side](doc/vue3-playground-side-by-side.jpg)

## 目录

- [安装](#安装)
- [开始使用](#开始使用)
  - [Vue3](#Vue3)
  - [Vue2](#Vue2)
- [组件属性](#组件属性)
- [拓展高亮语言](#拓展高亮语言)
- [从 0.x 版本迁移](#从-0x-版本迁移)
- [变更记录](#变更记录)
- [LICENSE](#licence)

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
import {createApp} from 'vue'
import CodeDiff from 'v-code-diff'

app
  .use(CodeDiff)
  .mount('#app')
```

然后

```vue

<template>
  <code-diff
    :old-string="'12345'"
    :new-string="'3456'"
    output-format="side-by-side"/>
</template>
```

#### 单独引入

不推荐，但保留相关能力，方便 0.x 用户迁移

### Vue2

#### 注册为全局组件

```ts
import Vue from 'vue';
import CodeDiff from 'v-code-diff'

Vue.use(CodeDiff);
```

#### 单独引入

不推荐，但保留相关能力，方便 0.x 用户迁移

## 组件属性

| 参数             | 说明                                                                                                                 | 类型      | 可选值                       | 默认值          |
|----------------|--------------------------------------------------------------------------------------------------------------------|---------|---------------------------|--------------|
| language       | 代码语言，如`typescript`，默认纯文本。 [查看全部支持语言](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md) | string  | -                         | plaintext    |
| oldString      | 旧的字符串                                                                                                              | string  | -                         | -            |
| newString      | 新的字符串                                                                                                              | string  | -                         | -            |
| context        | 不同地方上下间隔多少行不隐藏                                                                                                     | number  | -                         | 10           |
| outputFormat   | 展示方式                                                                                                               | string  | line-by-line，side-by-side | line-by-line |
| diffStyle      | 差异风格, 单词级差异或字母级差异                                                                                                  | string  | word, char                | word         |
| trim           | 移除字符串前后空白字符                                                                                                        | boolean | -                         | false        |
| noDiffLineFeed | 不 diff windows 换行符(CRLF)与 linux 换行符(LF)                                                                            | boolean | -                         | false        |
| maxHeight      | 组件最大高度，例如 300px                                                                                                    | number  | -                         | undefined    |
| filename       | 文件名                                                                                                                | string  | -                         | undefined    |

## 拓展高亮语言

为了减小打包后的体积，系统默认仅支持以下常用语言

* plaintext
* xml/html
* javascript
* json
* yaml
* python
* java
* bash
* sql

如果您需要的语言不在其中，可以手动引入相关的语言高亮模块

```shell
pnpm add highlight.js
```

```typescript
import CodeDiff from 'v-code-diff';
// Extend C language
import c from 'highlight.js/lib/languages/c';

CodeDiff.hljs.registerLanguage('c', c);
```

## 从 0.x 版本迁移

v-code-diff 的 1.x 版本相较于 0.x 版本，具有打包体积减小、性能提升等特性。并且我们会在功能上尽量对齐 0.x 版本，降低您的迁移成本。

重点：

* 1.x 版本中，不再会自动识别语言并高亮，您需要手动指定语言类型，如 `language="python"`，若不指定则默认为纯文本`plaintext`
  ，不会进行高亮。
* 1.x 版本中，由于渲染和高亮是同时进行，因此移除了组件事件
* 1.x 版本中，以下组件属性(Prop)有变动
  * highlight - 移除
  * drawFileList - 移除
  * fileName - 更名为 filename

以下是两个版本具体的差异点，您可以参照阅读完成迁移。

### 组件事件对比

1.x 版本中，由于渲染与高亮是同时进行，因此不再提供组件事件

| 事件名称          | 说明   |
|---------------|------|
| before-render | 不再提供 |
| after-render  | 不再提供 |

### 组件属性对比

| 参数                     | 含义                | 变更情况               |
|------------------------|-------------------|--------------------|
| highlight              | 控制是否高亮代码          | 1.x 版本移除           |
| language               | 代码语言              | 无                  |
| old-string             | 旧的字符串             | 无                  |
| new-string             | 新的字符串             | 无                  |
| context                | 不同地方上下间隔多少行不隐藏    | 无                  |
| output-format          | 展示方式              | 无                  |
| diff-style             | 差异风格, 单词级差异或字母级差异 | 无                  |
| drawFileList           | 展示对比文件列表          | 1.x 版本移除           | 
| renderNothingWhenEmpty | 当无对比时不渲染          | 1.x 版本移除           | 
| fileName               | 文件名               | 1.x 版本更名为 filename | 
| isShowNoChange         | 当无对比时展示源代码        | 1.x 变为默认情况，故移除     | 
| trim                   | 移除字符串前后空白字符       | 无                  | 
| noDiffLineFeed         | 忽视不同系统换行符差异       | 无                  | 

## 变更记录

### 1.0.0

重构后第一版

1. 移除 diff2html 依赖，自行绘制 ui。由于摆脱了 diff2html 依赖，解决了之前很多样式问题
2. 更准确的语法高亮，更快的高亮速度

### 0.3.12

1. 撤销 prop `syncScroll` 因为有 bug。现在默认开启同步滚动

### 0.3.11

1. 增加 prop `syncScroll` 用于控制横向滚动条是否同步滚动

### 0.3.10

1. 修复了导出时的类型错误

### 0.3.9

1. 调整 css，让引入的 highlight.js 的样式只在 .d2h-wrapper 内生效

### 0.3.8

1. 样式调整，隐藏 css `d2h-file-header`，对齐 vue-code-diff
2. 添加 prop `noDiffLineFeed`，不 diff windows 换行符(CRLF)与 linux 换行符(LF)

### 0.3.7

1. 修复当 isShowNoChange 为 true 时，而新旧代码不同时仍展示 “File Without Change” 的问题。然后展示全部源代码

### 0.3.6

1. 添加 prop `language`，能让高亮更准确

### 0.3.5

1. side-by-side 模式中，支持左右同步滚动

### 0.3.4

1. 增加 Prop `trim`, 可以移除字符串前后空白字符

### 0.3.3

1. 修复了 highlight 失效的问题

### 0.3.2

1. 修复了 vue2 用户的控制台警告

### 0.3.1

1. 修复了 diff 时样式显示 bug

### 0.3.0

1. 性能优化，现在渲染拥有更好的性能
2. 添加 Prop `diffStyle` 来控制是否显示单词级差异还是字母级差异

### 0.2.1

1. 使用异步渲染高亮代码的功能，不阻塞 ui，极大提升页面渲染速度
2. 增加钩子函数(渲染前，渲染后): `before-render`, `after-render`

### 0.1.0

1. 添加 Prop `highlight` 来控制是否高亮代码

### 0.0.4

1. 修复一些浏览器下渲染异常的问题（例如 safari）

### 0.0.3

1. Prop: `context` 默认值由 5 改为 10
2. 修复可能存在的 line-height 冲突 (如 [antd-vue](https://github.com/vueComponent/ant-design-vue) 的 `antd.css` )

### 0.0.1

第一个版本.

## LICENCE

MIT License

Copyright (c) 2021 Shimada666

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
