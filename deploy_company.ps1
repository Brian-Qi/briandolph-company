# 公司站部署（唯一入口）· 2026-11-25 起改为「开发机 → 生产机」
#
# 架构：
#   本地 Windows ──源码──▶ 开发机 47.113.229.68（构建）
#                              │  dist
#                              ▼
#                        生产机 47.118.16.92（只收产物，/root 无常驻部署脚本）
#
# 本脚本只做两件事：
#   1) 把本地源码推到开发机（调用 remote-ws\ws.ps1 push）
#   2) 在开发机上执行 /srv/bin/deploy-company.sh（构建 → 备份生产 → 传产物 → 管道执行部署）
#
# 用法：
#   .\deploy_company.ps1              # 推源码 + 远端构建 + 部署到生产
#   .\deploy_company.ps1 -SkipPush    # 不推源码，直接用开发机上现有代码构建并部署
#   .\deploy_company.ps1 -BuildOnly   # 只推源码并在开发机构建，不部署
#
# 单源约定（不变）：
#   briandolph_company_lab = 唯一源码（有 git）
#   briandolph_company_bg  = 本地构建工作区（由 ws.ps1 同步）
#   生产机 /var/www/briandolph 只放 dist 产物，出现 src/package.json 会被两道闸拦下

param(
  [switch]$SkipPush,
  [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'

$DevHost = '47.113.229.68'
$Key     = 'C:\Users\sjyam\password\开发服务器.pem'
$Opts    = @('-i', $Key, '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new')
$Ws      = 'F:\tools\remote-ws\ws.ps1'

# 1) 推源码到开发机
if (-not $SkipPush) {
  if (-not (Test-Path $Ws)) { throw "找不到 remote-ws\ws.ps1：$Ws" }
  Write-Host '[1/2] 推送源码到开发机 ...' -ForegroundColor Cyan
  & powershell -NoProfile -ExecutionPolicy Bypass -File $Ws push -Project company
  if ($LASTEXITCODE -ne 0) { throw '推送到开发机失败' }
} else {
  Write-Host '[1/2] 跳过推送，使用开发机现有代码' -ForegroundColor DarkGray
}

# 2) 开发机构建（并可选部署）
$devCmd = if ($BuildOnly) { 'bash /srv/bin/deploy-company.sh --build-only' } else { 'bash /srv/bin/deploy-company.sh' }

Write-Host '[2/2] 开发机执行：' -ForegroundColor Cyan
Write-Host "      $devCmd"
& ssh @Opts "root@${DevHost}" "$devCmd"
if ($LASTEXITCODE -ne 0) { throw '开发机执行失败' }

Write-Host ''
Write-Host '完成。线上：https://www.briandolph.xyz/' -ForegroundColor Green
