// 构建前置检查：拦住「在错误目录构建」的静默事故。
// 已知的两类事故都不会报错，只会悄悄丢内容 / 覆盖线上子站：
//   1) src/data/contact.local.js 缺失 -> 联系页的微信与电话变空（不报错）
//   2) public/ 下存在 arg_01、personal -> 打包后端 cp 覆盖线上同名子站
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const warnings = []

const contact = path.join(ROOT, 'src', 'data', 'contact.local.js')
if (!fs.existsSync(contact)) {
  if (process.env.ALLOW_MISSING_CONTACT === '1') {
    warnings.push('src/data/contact.local.js 缺失（已由 ALLOW_MISSING_CONTACT=1 放行）：联系页的微信与电话将为空')
  } else {
    errors.push(
      'src/data/contact.local.js 缺失：联系页的微信与电话会被静默清空。' +
      '请在 briandolph_company_bg 构建，或设 ALLOW_MISSING_CONTACT=1 明确放行。'
    )
  }
}

// 本地 public 目录名 -> 线上实际子站路径（部署脚本按线上路径保护）
const SUBSITES = {
  arg_01: '/arg_01/',
  personal: '/self/'
}

for (const [name, live] of Object.entries(SUBSITES)) {
  const dir = path.join(ROOT, 'public', name)
  if (fs.existsSync(dir)) {
    errors.push(
      `public/${name}/ 存在：一旦打包部署，会覆盖线上 ${live} 子站。` +
      '构建目录应为 briandolph_company_bg。'
    )
  }
}

for (const w of warnings) console.warn('[check-env] 警告:', w)

if (errors.length) {
  console.error('\n[check-env] 构建前置检查未通过：')
  for (const e of errors) console.error('  ✗', e)
  console.error('')
  process.exit(1)
}

console.log('[check-env] 通过：contact.local.js 就位，public/ 无子站污染目录')
