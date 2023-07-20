<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive } from 'vue'

const form = reactive({
  oldString: `
123
123
123
456
123
123
123
123
123
123
123
123
`,
  newString: `
123
123
123
452
123
123
123
123
123
123
123
`,
  language: 'javascript',
  diffStyle: 'word',
  outputFormat: 'side-by-side',
  context: 3,
  filename: 'playground-old.json',
  compareFilename: 'playground-compare.json',
})
</script>

<template>
  <p align="center">
    Vue version: {{ version }}
  </p>
  <div style="display: flex; justify-content: space-evenly">
    <textarea v-model="form.oldString" style="width: 48vw" :rows="20" />
    <textarea v-model="form.newString" style="width: 48vw" :rows="20" />
  </div>
  <CodeDiff
    :output-format="form.outputFormat"
    :filename="form.filename"
    :compare-filename="form.compareFilename"
    :old-string="form.oldString"
    :new-string="form.newString"
    :language="form.language"
    :diff-style="form.diffStyle"
    :context="form.context"
  />
</template>

<style>
body > div {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
}
</style>
