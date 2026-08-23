/* eslint-disable test/consistent-test-it -- Vitest benchmarks use bench(), not it(). */
import { bench } from 'vitest'
import { createSplitDiff, createUnifiedDiff } from '../src/utils'

const lines = Array.from({ length: 15_000 }, (_, index) => `const value${index} = ${index}`)
const changedLines = [...lines]
changedLines[7_500] = 'const value7500 = "changed"'
const oldMultiline = lines.join('\n')
const newMultiline = changedLines.join('\n')
const allChangedMultiline = lines.map((_, index) => `const changed${index} = ${index}`).join('\n')
const oldJson = JSON.stringify(Object.fromEntries(Array.from({ length: 5_000 }, (_, index) => [`key${index}`, index])))
const newJson = oldJson.replace('"key2500":2500', '"key2500":"changed"')
const hugeLines = Array.from({ length: 100_000 }, (_, index) => `line ${index}`)
const hugeChangedLines = [...hugeLines]
hugeChangedLines[50_000] = 'line changed'
const oldHugeMultiline = hugeLines.join('\n')
const newHugeMultiline = hugeChangedLines.join('\n')
const boundaryLines = Array.from({ length: 40_001 }, (_, index) => `boundary ${index}`)
const boundaryChangedLines = boundaryLines.map((line, index) => index % 11 ? line : `${line} changed`)
const oldBoundaryMultiline = boundaryLines.join('\n')
const newBoundaryMultiline = boundaryChangedLines.join('\n')

bench('15k lines, identical', () => {
  createUnifiedDiff(oldMultiline, oldMultiline, 'plaintext', 'word', false, 3)
})

bench('15k lines, one change, unified', () => {
  createUnifiedDiff(oldMultiline, newMultiline, 'plaintext', 'word', false, 3)
})

bench('15k lines, one change, split', () => {
  createSplitDiff(oldMultiline, newMultiline, 'plaintext', 'word', false, 3)
})

bench('15k lines, all changed', () => {
  createUnifiedDiff(oldMultiline, allChangedMultiline, 'plaintext', 'word', false, 3)
})

bench('100KB single-line JSON, one change', () => {
  createUnifiedDiff(oldJson, newJson, 'plaintext')
})

bench('100k lines, one change', () => {
  createUnifiedDiff(oldHugeMultiline, newHugeMultiline, 'plaintext', 'word', false, 3)
})

bench('40k lines, 9% changed', () => {
  createUnifiedDiff(oldBoundaryMultiline, newBoundaryMultiline, 'plaintext', 'word', false, 3)
})
