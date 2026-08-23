<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue-demi'
import type { SplitLineChange, SplitViewerChange } from '../types'
import { RENDER_BATCH_SIZE, highlightSplitLine } from '../utils'
import SplitLine from './SplitLine.vue'

const props = defineProps<{
  diffChange: SplitViewerChange
  language: string
}>()

const renderLimit = ref(RENDER_BATCH_SIZE)
const visibleChanges = shallowRef(props.diffChange.changes.filter(line => !line.hide || line.hideIndex !== undefined))
const renderedChanges = computed(() => visibleChanges.value.slice(0, renderLimit.value))
const remainingLines = computed(() => visibleChanges.value.length - renderedChanges.value.length)
const nextBatchSize = computed(() => Math.min(remainingLines.value, RENDER_BATCH_SIZE))

watch(() => props.diffChange, (diffChange) => {
  renderLimit.value = RENDER_BATCH_SIZE
  visibleChanges.value = diffChange.changes.filter(line => !line.hide || line.hideIndex !== undefined)
})

function highlightRenderedChanges() {
  renderedChanges.value.forEach(line => highlightSplitLine(line, props.language))
}

function expandHandler({ hideIndex }: SplitLineChange) {
  if (hideIndex === undefined)
    return
  props.diffChange.collector[hideIndex].lines.forEach((line) => {
    line.hide = false
    line.fold = false
  })
  visibleChanges.value = props.diffChange.changes.filter(line => !line.hide || line.hideIndex !== undefined)
  highlightRenderedChanges()
}

function loadMore() {
  renderLimit.value += RENDER_BATCH_SIZE
  highlightRenderedChanges()
}
</script>

<template>
  <table class="file-diff-split diff-table">
    <colgroup>
      <col width="44">
      <col>
      <col width="44">
      <col>
    </colgroup>
    <tbody>
      <SplitLine v-for="(item, index) in renderedChanges" :key="index" :split-line="item" @expand="expandHandler" />
      <tr v-if="remainingLines">
        <td class="blob-code blob-code-hunk load-more" colspan="4">
          <button class="load-more-button" type="button" @click="loadMore">
            Show next {{ nextBatchSize }} lines ({{ remainingLines }} remaining)
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>
