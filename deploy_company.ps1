# 公司站部署（本机上传 + 远程执行）
# 仅在收到部署指令后运行。
# 默认 root：线上根 /var/www/briandolph，保留 self / arg_01
# 可选 independent：独立目录 /var/www/briandolph-company

param(
  [ValidateSet('root', 'independent')]
  [string]$Target = 'root'
)

$ErrorActionPreference = 'Stop'

$HostName = '8.138.98.217'
$User = 'root'
$Key = 'C:\Users\sjyam\password\开发服务器.pem'
$Repo = 'F:\彼岸时墟\公司站\briandolph_company_lab'
$Tgz = Join-Path $Repo 'company_dist.tgz'

$scriptName = if ($Target -eq 'root') { 'deploy_company_root.sh' } else { 'deploy_company_server.sh' }
$ServerScript = Join-Path $Repo $scriptName

foreach ($p in @($Tgz, $ServerScript, $Key)) {
  if (-not (Test-Path -LiteralPath $p)) { throw "缺少: $p" }
}

$opts = @('-i', $Key, '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=accept-new')

Write-Host "[1/3] 上传 company_dist.tgz (target=$Target) ..."
& scp @opts $Tgz "${User}@${HostName}:/root/company_dist.tgz"

Write-Host "[2/3] 上传 $scriptName ..."
& scp @opts $ServerScript "${User}@${HostName}:/root/$scriptName"

Write-Host "[3/3] 执行服务器部署 ..."
& ssh @opts "${User}@${HostName}" "sh /root/$scriptName"

Write-Host '完成。请检查线上 https://briandolph.xyz/'
