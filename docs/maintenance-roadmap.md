# v-code-diff 维护路线与技术规格

> 状态：Draft  
> 目标版本：`1.13.2`、`1.14.0`  
> 最后更新：2026-08-23

## 1. 结论

`v-code-diff` 仍有维护价值，但不应扩张成完整的代码审查平台。项目最有价值的定位是：

- 一个 npm 包同时支持 Vue 2.6、Vue 2.7 和 Vue 3；
- 输入 `oldString` / `newString` 即可渲染 diff；
- 保持 API 简单、体积适中、接入成本低；
- 把安装可靠性、diff 正确性、SSR 安全和中大型文件性能做扎实。

近期不直接投入虚拟滚动，也不复制 `@git-diff-view/vue` 的 core/vue 分包、Git hunk parser、评论挂件和 Worker API。先修复会导致“装错构建、渲染不安全、结果错误或页面不可用”的问题，再依据基准测试决定是否需要虚拟滚动。

## 2. 背景与现状

当前版本为 `1.13.1`。源码使用 `vue-demi`，但发布时分别编译 Vue 2.6、Vue 2.7 和 Vue 3 三套产物，再由 `postinstall` 检测消费者安装的 Vue 版本，将对应文件复制到 `dist` 根目录。

这个设计曾经实现了根入口自动适配，但现在存在结构性风险：

1. pnpm 10/11 等环境可能不执行依赖包的 lifecycle script，根入口可能保留发布机最后一次构建的版本。
2. 安装结果依赖包管理器配置和脚本执行时机，不是静态、可复现的 package 内容。
3. 同一 workspace 如果存在多个 Vue 主版本，`require('vue')` 检测到的版本不一定是实际消费方版本。
4. 包内已经包含三套构建，却没有稳定、公开的版本化子路径可供消费者显式选择。
5. 当前 `main` 指向不存在的 `dist/index.cjs`，实际文件名为 `dist/index.cjs.js`。

已知用户反馈包括：

- [#167 Vue 3 直接引入时加载到 Vue 2.7 产物](https://github.com/Shimada666/v-code-diff/pull/167)
- [#164 最后一行被误判为差异](https://github.com/Shimada666/v-code-diff/issues/164)
- [#109 大文件导致前端内存溢出](https://github.com/Shimada666/v-code-diff/issues/109)
- [#168 15,000 行以上明显卡顿](https://github.com/Shimada666/v-code-diff/issues/168)
- [#96 虚拟滚动与搜索诉求](https://github.com/Shimada666/v-code-diff/issues/96)

## 3. 产品边界

### 3.1 必须保持的能力

- npm 包名保持为 `v-code-diff`，不拆成多个发布包。
- 同一个包覆盖 Vue 2.6、Vue 2.7、Vue 3。
- 保持 `oldString` / `newString` 的直接输入方式。
- 保持 `line-by-line` 和 `side-by-side` 两种展示模式。
- 保持现有 props、`diff` 事件、`stat` slot 和全局安装方式。
- 在 1.x 内不要求现有用户重写组件调用代码。

“一个包”不等于“只能有一个构建文件”。包内可以保留多套静态构建，也可以增加明确的 subpath exports；不可接受的是把 Vue 2 和 Vue 3 拆成不同 npm 包名。

### 3.2 非目标

以下能力不进入本轮 Roadmap：

- 评论、批注、代码审查工作流；
- 编辑器、在线合并、冲突解决；
- React / Solid / Svelte 等多框架支持；
- 完整 Git patch/hunk 数据模型；
- 为极限压缩包体积重写渲染器；
- 在没有基准数据前直接引入 Web Worker 或虚拟滚动；
- 内置全文搜索。

## 4. 成功标准

两个版本完成后，应满足以下结果：

1. Vue 2.6、Vue 2.7、Vue 3 项目都能从同一个 npm 包稳定加载正确产物。
2. 禁止依赖脚本的安装环境仍有确定且文档化的引入路径，不会静默加载错误 Vue 版本。
3. 浏览器渲染与 SSR 输出都不会把输入代码当作 HTML 执行。
4. 最后一行、结尾换行、CRLF、纯新增、纯删除等边界场景有自动化回归覆盖。
5. 页面内多个 `CodeDiff` 实例的导航和文本选择互不影响。
6. 大文件策略有可复现基准；优化目标针对实际瓶颈，而不是凭感觉引入复杂架构。
7. 发布包的 ESM、CJS、类型声明、exports、main/module 字段全部通过消费端 smoke test。

## 5. 架构决策：Vue 多版本发布

### 5.1 不可妥协的约束

- 只发布 `v-code-diff` 一个包。
- 支持 Vue 2.6、Vue 2.7、Vue 3，不删除 Vue 2。
- 不允许未知版本或错误构建悄悄 fallback 到某个默认版本。
- 构建选择必须可测试、可复现。
- 不能把“允许执行 postinstall”作为唯一可用路径。

### 5.2 已确认的技术事实

- Vue 2.6、Vue 2.7、Vue 3 的 SFC 编译产物不同；仅在源码中使用 `vue-demi`，不代表模板编译结果天然通用。
- Node/package.json 的标准 conditional exports 不能根据 peer dependency 的 Vue 版本自动选择文件。
- 当前 postinstall 会修改已安装依赖包内的 `dist/index.*`，因此安装结果依赖 lifecycle script 是否执行。
- 同时静态导入三套构建再在运行时读取 `Vue.version`，可能在模块链接阶段就因不兼容的 Vue exports 失败，不能未经验证直接采用。

### 5.3 Phase 0：发布架构 Spike

正式改入口前，用最小消费项目验证以下方案。Spike 只保留验证代码和结论文档，不把实验性兼容层带入正式实现。

#### 候选 A：真正的单一通用构建

验证能否让模板编译结果只依赖 `vue-demi` 提供的跨版本 API，并由同一份 ESM/CJS 在 Vue 2.6、2.7、3 下运行。

通过条件：

- 三个 Vue 版本均能完成 mount、更新 props、触发 `diff` 事件和 unmount/destroy；
- ESM 与 CJS 均通过；
- 不在包内捆绑 Vue runtime；
- 不通过运行时吞错或弱类型探测来伪装兼容。

若任一条件不成立，淘汰该方案。

#### 候选 B：一个包、多套静态入口

保留三套构建，并公开稳定入口：

```text
v-code-diff/vue2
v-code-diff/vue2.7
v-code-diff/vue3
```

每个入口都必须同时声明 `types`、`import` 和 `require`。禁止 lifecycle script 的环境可显式使用这些入口。

还需验证根入口的长期策略：

- 能否通过主流 bundler 的可靠条件选择正确版本；
- 若不能，1.x 根入口暂时保留兼容行为，但明确标记其适用条件，并把显式子路径作为确定性路径；
- 后续 major 版本才允许重新定义根入口语义，不能在 1.x 静默改变默认 Vue 版本。

#### 候选 C：运行时分发入口

验证一个轻量入口能否在不异步化组件、不同时链接不兼容产物的前提下，根据已安装 Vue 选择实现。

只要出现以下任一情况就淘汰：

- `CodeDiff` 变为异步组件或改变现有 API；
- bundler 把三套完整产物全部打入业务包；
- Vue 2/3 的不兼容 imports 在模块初始化阶段报错；
- SSR 与浏览器选择结果不一致。

### 5.4 决策顺序

1. 优先验证候选 A，因为它能从根本上删除安装期改包。
2. A 不成立时，采用候选 B，先提供稳定显式入口，再处理根入口兼容。
3. 仅在静态消费测试证明可行时采用候选 C。
4. 不论最终方案为何，发布包内不得把某次本地 `vue-demi-switch` 的残留结果当作隐式默认值。

Spike 的结论应写入本文件，并记录：采用方案、淘汰方案、复现命令、产物大小、兼容矩阵结果。

## 6. `1.13.2`：可靠性止血版本

### 6.1 包入口与安装可靠性

目标：任何成功引入都必须加载与消费项目匹配的 Vue 构建。

工作项：

- 完成第 5 节的架构 Spike，并按结论实现。
- 修正 `main` 为实际存在的 CJS 文件。
- 为所有公开入口补齐 `types` / `import` / `require` exports。
- 使用打包后的 tarball，而不是仓库源码，执行全部消费端测试。
- 检查 tarball 只包含运行时需要的源码、脚本、类型和构建产物。
- 如果 1.x 仍临时保留 postinstall：
  - 使用 `node:fs`、`node:path`；
  - 不吞掉文件操作异常；
  - 不捕获模块加载异常并返回 `undefined`；
  - 未检测到受支持 Vue 时明确失败，而不是留下未知根入口；
  - 文档分别说明 npm、Yarn、pnpm 10、pnpm 11 的行为；
  - 把删除 postinstall 作为后续明确任务，而不是永久方案。

验收标准：

- Vue 2.6、2.7、3 消费项目均能渲染组件。
- ESM named import、ESM default install、CJS require 均通过。
- lifecycle scripts 允许和禁止两种安装模式都有确定结果。
- Webpack 与 Vite 至少各有一个 smoke case，覆盖 #167。
- 不存在“安装成功但实际加载了另一 Vue 主版本产物”的情况。

### 6.2 SSR 与 HTML 安全

目标：`oldString` 和 `newString` 始终被视为不可信纯文本。

当前风险：无 `document` 时 `getHighlightCode()` 返回原始字符串，后续由 `v-html` 渲染。输入中的 `<script>`、事件属性或普通 HTML 标签不应进入可执行 HTML。

工作项：

- 增加统一的 HTML escape 实现，至少覆盖 `& < > " '`。
- SSR/无 DOM 路径返回 escape 后的文本。
- 浏览器高亮路径继续只接受 highlight.js 生成的标记和项目生成的行内差异标记。
- 删除基于固定字符串 `<code-diff-modified>` / `</code-diff-modified>` 的可碰撞协议，改用不会与用户输入混淆的 token/segment 数据结构。
- 不使用 sanitizer 失败后回退原字符串的方式。

验收标准：

- 浏览器与 SSR 对相同输入呈现相同的可见代码文本。
- `<img onerror=...>`、`<script>`、HTML entity、用户输入中的旧 marker 字符串均不会被执行或破坏 diff。
- 语法高亮和 word/char 级行内差异仍可同时显示。

### 6.3 多实例隔离

目标：同一页面内的多个组件完全独立。

工作项：

- 在组件根节点持有 ref，导航查询只在当前实例根节点内进行。
- 导航目标按“change block”定义，既覆盖新增也覆盖删除，不只查询 `.blob-code-addition`。
- split view 的左右文本选择控制只作用于当前实例。
- props 变化导致 diff 重算时重置或校正当前导航索引。

验收标准：

- 页面放置两个以上实例，任一实例的上下一个差异按钮不会滚动或改色另一个实例。
- 在一个 split view 中选择左/右文本，不改变另一个实例的 `no-select` 状态。
- 纯删除 diff 也可以使用导航按钮。

### 6.4 依赖、元数据与文档

工作项：

- 将 `diff` 升级到包含已知修复的安全版本，并更新 lockfile。
- 修正 package description，使其说明产品用途和 Vue 2/3 支持。
- 修复现有 lint 错误，不扩大无关格式化范围。
- 更新中英文 README 的安装说明，删除只适用于旧 pnpm 的配置。
- 统一 README 中 `diff` 事件的描述和示例。
- 增加兼容矩阵、SSR 说明、显式入口说明和大文件建议。
- 添加 changelog/release notes，明确 1.13.2 不包含虚拟滚动。

验收标准：

- `pnpm lint`、`pnpm build` 通过。
- `pnpm pack --dry-run` 文件清单符合预期。
- README 中所有入口与实际 package exports 一致。

## 7. `1.14.0`：正确性与大文件性能

### 7.1 建立纯函数 diff 核心测试

先锁定 `createUnifiedDiff`、`createSplitDiff` 的行为，再改性能结构。测试数据至少覆盖：

- 两边都是空字符串；
- 单行相同、单行修改；
- 纯新增、纯删除；
- 多行删除后新增，左右行数相等和不相等；
- 文件末尾有/无换行；
- LF、CRLF，以及 `noDiffLineFeed` 开关；
- 空白行、仅空白变化、`trim`；
- `ignoreMatchingLines` 命中和不命中；
- `word` / `char` 行内差异；
- `forceInlineComparison`；
- context 为 0、默认值、超过文件长度；
- 输入包含 HTML、entity 和内部 marker 文本；
- unified/split 的行号、统计数和 change 类型一致。

对 #164 先补最小复现 fixture，再修改算法。不能用针对截图或某个字符串的条件分支修补。

### 7.2 性能基线

优化前先建立可重复 benchmark，输入规模至少为：

| 数据集 | 行数 | 变化分布 |
| --- | ---: | --- |
| small | 1,000 | 1%、10% |
| medium | 5,000 | 集中变化、分散变化 |
| large | 15,000 | 1%、10%、纯替换 |
| stress | 30,000 | 少量变化 |

每组分别测 `plaintext` 和一种常用高亮语言，记录：

- diff 计算耗时；
- 行内 word/char diff 耗时；
- syntax highlight 耗时；
- Vue mount 到可交互耗时；
- 渲染 DOM 节点数；
- Chrome 峰值内存。

基准机器、浏览器版本、Node 版本和运行命令必须记录。CI 只做宽松回归门槛，精细数值由本地固定环境记录，避免把共享 runner 抖动当成性能退化。

### 7.3 第一阶段优化：少做无用工作

当前实现会先对所有行执行高亮，再把大量 context 外的行标记为隐藏；即使 DOM 不展示，这部分 CPU 和内存已经消耗。

按以下顺序优化：

1. 先完成行级 diff、行号和 fold 区间计算。
2. 只为当前需要展示的行生成 syntax highlight HTML。
3. 展开折叠区时，再为新展示行生成高亮结果。
4. 避免 split view 对相同 unchanged 行重复高亮。
5. 缓存以 `language + raw line + inline segments` 为 key 的结果；缓存必须有实例生命周期或大小上限，不能无限增长。
6. props 变化时只保留仍然有效的缓存，不保留整份旧 diff 树。

验收标准：

- 默认 context 下，隐藏的 unchanged 行不会在首屏逐行执行 highlight.js。
- 展开后显示内容与一次性完整高亮一致。
- 15,000 行、少量变化的数据集相较 1.13.2 有明确、记录在案的耗时和内存下降。

### 7.4 第二阶段优化：大文件降级策略

如果第一阶段仍不能让 15,000 行数据稳定可用，再增加显式且可预期的降级策略：

- 支持关闭 syntax highlight，但保留 diff 着色和行内差异；
- 根据 benchmark 确定自动降级阈值，不在实现前拍脑袋写死行数；
- 自动降级时通过事件或 header 状态告知调用方，不静默改变结果；
- 降级只影响高亮细节，不影响行号、统计、折叠与 diff 正确性。

如果需要新增公开 API，优先考虑：

```ts
highlight?: boolean | 'auto'
```

默认值和阈值必须在 benchmark 后确定。没有实际需求前不增加多个微调参数。

### 7.5 虚拟滚动决策门槛

只有同时满足以下条件，才进入虚拟滚动设计：

- 第一、二阶段完成后，15,000 行目标仍无法达到；
- profile 证明主要瓶颈仍是可见 DOM 数量，而不是 diff 算法或 highlight.js；
- unified 与 split 的动态行高、折叠展开、滚动定位和文本选择已有可验证设计；
- 能在 Vue 2.6、2.7、3 共用实现，或维护成本可接受。

虚拟滚动如果启动，应作为独立 minor 版本，不与 diff 算法修复混在同一个 PR。

## 8. 测试与 CI 矩阵

### 8.1 单元与组件测试

- 纯函数测试：diff 分段、行号、统计、fold、escape、行内 segment。
- 组件测试：props 更新、事件、slot、导航、多实例、展开折叠。
- SSR 测试：renderToString 不依赖 `document`，输出安全。

测试框架选择以 Vue 2/3 可共用和维护成本最低为原则；不要为了追求统一而引入大规模自建适配层。

### 8.2 发布包消费测试

测试对象必须由 `pnpm pack` 生成的 tarball 安装，不能通过 workspace link 代替。

最低矩阵：

| Vue | 运行时要求 | 入口 |
| --- | --- | --- |
| 2.6.x | `@vue/composition-api` | root + Vue 2 显式入口 |
| 2.7.x | 内置 Composition API | root + Vue 2.7 显式入口 |
| 3.x 最低支持版本 | Vue 3 | root + Vue 3 显式入口 |
| 3.x 当前稳定版本 | Vue 3 | root + Vue 3 显式入口 |

安装/构建覆盖：

- npm 当前受支持版本；
- pnpm 10；
- pnpm 11；
- lifecycle scripts 启用与禁用；
- Vite ESM；
- Webpack ESM；
- Node CJS require；
- SSR render。

Yarn 在本地 release checklist 做 smoke test；如果社区出现 Yarn 回归，再提升为常驻 CI job，避免矩阵无边界增长。

### 8.3 CI 失败原则

- 未知 Vue 版本、缺失 peer、错误入口必须 fail hard。
- 测试不得通过捕获所有异常后返回默认组件。
- 不设置“某矩阵失败但允许继续”的长期 job。

## 9. API 兼容策略

### 9.1 1.x 内允许的变化

- 增加可选 prop、事件或 package subpath。
- 修复明显错误的统计、行号、换行和安全行为。
- 对大文件增加有提示的高亮降级。

### 9.2 1.x 内不允许的变化

- 删除或重命名现有 props、事件、slot。
- 改变 `oldString` / `newString` 主输入模型。
- 将同步可用的组件改为异步组件。
- 把 Vue 2 支持移出当前包。
- 静默把根入口固定成某一个 Vue 主版本。

## 10. 实施拆分

每一项建议独立 PR，方便回滚和定位回归。

### Milestone A：`1.13.2`

1. `packaging: validate Vue 2/2.7/3 entry architecture`
2. `packaging: publish deterministic exports and fix metadata`
3. `security: escape SSR and remove inline marker collision`
4. `fix: scope navigation and selection per component instance`
5. `ci: test packed artifact across Vue and package managers`
6. `chore: update diff dependency and clear lint baseline`
7. `docs: rewrite installation and compatibility guidance`
8. `release: publish 1.13.2 and verify npm tarball`

### Milestone B：`1.14.0`

1. `test: lock diff correctness fixtures`
2. `fix: final newline and line pairing edge cases`
3. `perf: add repeatable large-file benchmark`
4. `perf: defer highlighting for folded lines`
5. `perf: bound highlight cache and avoid duplicate work`
6. `perf: add explicit large-file highlight degradation if needed`
7. `docs: publish performance characteristics and limits`
8. `release: publish 1.14.0 and compare benchmark results`

### Backlog：基于数据决定

- 虚拟滚动；
- 内置搜索；
- Web Worker；
- Git patch/hunk 输入适配器。

这些任务不能仅因已有 Issue 就自动进入版本；必须满足本 spec 中的进入门槛。

## 11. 发布与回滚

### 11.1 发布前

- CI 全绿。
- `pnpm lint` 和 `pnpm build` 通过。
- 从干净目录安装 tarball，验证所有公开入口。
- 比较 tarball 文件清单和构建体积。
- 中英文 README 与 release notes 已更新。
- npm 发布前确认 tag、版本号、commit 一致。

### 11.2 发布后

- 从 npm registry 安装真实发布版本，不只验证本地 tarball。
- 验证 Vue 2.6、2.7、3 最小示例。
- 检查 npm 页面入口和类型声明。
- 在 #167、#164、#109、#168 对应 Issue/PR 回填验证结果。

### 11.3 回滚原则

- 包入口回归：立即 deprecate 问题版本并发布 patch，不通过 README 解释代替修复。
- diff 正确性回归：回滚对应算法 PR，保留失败 fixture。
- 性能回归：关闭新优化路径或回滚单独 PR，不影响安全与安装修复。

## 12. Definition of Done

一个 Roadmap 项目只有在以下条件全部满足时才算完成：

- 实现与本 spec 的目标和非目标一致；
- 对应自动化测试已加入且能在修复前复现问题；
- 受影响的 Vue 版本和构建工具矩阵已通过；
- 没有吞异常、兼容 fallback 或未知状态默认值；
- 用户文档与实际行为一致；
- PR 描述包含验证命令、结果和兼容性影响；
- 发布后使用 registry 包完成一次独立 smoke test。

## 13. 待确认事项

以下问题由 Spike/benchmark 回答，不在实现前主观决定：

1. 单一通用构建是否真的能覆盖三代 Vue 编译产物？
2. 如果不能，根入口在 1.x 中能否在无 postinstall 时可靠自动选择？
3. Vue 3 的最低支持版本是否继续保持 `>=3.0.0`，还是下一个 major 收紧范围？
4. 15,000 行的主要瓶颈分别来自 diff、行内比较、highlight 还是 DOM？
5. 自动关闭 syntax highlight 的合理阈值是什么？
6. 第一阶段优化后是否仍有引入虚拟滚动的必要？

在这些问题有测量结果前，不新增架构复杂度。
