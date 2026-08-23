const fs = require('node:fs')
const path = require('node:path')

const dir = path.resolve(__dirname, '..', 'dist')

function copy(name, version, vue) {
  vue = vue || 'vue'
  const src = path.join(dir, `v${version}`, name)
  const dest = path.join(dir, name)
  let content = fs.readFileSync(src, 'utf-8')
  content = content.replace(/'vue'/g, `'${vue}'`)
  fs.rmSync(dest, { force: true })
  fs.writeFileSync(dest, content, 'utf-8')
}

function switchVersion(version, vue) {
  copy('index.es.js', version, vue)
  copy('index.cjs', version, vue)
}

module.exports.switchVersion = switchVersion
