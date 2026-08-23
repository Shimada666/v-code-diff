<script lang="ts" setup>
import type { DiffChangeClickEvent, UnifiedLineChange } from '../types'
import { DiffType } from '../types'

const props = defineProps<{
  line: UnifiedLineChange
}>()
const emit = defineEmits<{
  (e: 'expand', line: UnifiedLineChange): void
  (e: 'change-click', payload: DiffChangeClickEvent): void
}>()

function onChangeClick(event: MouseEvent) {
  if (props.line.type !== DiffType.ADD && props.line.type !== DiffType.DELETE)
    return

  // Vue 2 DOM templates require kebab-case event names.
  emit('change-click', {
    side: props.line.type === DiffType.DELETE ? 'old' : 'new',
    type: props.line.type,
    lineNumber: props.line.type === DiffType.DELETE ? props.line.delNum! : props.line.addNum!,
    event,
  })
}

function getCodeMarker(type: DiffType) {
  if (type === DiffType.DELETE)
    return '-'
  if (type === DiffType.ADD)
    return '+'
  return ''
}
</script>

<template>
  <tr v-if="line.hideIndex !== undefined && line.hide">
    <td class="blob-num blob-num-hunk text-center" colspan="2" @click="emit('expand', line)">
      >
    </td>
    <td class="blob-code blob-code-hunk" align="left">
      ⋯
    </td>
  </tr>
  <tr v-else-if="!line.hide" :data-diff-change="line.type !== DiffType.EQUAL ? '' : undefined" @click="onChangeClick">
    <td
      class="blob-num"
      :class="{
        'blob-num-deletion': line.type === DiffType.DELETE,
        'blob-num-addition': line.type === DiffType.ADD,
        'blob-num-context': line.type === DiffType.EQUAL,
        'blob-num-hunk': line.hide !== undefined,
      }"
    >
      {{ line.delNum }}
    </td>
    <td
      class="blob-num"
      :class="{
        'blob-num-deletion': line.type === DiffType.DELETE,
        'blob-num-addition': line.type === DiffType.ADD,
        'blob-num-context': line.type === DiffType.EQUAL,
        'blob-num-hunk': line.hide !== undefined,
      }"
    >
      {{ line.addNum }}
    </td>
    <td
      class="blob-code"
      :class="{
        'blob-code-deletion': line.type === DiffType.DELETE,
        'blob-code-addition': line.type === DiffType.ADD,
        'blob-code-context': line.type === DiffType.EQUAL,
        'blob-code-hunk': line.hide !== undefined,
      }"
    >
      <span class="blob-code-inner blob-code-marker" :data-code-marker="getCodeMarker(line.type)" v-html="line.code" />
    </td>
  </tr>
</template>
