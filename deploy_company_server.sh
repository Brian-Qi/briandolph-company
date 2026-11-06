#!/bin/sh
# 公司站部署（独立域名根目录，不动个人站 / ARG）
# 服务器前置：/root/company_dist.tgz
set -e
TARGET=/var/www/briandolph-company

rm -rf /tmp/company_new
mkdir -p /tmp/company_new
tar xzf /root/company_dist.tgz -C /tmp/company_new
test -f /tmp/company_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }

TS=$(date +%Y%m%d_%H%M%S)
if [ -d "$TARGET" ]; then
  tar czf /root/company_backup_$TS.tgz -C "$TARGET" . 2>/dev/null || true
  echo "backup: /root/company_backup_$TS.tgz"
fi

rm -rf "$TARGET"
mkdir -p "$TARGET"
cp -a /tmp/company_new/. "$TARGET"/

echo "DEPLOYED company to $TARGET"
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$TARGET/index.html" || true
ls "$TARGET"
