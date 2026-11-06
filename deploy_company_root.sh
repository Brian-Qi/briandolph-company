#!/bin/sh
# 公司站部署到线上根目录 /var/www/briandolph
# 依据 2026-11-05 台账：线上根当前为公司站，个人站 /self/、ARG /arg_01/ 必须保留。
# 服务器前置：/root/company_dist.tgz
set -e
ROOT=/var/www/briandolph

rm -rf /tmp/company_new
mkdir -p /tmp/company_new
tar xzf /root/company_dist.tgz -C /tmp/company_new
test -f /tmp/company_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }
test -d "$ROOT/self" || { echo "ERR: 缺少 $ROOT/self，拒绝部署"; exit 1; }
test -d "$ROOT/arg_01" || { echo "ERR: 缺少 $ROOT/arg_01，拒绝部署"; exit 1; }

TS=$(date +%Y%m%d_%H%M%S)
tar czf /root/company_backup_$TS.tgz -C "$ROOT" --exclude=./self --exclude=./arg_01 . 2>/dev/null || true
echo "backup: /root/company_backup_$TS.tgz"

find "$ROOT" -maxdepth 1 -mindepth 1 ! -name self ! -name arg_01 -exec rm -rf {} +
cp -a /tmp/company_new/. "$ROOT"/

echo "DEPLOYED company to $ROOT (self/arg_01 preserved)"
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$ROOT/index.html" || true
ls "$ROOT"
