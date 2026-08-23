import { expect, it } from 'vitest'
import { DiffType } from '../src/types'
import { createSplitDiff, createUnifiedDiff, highlightSplitLine, highlightUnifiedLine } from '../src/utils'

it('keeps identical and empty input unchanged', () => {
  for (const value of ['', 'one line', 'one line\n']) {
    const unified = createUnifiedDiff(value, value)
    const split = createSplitDiff(value, value)

    expect(unified.stat.additionsNum).toBe(0)
    expect(unified.stat.deletionsNum).toBe(0)
    expect(split.stat).toEqual(unified.stat)
    expect(unified.changes.every(line => line.type === DiffType.EQUAL)).toBe(true)
  }
})

it('renders a removed final newline as its own empty line', () => {
  const unified = createUnifiedDiff('line\n', 'line')
  const split = createSplitDiff('line\n', 'line')

  expect(
    unified.changes.map(line => [line.type, line.code, line.delNum, line.addNum]),
  ).toEqual([
    [DiffType.EQUAL, 'line', 1, 1],
    [DiffType.DELETE, '', 2, undefined],
  ])
  expect(unified.stat).toEqual({
    additionsNum: 0,
    deletionsNum: 1,
    ignoreAdditionsNum: 0,
    ignoreDeletionsNum: 0,
  })
  expect(
    split.changes.map(line => [line.left.type, line.left.code, line.right.type, line.right.code]),
  ).toEqual([
    [DiffType.EQUAL, 'line', DiffType.EQUAL, 'line'],
    [DiffType.DELETE, '', DiffType.EMPTY, undefined],
  ])
})

it('renders an added final newline as its own empty line', () => {
  const unified = createUnifiedDiff('line', 'line\n')
  const split = createSplitDiff('line', 'line\n')

  expect(
    unified.changes.map(line => [line.type, line.code, line.delNum, line.addNum]),
  ).toEqual([
    [DiffType.EQUAL, 'line', 1, 1],
    [DiffType.ADD, '', undefined, 2],
  ])
  expect(unified.stat.additionsNum).toBe(1)
  expect(unified.stat.deletionsNum).toBe(0)
  expect(split.stat).toEqual(unified.stat)
})

it('keeps a shared first line unchanged when the new text adds another line', () => {
  const oldString = 'const a = 2;'
  const newString = 'const a = 2;\nlet b = 3;'
  const unified = createUnifiedDiff(oldString, newString)
  const split = createSplitDiff(oldString, newString)

  expect(unified.changes.map(line => [line.type, line.code])).toEqual([
    [DiffType.EQUAL, 'const a = 2;'],
    [DiffType.ADD, 'let b = 3;'],
  ])
  expect(split.changes.map(line => [line.left.type, line.right.type])).toEqual([
    [DiffType.EQUAL, DiffType.EQUAL],
    [DiffType.EMPTY, DiffType.ADD],
  ])
  expect(unified.stat).toEqual({
    additionsNum: 1,
    deletionsNum: 0,
    ignoreAdditionsNum: 0,
    ignoreDeletionsNum: 0,
  })
  expect(split.stat).toEqual(unified.stat)
})

it('handles pure additions, pure deletions, and unequal replacements', () => {
  const cases = [
    ['', 'one\ntwo', 2, 0],
    ['one\ntwo', '', 0, 2],
    ['one\ntwo\nthree', 'one\nchanged', 1, 2],
  ] as const

  for (const [oldString, newString, additions, deletions] of cases) {
    const unified = createUnifiedDiff(oldString, newString)
    const split = createSplitDiff(oldString, newString)

    expect(unified.stat.additionsNum).toBe(additions)
    expect(unified.stat.deletionsNum).toBe(deletions)
    expect(split.stat).toEqual(unified.stat)
  }
})

it('distinguishes CRLF until the caller normalizes line endings', () => {
  const raw = createUnifiedDiff('line\r\n', 'line\n')
  const normalized = createUnifiedDiff('line\n', 'line\n')

  expect(raw.stat.additionsNum).toBe(1)
  expect(raw.stat.deletionsNum).toBe(1)
  expect(normalized.stat.additionsNum).toBe(0)
  expect(normalized.stat.deletionsNum).toBe(0)
})

it('excludes ignored matching lines from visible statistics', () => {
  const unified = createUnifiedDiff('time: old', 'time: new', 'plaintext', 'word', false, 10, '^time:')

  expect(unified.stat.additionsNum).toBe(0)
  expect(unified.stat.deletionsNum).toBe(0)
  expect(unified.stat.ignoreAdditionsNum).toBe(1)
  expect(unified.stat.ignoreDeletionsNum).toBe(1)
})

it('folds unchanged lines outside the requested context', () => {
  const oldLines = Array.from({ length: 20 }, (_, index) => `line ${index + 1}`)
  const newLines = [...oldLines]
  newLines[9] = 'changed'

  const unified = createUnifiedDiff(oldLines.join('\n'), newLines.join('\n'), 'plaintext', 'word', false, 1)
  const visible = unified.changes.filter(line => !line.hide)

  expect(visible.filter(line => line.type === DiffType.EQUAL)).toHaveLength(2)
  expect(unified.changes.some(line => line.hide)).toBe(true)
  expect(unified.collector).toHaveLength(2)
})

it('escapes untrusted code in the server rendering path', () => {
  const unified = createUnifiedDiff('', '<img src=x onerror=alert(1)> & "quote" \'apostrophe\'')
  const code = unified.changes[0].code

  expect(code).toContain('&lt;img')
  expect(code).toContain('&amp;')
  expect(code).toContain('&quot;')
  expect(code).toContain('&#39;')
  expect(code).not.toContain('<img')
})

it('defers highlighting folded lines until expansion', () => {
  const oldLines = Array.from({ length: 20 }, (_, index) => index === 0 ? '<hidden>' : `line ${index + 1}`)
  const newLines = [...oldLines]
  newLines[10] = 'changed'

  const unified = createUnifiedDiff(oldLines.join('\n'), newLines.join('\n'), 'plaintext', 'word', false, 1)
  const unifiedHidden = unified.changes.find(line => line.hide)!
  expect(unifiedHidden.code).toBe('<hidden>')
  highlightUnifiedLine(unifiedHidden, 'plaintext')
  expect(unifiedHidden.code).toBe('&lt;hidden&gt;')

  const split = createSplitDiff(oldLines.join('\n'), newLines.join('\n'), 'plaintext', 'word', false, 1)
  const splitHidden = split.changes.find(line => line.hide)!
  expect(splitHidden.left.code).toBe('<hidden>')
  highlightSplitLine(splitHidden, 'plaintext')
  expect(splitHidden.left.code).toBe('&lt;hidden&gt;')
  expect(splitHidden.right.code).toBe('&lt;hidden&gt;')
})

it('defers highlighting beyond the first render batch', () => {
  const newString = Array.from({ length: 1_001 }, (_, index) => `<line ${index}>`).join('\n')
  const unified = createUnifiedDiff('', newString)
  const deferredLine = unified.changes[1_000]

  expect(unified.changes[999].highlighted).toBe(true)
  expect(deferredLine.highlighted).toBeUndefined()
  expect(deferredLine.code).toBe('<line 1000>')
  highlightUnifiedLine(deferredLine, 'plaintext')
  expect(deferredLine.code).toBe('&lt;line 1000&gt;')
})

it('skips expensive inline comparison for long lines unless forced', () => {
  const surroundingText = 'same '.repeat(2_200)
  const oldString = `${surroundingText}old${surroundingText}`
  const newString = `${surroundingText}new${surroundingText}`

  expect(createUnifiedDiff(oldString, newString).changes.every(line => !line.code.includes('class="x"'))).toBe(true)
  expect(createUnifiedDiff(oldString, newString, 'plaintext', 'word', true).changes.some(line => line.code.includes('class="x"'))).toBe(true)
})

it('supports forced inline comparison with unequal replacement line counts', () => {
  for (const [oldString, newString] of [
    ['old', 'new\nextra'],
    ['old\nextra', 'new'],
  ]) {
    const unified = createUnifiedDiff(oldString, newString, 'plaintext', 'word', true)
    expect(unified.stat.additionsNum).toBe(newString.split('\n').length)
    expect(unified.stat.deletionsNum).toBe(oldString.split('\n').length)
  }
})

it('keeps sparse diffs correct beyond diff-match-patch line limits', () => {
  const oldLines = Array.from({ length: 40_001 }, (_, index) => `line ${index}`)
  const newLines = [...oldLines]
  newLines[20_000] = 'line changed'

  const unified = createUnifiedDiff(oldLines.join('\n'), newLines.join('\n'), 'plaintext', 'word', false, 1)
  expect(unified.stat.additionsNum).toBe(1)
  expect(unified.stat.deletionsNum).toBe(1)
  expect(unified.changes.filter(line => line.type !== DiffType.EQUAL).map(line => line.code)).toEqual([
    'line <span class="x">20000</span>',
    'line <span class="x">changed</span>',
  ])
})
