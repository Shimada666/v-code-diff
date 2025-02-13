<script lang="ts" setup>
import { version } from 'vue-demi'
import { reactive } from 'vue'

const form = reactive({
  oldString: '{\n  "code": "200",\n  "msg": "请求成功",\n  "data": {\n    "hitokoto": "往者不可谏，来者犹可追。",\n    "from": "论语·微子篇"\n  },\n  "time": "2024-01-12 17:27:03"\n}',
  newString: '{\n  "code": "200",\n  "msg": "请求成功",\n  "data": {\n    "hitokoto": "成熟的人眼里满是前途，稚嫩的人眼里满是爱恨情仇。",\n    "from": "网易云热评"\n  },\n  "time": "2024-01-12 17:27:06"\n}',
  language: 'json',
  diffStyle: 'word',
  ignoreMatchingLines: 'time',
})
</script>

<template>
  <div>
    <p align="center">
      Vue version: {{ version }}
    </p>
    <textarea v-model="form.oldString" style="width: 48vw" :rows="20" />
    <textarea v-model="form.newString" style="width: 48vw; margin-left: 20px" :rows="20" />
    <CodeDiff
      :old-string="form.oldString"
      :new-string="form.newString"
      :language="form.language"
      :diff-style="form.diffStyle"
      :ignore-matching-lines="form.ignoreMatchingLines"
      output-format="side-by-side"
    />
  </div>
</template>

<style>
body > div {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
