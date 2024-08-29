<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive } from 'vue'
import c from 'highlight.js/lib/languages/c'
import { CodeDiff, CodeReader, hljs } from '../src/index'

hljs.registerLanguage('c', c)
// import { oldLongText } from '../demo/text/old-long-text'
// import { newLongText } from '../demo/text/new-long-text'

const form = reactive({
  // oldString: oldLongText,
  // newString: newLongText,
  oldString: '#include <stdio.h>',
  newString: '123\n123',
  filename: 'oldFile',
  newFilename: 'newFile',
  language: 'c',
  diffStyle: 'word',
  outputFormat: 'side-by-side',
  ignoreMatchingLines: 'time',
  context: 3,
})
</script>

<template>
  <p align="center">
    Vue version: {{ version }}
  </p>
  <div style="display: flex; justify-content: space-evenly">
    <textarea v-model="form.oldString" style="width: 48vw;" :rows="20" />
    <textarea v-model="form.newString" style="width: 48vw;" :rows="20" />
  </div>
  <CodeDiff
    :old-string="form.oldString"
    :new-string="form.newString"
    :filename="form.filename"
    :new-filename="form.newFilename"
    :language="form.language"
    :output-format="form.outputFormat"
    :ignore-matching-lines="form.ignoreMatchingLines"
    :diff-style="form.diffStyle"
    :context="form.context"
  />
  <hr>
  <CodeReader :text="form.newString" :language="form.language" />
</template>

<style>
body > div {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
}
</style>
