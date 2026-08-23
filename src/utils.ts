import * as Diff from 'diff'
import type { Change } from 'diff'
import { DIFF_DELETE, DIFF_INSERT, diff_match_patch as DiffMatchPatch } from 'diff-match-patch'
import hljs from './highlight'
import { DiffType } from './types'
import type { DiffLine, DiffStat, SplitLineChange, SplitLineUnchanges, SplitViewerChange, UnifiedLineChange, UnifiedLineUnchanges, UnifiedViewerChange } from './types'

const MODIFIED_START_TAG = '<code-diff-modified>'
const MODIFIED_CLOSE_TAG = '</code-diff-modified>'
const MAX_INLINE_DIFF_LENGTH = 10_000
export const RENDER_BATCH_SIZE = 1_000

const startEntity = MODIFIED_START_TAG.replace('<', '&lt;').replace('>', '&gt;')
const closeEntity = MODIFIED_CLOSE_TAG.replace('<', '&lt;').replace('>', '&gt;')

function escapeHtml(code: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  }
  return code.replace(/[&<>"']/g, char => entities[char])
}

function lineType(diff: Diff.Change): DiffType {
  if (diff === undefined)
    return DiffType.EQUAL
  if (diff.added)
    return DiffType.ADD
  if (diff.removed)
    return DiffType.DELETE
  return DiffType.EQUAL
}

function renderChangedLines(prev?: string, current?: string, diffStyle = 'word', force = false): [string | undefined, string | undefined] {
  if (typeof prev === 'undefined' || typeof current === 'undefined')
    return [prev, current]
  if (!force && prev.length + current.length > MAX_INLINE_DIFF_LENGTH)
    return [prev, current]

  type RenderFunctionType = (prev: string, old: string) => Change[]
  const func: RenderFunctionType = diffStyle === 'char' ? Diff.diffChars : Diff.diffWords
  const changes = func(prev, current)
  const oldLine = changes
    .filter(word => lineType(word) !== DiffType.ADD)
    .map(word =>
      lineType(word) === DiffType.DELETE ? `${MODIFIED_START_TAG}${word.value}${MODIFIED_CLOSE_TAG}` : word.value,
    )
    .join('')
  const newLine = changes
    .filter(word => lineType(word) !== DiffType.DELETE)
    .map(word =>
      lineType(word) === DiffType.ADD ? `${MODIFIED_START_TAG}${word.value}${MODIFIED_CLOSE_TAG}` : word.value,
    )
    .join('')
  return [oldLine, newLine]
}

function diffLines(prev: string, current: string) {
  if (prev === current) {
    return prev
      ? [{ count: prev.replace(/\n$/, '').split('\n').length, value: prev }]
      : []
  }

  const prevHasFinalNewline = prev.endsWith('\n')
  const currentHasFinalNewline = current.endsWith('\n')
  if (prevHasFinalNewline !== currentHasFinalNewline) {
    if (prevHasFinalNewline)
      prev = prev.slice(0, -1)
    else
      current = current.slice(0, -1)
  }

  if (prev)
    prev += '\n'
  if (current)
    current += '\n'

  let changes: Diff.Change[] | undefined
  if (prev.length + current.length >= 100_000 && prev.includes('\n') && current.includes('\n')) {
    const prevLines = prev ? prev.replace(/\n$/, '').split('\n') : []
    const currentLines = current ? current.replace(/\n$/, '').split('\n') : []
    const prevLineSet = new Set(prevLines)
    const currentLineSet = new Set(currentLines)
    const [smallerSet, largerSet] = prevLineSet.size < currentLineSet.size
      ? [prevLineSet, currentLineSet]
      : [currentLineSet, prevLineSet]
    let sharedLines = 0
    for (const line of smallerSet) {
      if (largerSet.has(line))
        sharedLines++
    }
    const overlap = smallerSet.size ? sharedLines / smallerSet.size : 0
    const exceedsDmpLineLimit = prevLineSet.size >= 40_000 || prevLineSet.size + currentLineSet.size - sharedLines >= 65_535
    const changedUniqueLines = prevLineSet.size + currentLineSet.size - sharedLines * 2

    if (overlap < 0.01 || (exceedsDmpLineLimit && changedUniqueLines > 200)) {
      // ponytail: complex large inputs use whole-file replacements; revisit if detailed move detection becomes necessary.
      changes = []
      if (prev)
        changes.push({ count: prevLines.length, value: prev, removed: true })
      if (current)
        changes.push({ count: currentLines.length, value: current, added: true })
    }
    else if (exceedsDmpLineLimit) {
      changes = Diff.diffLines(prev, current)
    }
  }

  if (!changes) {
    const dmp = new DiffMatchPatch()
    const a = dmp.diff_linesToChars_(prev, current)
    const linePrev = a.chars1
    const lineCurrent = a.chars2
    const lineArray = a.lineArray
    const diffs: any[] = dmp.diff_main(linePrev, lineCurrent, false)
    dmp.diff_charsToLines_(diffs, lineArray)
    changes = diffs.map((x) => {
      const [type, text] = x
      const count = text.replace(/\n$/, '').split('\n').length
      const change: Diff.Change = {
        count,
        value: text,
        removed: type === DIFF_DELETE,
        added: type === DIFF_INSERT,
      }
      return change
    })
  }

  if (prevHasFinalNewline !== currentHasFinalNewline) {
    changes.push({
      count: 1,
      value: '',
      removed: prevHasFinalNewline,
      added: currentHasFinalNewline,
    })
  }

  return changes
}

function getHighlightCode(language: string, code: string) {
  if (typeof document === 'undefined' || language === 'plaintext') {
    return escapeHtml(code)
      .replace(new RegExp(startEntity, 'g'), '<span class="x">')
      .replace(new RegExp(closeEntity, 'g'), '</span>')
  }

  const hasModifiedTags = code.match(new RegExp(`(${MODIFIED_START_TAG}|${MODIFIED_CLOSE_TAG})`, 'g'))

  if (!hasModifiedTags)
    return hljs.highlight(code, { language }).value

  /**
   * Explore highlight DOM extracted from pure code and compare the text with the original code to generate the highlight code
   */
  let originalCode = code // original code with modified tags
  const pureCode = code.replace(new RegExp(`(${MODIFIED_START_TAG}|${MODIFIED_CLOSE_TAG})`, 'g'), '') // Without modified tags
  const pureElement = document.createElement('div')
  pureElement.innerHTML = hljs.highlight(pureCode, { language }).value // Highlight DOM without modified tags

  // Modified span is created per highlight operator and causes it to continue
  let innerModifiedTag = false

  const diffElements = (node: HTMLElement) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE)
        diffElements(child as HTMLElement)

      // Compare text nodes and check changed text
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent)
          return

        let oldContent = child.textContent
        let newContent = ''

        if (innerModifiedTag) {
          // If it continues within the modified range
          newContent = newContent + MODIFIED_START_TAG
        }

        while (oldContent.length) {
          if (originalCode.startsWith(MODIFIED_START_TAG)) {
            // Add modified start tag
            originalCode = originalCode.slice(MODIFIED_START_TAG.length)
            newContent = newContent + MODIFIED_START_TAG
            innerModifiedTag = true // Start modified
            continue
          }
          if (originalCode.startsWith(MODIFIED_CLOSE_TAG)) {
            // Add modified close tag
            originalCode = originalCode.slice(MODIFIED_CLOSE_TAG.length)
            newContent = newContent + MODIFIED_CLOSE_TAG
            innerModifiedTag = false // End modified
            continue
          }

          // Add words before modified tag
          const hasModifiedTag = originalCode.match(new RegExp(`(${MODIFIED_START_TAG}|${MODIFIED_CLOSE_TAG})`))
          const originalCodeDiffLength = (hasModifiedTag && hasModifiedTag.index) ? hasModifiedTag.index : originalCode.length
          const nextDiffsLength = Math.min(originalCodeDiffLength, oldContent.length)

          newContent = newContent + originalCode.substring(0, nextDiffsLength)
          originalCode = originalCode.slice(nextDiffsLength)
          oldContent = oldContent.slice(nextDiffsLength)
        }

        if (innerModifiedTag) {
          // If the loop is finished without a modified close, it is still within the modified range.
          newContent = newContent + MODIFIED_CLOSE_TAG
        }

        child.textContent = newContent // put as entity code because change textContent
      }
    })
  }
  diffElements(pureElement)

  return pureElement.innerHTML
    .replace(new RegExp(startEntity, 'g'), '<span class="x">')
    .replace(new RegExp(closeEntity, 'g'), '</span>')
}

export function highlightUnifiedLine(line: UnifiedLineChange, language: string) {
  if (line.highlighted)
    return
  line.code = getHighlightCode(language, line.code)
  line.highlighted = true
}

export function highlightSplitLine(line: SplitLineChange, language: string) {
  if (line.highlighted)
    return
  const leftCode = line.left.code
  if (leftCode !== undefined)
    line.left.code = getHighlightCode(language, leftCode)

  if (line.right.code !== undefined) {
    line.right.code = line.left.type === DiffType.EQUAL && line.right.type === DiffType.EQUAL && line.right.code === leftCode
      ? line.left.code
      : getHighlightCode(language, line.right.code)
  }
  line.highlighted = true
}

function calcDiffStat(changes: Change[], ignoreRegex?: RegExp): DiffStat {
  const count = (s: string, c: string) => (s.match(new RegExp(c, 'g')) || []).length
  const ignoreCount = (lines: string[]) => lines.filter(line => ignoreRegex?.test(line)).length

  let additionsNum = 0
  let deletionsNum = 0
  let ignoreAdditionsNum = 0
  let ignoreDeletionsNum = 0
  for (const change of changes) {
    if (change.added) {
      if (!ignoreRegex) {
        additionsNum += change.count ?? 0
        continue
      }
      const ignoreNum = ignoreCount(change.value.trim().split('\n'))
      additionsNum += count(change.value.trim(), '\n') + 1 - ignoreNum
      ignoreAdditionsNum += ignoreNum
      continue
    }
    if (change.removed) {
      if (!ignoreRegex) {
        deletionsNum += change.count ?? 0
        continue
      }
      const ignoreNum = ignoreCount(change.value.trim().split('\n'))
      deletionsNum += count(change.value.trim(), '\n') + 1 - ignoreNum
      ignoreDeletionsNum += ignoreNum
      continue
    }
  }
  return {
    additionsNum,
    deletionsNum,
    ignoreAdditionsNum,
    ignoreDeletionsNum,
  }
}

export function createSplitDiff(
  oldString: string,
  newString: string,
  language = 'plaintext',
  diffStyle = 'word',
  forceInlineComparison = false,
  context = 10,
  ignoreMatchingLines?: string,
): SplitViewerChange {
  const newEmptySplitDiff = (): DiffLine => ({ type: DiffType.EMPTY })
  const newSplitDiff = (type: DiffType, num: number, code: string): DiffLine => ({ type, num, code })
  const changes = diffLines(oldString, newString)
  const ignoreRegex = ignoreMatchingLines ? new RegExp(ignoreMatchingLines) : undefined

  let delNum = 0
  let addNum = 0
  let skip = false

  const rawChanges: SplitLineChange[] = []
  const result: SplitViewerChange = {
    changes: rawChanges,
    collector: [],
    stat: calcDiffStat(changes, ignoreRegex),
  }

  for (let i = 0; i < changes.length; i++) {
    if (skip) {
      skip = false
      continue
    }

    const [cur, next] = [changes[i], changes[i + 1]]
    const [curType, nextType] = [lineType(cur), lineType(next)]

    const curLines = cur.value.replace(/\n$/, '').split('\n')

    // 最后一处 diff 的特殊处理
    if (next === undefined) {
      for (const line of curLines) {
        let left: DiffLine = newEmptySplitDiff()
        let right: DiffLine = newEmptySplitDiff()

        if (curType === DiffType.EQUAL) {
          delNum++
          addNum++

          left = newSplitDiff(DiffType.EQUAL, delNum, line)
          right = newSplitDiff(DiffType.EQUAL, addNum, line)
        }
        if (curType === DiffType.DELETE) {
          delNum++

          left = newSplitDiff(DiffType.DELETE, delNum, line)
          right = newEmptySplitDiff()
        }
        if (curType === DiffType.ADD) {
          addNum++

          left = newEmptySplitDiff()
          right = newSplitDiff(DiffType.ADD, addNum, line)
        }
        rawChanges.push({ left, right })
      }
      break
    }

    // 正常逻辑
    // 处理当前 diff 为相等的情况
    if (curType === DiffType.EQUAL) {
      for (const line of curLines) {
        delNum++
        addNum++

        rawChanges.push({
          left: newSplitDiff(DiffType.EQUAL, delNum, line),
          right: newSplitDiff(DiffType.EQUAL, addNum, line),
        })
      }
    }

    const nextLines = next.value.replace(/\n$/, '').split('\n')
    // 处理当前 diff 为删除的情况
    if (curType === DiffType.DELETE) {
      if (nextType === DiffType.EQUAL) {
        for (const line of curLines) {
          delNum++

          rawChanges.push({
            left: newSplitDiff(DiffType.DELETE, delNum, line),
            right: newEmptySplitDiff(),
          })
        }
      }
      if (nextType === DiffType.ADD) {
        skip = true
        const maxCount = Math.max(cur.count!, next.count!)
        for (let j = 0; j < maxCount; j++) {
          if (j < cur.count!)
            delNum++

          if (j < next.count!)
            addNum++

          const [curLine, nextLine] = [curLines[j], nextLines[j]]
          const shouldRenderWords = forceInlineComparison || curLines.length === nextLines.length
          const [leftLine, rightLine] = shouldRenderWords
            ? renderChangedLines(curLine, nextLine, diffStyle, forceInlineComparison)
            : [curLine, nextLine]

          // 忽略匹配的行等价于相等
          const leftDiffType = ignoreRegex?.test(curLine) ? DiffType.EQUAL : DiffType.DELETE
          const rightDiffType = ignoreRegex?.test(nextLine) ? DiffType.EQUAL : DiffType.ADD

          const left
            = j < cur.count!
              ? newSplitDiff(leftDiffType, delNum, leftLine!)
              : newEmptySplitDiff()
          const right
            = j < next.count!
              ? newSplitDiff(rightDiffType, addNum, rightLine!)
              : newEmptySplitDiff()

          rawChanges.push({ left, right })
        }
      }
    }
    // 处理当前 diff 为添加的情况
    if (curType === DiffType.ADD) {
      for (const line of curLines) {
        addNum++
        rawChanges.push({
          left: newEmptySplitDiff(),
          right: newSplitDiff(DiffType.ADD, addNum, line),
        })
      }
    }
  }

  if (oldString === newString) {
    for (let i = 0; i < rawChanges.length; i++)
      rawChanges[i].fold = false
    rawChanges.slice(0, RENDER_BATCH_SIZE).forEach(line => highlightSplitLine(line, language))

    return result
  }

  for (let i = 0; i < rawChanges.length; i++) {
    const line = rawChanges[i]
    if (line.left.type === DiffType.DELETE || line.right.type === DiffType.ADD) {
      const [start, end] = [Math.max(i - context, 0), Math.min(i + context + 1, rawChanges.length)]
      for (let j = start; j < end; j++)
        rawChanges[j].fold = false
    }
    if (line.fold === undefined)
      line.fold = true
  }

  const processedChanges: SplitViewerChange['changes'] = []
  let unchanges: SplitLineUnchanges['lines'] = [] // collector for unchanged lines.

  for (let i = 0; i < rawChanges.length; i++) {
    const line = rawChanges[i]
    if (line.fold === false) {
      if (unchanges.length) {
        unchanges[0].hideIndex = result.collector.length
        result.collector.push({
          lines: unchanges,
          fold: true,
        })
        unchanges = []
      }
      processedChanges.push(line)
      continue
    }

    line.hide = true
    unchanges.push(line)
    processedChanges.push(line)
  }
  if (unchanges.length) {
    unchanges[0].hideIndex = result.collector.length
    result.collector.push({
      lines: unchanges,
      fold: true,
    })
    unchanges = []
  }
  result.changes = processedChanges
  result.changes.filter(line => !line.hide).slice(0, RENDER_BATCH_SIZE).forEach(line => highlightSplitLine(line, language))

  return result
}

export function createUnifiedDiff(
  oldString: string,
  newString: string,
  language = 'plaintext',
  diffStyle = 'word',
  forceInlineComparison = false,
  context = 10,
  ignoreMatchingLines?: string,
): UnifiedViewerChange {
  const changes = diffLines(oldString, newString)
  const ignoreRegex = ignoreMatchingLines ? new RegExp(ignoreMatchingLines) : undefined

  let delNum = 0
  let addNum = 0
  let skip = false

  const rawChanges: UnifiedLineChange[] = []
  const result: UnifiedViewerChange = {
    changes: rawChanges,
    collector: [],
    stat: calcDiffStat(changes, ignoreRegex),
  }

  for (let i = 0; i < changes.length; i++) {
    if (skip) {
      skip = false
      continue
    }

    const [cur, next] = [changes[i], changes[i + 1]]
    const [curType, nextType] = [lineType(cur), lineType(next)]

    const curLines = cur.value.replace(/\n$/, '').split('\n')

    // 最后一行的特殊处理
    if (next === undefined) {
      for (const line of curLines) {
        if (curType === DiffType.EQUAL) {
          delNum++
          addNum++
        }
        if (curType === DiffType.DELETE)
          delNum++

        if (curType === DiffType.ADD)
          addNum++

        rawChanges.push({
          type: curType,
          code: line,
          addNum: curType === DiffType.DELETE ? undefined : addNum,
          delNum: curType === DiffType.ADD ? undefined : delNum,
        })
      }
      break
    }

    // 正常逻辑
    // 处理当前 diff 为相等的情况
    if (curType === DiffType.EQUAL) {
      for (const line of curLines) {
        delNum++
        addNum++
        rawChanges.push({ type: DiffType.EQUAL, code: line, delNum, addNum })
      }
    }

    const nextLines = next.value.replace(/\n$/, '').split('\n')
    // 处理当前 diff 为删除的情况
    if (curType === DiffType.DELETE) {
      // 下一处差异为新增，且删除与新增行数相同时，对每行依次 diff
      if (nextType === DiffType.ADD && (curLines.length === nextLines.length || forceInlineComparison)) {
        const maxCount = Math.max(curLines.length, nextLines.length)
        const renderedLines = Array.from({ length: maxCount }, (_, index) => renderChangedLines(curLines[index], nextLines[index], diffStyle, forceInlineComparison))
        for (let j = 0; j < curLines.length; j++) {
          const curLine = curLines[j]
          delNum++

          rawChanges.push({
            type: ignoreRegex?.test(curLine) ? DiffType.EQUAL : DiffType.DELETE,
            code: renderedLines[j][0]!,
            delNum,
          })
        }

        for (let j = 0; j < nextLines.length; j++) {
          const nextLine = nextLines[j]
          addNum++

          rawChanges.push({
            type: ignoreRegex?.test(nextLine) ? DiffType.EQUAL : DiffType.ADD,
            code: renderedLines[j][1]!,
            addNum,
          })
        }

        skip = true
      }
      else {
        // 否则单独渲染每行
        for (const line of curLines) {
          delNum++

          rawChanges.push({ type: DiffType.DELETE, code: line, delNum })
        }
      }
    }
    // 处理当前 diff 为添加的情况
    if (curType === DiffType.ADD) {
      for (const line of curLines) {
        addNum++
        rawChanges.push({ type: DiffType.ADD, code: line, addNum })
      }
    }
  }

  for (let i = 0; i < rawChanges.length; i++) {
    const line = rawChanges[i]
    if (line.type === DiffType.DELETE || line.type === DiffType.ADD) {
      const [start, end] = [Math.max(i - context, 0), Math.min(i + context + 1, rawChanges.length)]
      for (let j = start; j < end; j++)
        rawChanges[j].fold = false
    }
    if (line.fold === undefined)
      line.fold = true
  }

  if (oldString === newString) {
    for (let i = 0; i < rawChanges.length; i++)
      rawChanges[i].fold = false
    rawChanges.slice(0, RENDER_BATCH_SIZE).forEach(line => highlightUnifiedLine(line, language))

    return result
  }

  const processedChanges = []
  let unchanges: UnifiedLineUnchanges['lines'] = [] // collector for unchanged lines.

  for (let i = 0; i < rawChanges.length; i++) {
    const line = rawChanges[i]
    if (line.fold === false) {
      if (unchanges.length) {
        unchanges[0].hideIndex = result.collector.length
        // Keeps "hideIndex" in first element of collector
        // for delegating lines to expand.
        result.collector.push({
          lines: unchanges,
          fold: true,
        })
        unchanges = []
      }
      processedChanges.push(line)
      continue
    }
    if (line.type === 'equal') {
      line.hide = true
      unchanges.push(line)
    }
    processedChanges.push(line)
  }
  if (unchanges.length) {
    unchanges[0].hideIndex = result.collector.length
    result.collector.push({
      lines: unchanges,
      fold: true,
    })
    unchanges = []
  }
  result.changes = processedChanges
  result.changes.filter(line => !line.hide).slice(0, RENDER_BATCH_SIZE).forEach(line => highlightUnifiedLine(line, language))

  return result
}
