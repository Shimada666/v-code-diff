# v-code-diff

[![NPM version](https://img.shields.io/npm/v/v-code-diff.svg?style=flat)](https://www.npmjs.com/package/v-code-diff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/v-code-diff?minimal=true)](https://www.npmjs.com/package/v-code-diff)

> A code diff display plugin, available for Vue2 / Vue3.

<p align='center'>
<b>English</b> | <a href="https://github.com/Shimada666/v-code-diff/blob/master/README-zh.md">简体中文</a>
</p>

Old Version:

0.x version, latest version 0.3.12 (traditional version, improved based
on [vue-code-diff](https://github.com/ddchef/vue-code-diff), is no longer maintained. We will try to align the
functionality of 0.x version in 1.x version and minimize migration cost as much as possible).
This project references the following projects, and I would like to express my gratitude to the original authors!

* [vue-diff](https://github.com/hoiheart/vue-diff)
* [vue-code-diff](https://github.com/ddchef/vue-code-diff)
* Github Code Diff

## Preview

### line-by-line

![line-by-line](doc/vue3-playground-line-by-line.jpg)

### side-by-side

![side-by-side](doc/vue3-playground-side-by-side.jpg)

## Contents

- [Install](#Install)
- [Getting started](#Getting-started)
  - [Vue3](#Vue3)
  - [Vue2](#Vue2)
- [Props](#Props)
- [Extend languages](#extend-languages)
- [Migrate from 0.x version](#Migrate-from-0x-version)
- [Changelog](#Changelog)
- [LICENSE](#licence)

## Install

install `v-code-diff`

```bash
# npm
npm i v-code-diff

# yarn
yarn add v-code-diff

# pnpm
pnpm add v-code-diff
```

Vue2 developers need install composition-api

```shell
pnpm add @vue/composition-api
```

## Getting Started

### Vue3

#### Register globally

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

#### Register locally

Not recommended, but the relevant capabilities are retained to facilitate migration for 0.x users.

### Vue2

#### Register globally

```ts
import Vue from 'vue';
import CodeDiff from 'v-code-diff'

Vue.use(CodeDiff);
```

#### Register locally

Not recommended, but the relevant capabilities are retained to facilitate migration for 0.x users.

## Props

| Prop           | Description                                                                                                                                                             | Type    | Optional Values           | Default Value |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|---------------------------|---------------|
| language       | Code language, such as typescript, defaults to plain text. [View all supported languages](https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md) | string  | -                         | plaintext     |
| oldString      | Old string	                                                                                                                                                             | string  | -                         | -             |
| newString      | New string	                                                                                                                                                             | string  | -                         | -             |
| context        | The number of lines to separate different parts so that they are not hidden                                                                                             | number  | -                         | 10            |
| outputFormat   | Display mode	                                                                                                                                                           | string  | line-by-line，side-by-side | line-by-line  |
| diffStyle      | Difference style, word-level differences or letter-level differences                                                                                                    | string  | word, char                | word          |
| trim           | Remove blank characters at the beginning and end of the string                                                                                                          | boolean | -                         | false         |
| noDiffLineFeed | Don't diff Windows line feed (CRLF) and Linux line feed (LF)                                                                                                            | boolean | -                         | false         |
| maxHeight      | Maximum height of component, for example: 300px                                                                                                                         | string  | -                         | undefined     |
| filename       | Filename                                                                                                                                                                | string  | -                         | undefined     |

## Extend languages

In order to reduce the size of the packaged file, the system only supports the following commonly used languages by
default.

* plaintext
* xml/html
* javascript
* json
* yaml
* python
* java
* bash
* sql

If the language you need is not included, you can manually import the relevant language highlighting module.

```shell
pnpm add highlight.js
```

```typescript
import CodeDiff from 'v-code-diff';
// Extend C language
import c from 'highlight.js/lib/languages/c';

CodeDiff.hljs.registerLanguage('c', c);
```

## Migrate from 0.x version

The v-code-diff 1.x version has features such as reduced packaging size and improved performance compared to the 0.x
version. And we will try to align the functions with the 0.x version as much as possible to reduce your migration cost.

Key points:

* In the 1.x version, language recognition and highlighting will no longer be automatically performed, you need to
  manually specify the language type, such as language="python", if not specified, it will default to plaintext
  and will not be highlighted.
* In the 1.x version, due to the fact that rendering and highlighting are performed at the same time, the component
  events
  have been removed.
* In the 1.x version, the following component properties (Prop) have been changed:
  * highlight - removed
  * drawFileList - removed
  * fileName - rename to "filename"

Below is a detailed comparison of the two versions, you can refer to it to complete the migration.

### The difference of event.

The component events are no longer provided in the 1.x version as rendering and highlighting are carried out
simultaneously.

| Event Name    | Change Status      |
|---------------|--------------------|
| before-render | No longer provided |
| after-render  | No longer provided |

### The difference of prop.

| Prop                   | Description                                                                 | Change Status                                   |
|------------------------|-----------------------------------------------------------------------------|-------------------------------------------------|
| highlight              | Control code highlighting	                                                  | Removed in version 1.x                          |
| language               | Code language                                                               | None                                            |
| oldString              | Old string                                                                  | None                                            |
| newString              | New string	                                                                 | None                                            |
| context                | The number of lines to separate different parts so that they are not hidden | None                                            |
| output-format          | Display mode                                                                | None                                            |
| diffStyle              | Difference style, word-level differences or letter-level differences        | None                                            |
| drawFileList           | Display file comparison list                                                | 	Removed in version 1.x                         | 
| renderNothingWhenEmpty | Do not render when there is no comparison                                   | 	Removed in version 1.x                         | 
| fileName               | File name                                                                   | To be determined, not under development         | 
| isShowNoChange         | Display source code when there is no comparison                             | Removed as it became the default in version 1.x | 
| trim                   | Remove blank characters at the beginning and end of the string              | None                                            | 
| noDiffLineFeed         | Don't diff Windows line feed (CRLF) and Linux line feed (LF)                | None                                            | 

## ChangeLog

### 1.0.0-alpha.0

1. Remove the diff2html dependency and draw the UI by self. By getting rid of the diff2html dependency, many styling
   problems have been resolved.
2. More accurate syntax highlighting and faster highlighting speed.

### 0.3.12

1. Remove prop `syncScroll` due to bug. Synchronized scrolling is now enabled by default

### 0.3.11

1. Add prop `syncScroll` to control whether the horizontal scroll bar needs to be scrolled synchronously

### 0.3.10

1. Fixed type error when exporting

### 0.3.9

1. Make the imported highlight.js style take effect only in `.d2h-wrapper` div

### 0.3.8

1. Style adjustment, hide css `d2h-file-header`, same as vue-code-diff
2. Add prop `noDiffLineFeed`, do not diff windows line feed (CRLF) and linux line feed (LF)

### 0.3.7

1. Fix the problem of displaying "File Without Change..." when isShowNoChange is true and the old and new codes are
   different,
   then show all the source code

### 0.3.6

1. Add prop `language`, make highlighting more accurate

### 0.3.5

1. In the side-by-side mode, support left and right synchronous scrolling

### 0.3.4

1. Add Prop `trim`, it will remove the blank characters before and after the string

### 0.3.3

1. Fixed the problem of highlight failure.

### 0.3.2

1. Fixed the warning for vue2 users in console

### 0.3.1

1. Fix incorrect style when comparing text

### 0.3.0

1. Performance optimization, now rendering has better performance
2. Add Prop `diffStyle` to control whether to display word-level differences or char-level differences

### 0.2.1

1. Use the function of asynchronous rendering of the highlight code, without blocking the ui, greatly improving the page
   rendering speed
2. Add hook function (before rendering, after rendering): `before-render`, `after-render`

### 0.1.0

1. Add prop `highlight` to control whether to highlight the code.

### 0.0.4

1. Fix the problem of abnormal rendering in some browsers (such as safari)

### 0.0.3

1. Prop: `context` default value changed from 5 to 10
2. fix possible line-height conflict(such as `antd.css` in [antd-vue](https://github.com/vueComponent/ant-design-vue))

### 0.0.1

First Version.

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
