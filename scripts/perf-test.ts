import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSplitDiff } from '../src/utils'

// 获取当前文件的 URL 和目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 构建文件的绝对路径
const oldTextPath = path.join(__dirname, '../demo/text/old-long-text.txt')
const newTextPath = path.join(__dirname, '../demo/text/new-long-text.txt')

// 同步读取文件内容
const oldLongText = fs.readFileSync(oldTextPath, 'utf-8')
const newLongText = fs.readFileSync(newTextPath, 'utf-8')

console.log('开始执行性能测试...') // 更新日志消息以匹配函数名

const label = 'createSplitDiff execution time' // 更新标签以匹配函数名

// 开始计时
console.time(label)

// 执行函数
try {
  const _result = createSplitDiff(oldLongText, newLongText) // 将 result 重命名为 _result 以消除未使用变量的警告
  console.log(_result.changes.length)
}
catch (error) {
  console.error('执行 createSplitDiff 时出错:', error) // 更新错误消息
}

// 结束计时并打印时间
console.timeEnd(label)

console.log('性能测试完成.')

// 你可能还需要一个空的 export {} 来让 TypeScript 将其视为一个模块（如果需要）
// export {};
