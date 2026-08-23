import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const [tarballArg, vueVersion, explicitEntry] = process.argv.slice(2)
if (!tarballArg || !vueVersion || !explicitEntry)
  throw new Error('Usage: node tests/package-smoke.mjs <tarball> <vue-version> <explicit-entry>')

const tarball = resolve(tarballArg)
const fixture = join(dirname(fileURLToPath(import.meta.url)), 'package-consumer.mjs')
const vueMajor = vueVersion.startsWith('3.') ? 3 : 2
const renderer = vueMajor === 3 ? `@vue/server-renderer@${vueVersion}` : `vue-server-renderer@${vueVersion}`
const dependencies = [`vue@${vueVersion}`, renderer]
if (vueVersion.startsWith('2.6.'))
  dependencies.push('@vue/composition-api@1.7.2')

for (const { manager, entry, installArgs } of [
  { manager: 'pnpm', entry: explicitEntry, installArgs: ['add', '--ignore-scripts', '--config.auto-install-peers=false'] },
  { manager: 'npm', entry: 'v-code-diff', installArgs: ['install', '--legacy-peer-deps'] },
]) {
  const directory = mkdtempSync(join(tmpdir(), `v-code-diff-${manager}-${vueVersion}-`))
  try {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name: 'package-smoke', private: true, type: 'module' }))
    copyFileSync(fixture, join(directory, basename(fixture)))
    execFileSync(manager, [...installArgs, tarball, ...dependencies], { cwd: directory, stdio: 'inherit' })
    execFileSync(process.execPath, [basename(fixture)], {
      cwd: directory,
      env: { ...process.env, PACKAGE_ENTRY: entry, VUE_VERSION: vueVersion },
      stdio: 'inherit',
    })
  }
  finally {
    rmSync(directory, { recursive: true, force: true })
  }
}
