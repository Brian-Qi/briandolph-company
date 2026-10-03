#!/bin/sh
# 公司站部署（服务器端）· 站点根 /var/www/briandolph
# 前置：把 company_dist.tgz 传到 /root/
set -e
cd /var/www/briandolph

# 1) 先解到临时目录并校验，避免坏包把根目录清空
rm -rf /tmp/company_new; mkdir -p /tmp/company_new
tar xzf /root/company_dist.tgz -C /tmp/company_new
test -f /tmp/company_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }

# 2) 备份现有公司站（排除子站 self / arg_01）
TS=$(date +%Y%m%d_%H%M%S)
tar czf /root/company_backup_$TS.tgz --exclude=./self --exclude=./arg_01 . 2>/dev/null || true
echo "backup: /root/company_backup_$TS.tgz"

# 3) 只删公司站文件，保留 self / arg_01
find . -maxdepth 1 -mindepth 1 ! -name self ! -name arg_01 -exec rm -rf {} +
cp -a /tmp/company_new/. /var/www/briandolph/

echo "DEPLOYED company. index:"
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' index.html || true
ls
