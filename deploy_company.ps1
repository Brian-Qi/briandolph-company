# 公司站部署（唯一入口）
#
# 单源约定（2026-11-24 起）：
#   briandolph_company_lab = 唯一源码（有 git）。所有改动都在这里改。
#   briandolph_company_bg  = 构建工作区（无 git），源码由本脚本从 lab 同步过去。
#   不要在 bg 里改代码，也不要运行 bg 里的旧部署脚本（已改成报错桩）。
#
# 流程：同步 lab → bg → 在 bg 构建（依赖装在 bg）→ 打包 → 上传 → 远程执行
# 用法：
#   .\deploy_company.ps1                 # 构建并部署
#   .\deploy_company.ps1 -BuildOnly      # 只同步+构建，不上传（验收用）
#   .\deploy_company.ps1 -SyncOnly       # 只同步源码到 bg

param(
  [ValidateSet('root', 'independent')]
  [string]$Target = 'root',
  [switch]$BuildOnly,
  [switch]$SyncOnly
)

$ErrorActionPreference = 'Stop'

$HostName = '47.118.16.92'
$User     = 'root'
$Key      = 'C:\Users\sjyam\password\开发服务器.pem'

$Lab = $PSScriptRoot
$Bg  = Join-Path (Split-Path $Lab -Parent) 'briandolph_company_bg'

if (-not (Test-Path -LiteralPath $Bg)) { throw "找不到构建工作区: $Bg" }

# ---------- 1. 同步源码（lab → bg）----------
Write-Host "[1/4] 同步源码 $Lab -> $Bg"

# /MIR 镜像；排除 bg 专属与构建产物。public/_preview 是 bg 独有的预览资源，不能被镜像删掉。
& robocopy (Join-Path $Lab 'src')      (Join-Path $Bg 'src')      /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
& robocopy (Join-Path $Lab 'public')   (Join-Path $Bg 'public')   /MIR /XD _preview /NFL /NDL /NJH /NJS /NP | Out-Null
& robocopy (Join-Path $Lab 'scripts')  (Join-Path $Bg 'scripts')  /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
foreach ($f in @('package.json', 'vite.config.js', 'index.html')) {
  Copy-Item (Join-Path $Lab $f) (Join-Path $Bg $f) -Force
}
# robocopy 的退出码 0-7 是成功
$LASTEXITCODE = 0

# 单源后 contact.local.js 只在 lab 里维护，同步后必须存在于 bg
$contact = Join-Path $Bg 'src\data\contact.local.js'
if (-not (Test-Path -LiteralPath $contact)) {
  throw "构建工作区缺少 src\data\contact.local.js（联系页电话/微信会被静默清空）。请从备份恢复后重试。"
}

if ($SyncOnly) { Write-Host '同步完成（-SyncOnly，未构建）'; return }

# ---------- 2. 构建 ----------
Write-Host "[2/4] 在 bg 构建 ..."
Push-Location $Bg
try {
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "构建失败（exit $LASTEXITCODE）" }
} finally {
  Pop-Location
}

$Tgz = Join-Path $Bg 'company_dist.tgz'
if (-not (Test-Path -LiteralPath $Tgz)) { throw "构建没有产出 company_dist.tgz" }
Write-Host ("    产物: {0} ({1:N2} MB, {2})" -f $Tgz, ((Get-Item $Tgz).Length / 1MB), (Get-Item $Tgz).LastWriteTime)

if ($BuildOnly) { Write-Host '构建完成（-BuildOnly，未上传）'; return }

# ---------- 3. 上传 ----------
$scriptName = if ($Target -eq 'root') { 'deploy_company_root.sh' } else { 'deploy_company_server.sh' }
$ServerScript = Join-Path $Lab $scriptName
foreach ($p in @($Tgz, $ServerScript, $Key)) {
  if (-not (Test-Path -LiteralPath $p)) { throw "缺少: $p" }
}

$opts = @('-i', $Key, '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new')

Write-Host "[3/4] 上传产物与服务器脚本 (target=$Target) ..."
& scp @opts $Tgz "${User}@${HostName}:/root/company_dist.tgz"
if ($LASTEXITCODE -ne 0) { throw '上传产物失败' }
& scp @opts $ServerScript "${User}@${HostName}:/root/$scriptName"
if ($LASTEXITCODE -ne 0) { throw '上传服务器脚本失败' }

# ---------- 4. 远程执行 ----------
Write-Host '[4/4] 执行服务器部署 ...'
& ssh @opts "${User}@${HostName}" "sh /root/$scriptName"
if ($LASTEXITCODE -ne 0) { throw '远程部署失败' }

Write-Host '完成。请检查线上 https://www.briandolph.xyz/' -ForegroundColor Green
