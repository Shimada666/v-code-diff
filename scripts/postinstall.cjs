const fs = require('node:fs')
const { switchVersion } = require('./utils.cjs')

if (fs.existsSync('.local')) {
  console.log('Currently, it is the local development environment, not doing anything.')
}
else {
  const { version } = require('vue')

  if (version.startsWith('2.7.'))
    switchVersion('2.7')
  else if (version.startsWith('2.'))
    switchVersion('2')
  else if (version.startsWith('3.'))
    switchVersion('3')
  else
    throw new Error(`[v-code-diff] Vue version v${version} is not supported.`)
}
