<script setup lang="ts">
import type { UnifiedLineChange, UnifiedViewerChange } from '../types'
import { highlightUnifiedLine } from '../utils'
import UnifiedLine from './UnifiedLine.vue'

const props = defineProps<{
  diffChange: UnifiedViewerChange
  language: string
}>()

function expandHandler({ hideIndex }: UnifiedLineChange) {
  if (hideIndex === undefined)
    return
  props.diffChange.collector[hideIndex!].lines.forEach((line) => {
    highlightUnifiedLine(line, props.language)
    line.hide = false
    line.fold = false
  })
}
</script>

<template>
  <table class="diff-table">
    <tbody>
      <UnifiedLine v-for="(item, index) in diffChange?.changes" :key="index" :line="item" @expand="expandHandler" />
    </tbody>
  </table>
</template>

<style scoped></style>
