#!/bin/sh
# 公司站部署到线上根目录 /var/www/briandolph
# 2026-11-16 更新：个人站/ARG 已迁到独立目录（/var/www/self、/var/www/works/arg/arg_01），
# 主站目录里不再保留 self/、arg_01/ 副本，所以去掉了旧的保护与拒绝逻辑。
# 服务器前置：/root/company_dist.tgz
set -e
ROOT=/var/www/briandolph

rm -rf /tmp/company_new
mkdir -p /tmp/company_new
tar xzf /root/company_dist.tgz -C /tmp/company_new
test -f /tmp/company_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }
# 防误部署：包里不该出现子站目录（构建卡口已经拦过一次，这里再兜一次）
if tar tzf /root/company_dist.tgz | grep -qE '^\./(self|arg_01)/'; then
  echo "ERR: 包里带子站目录，拒绝部署"
  exit 1
fi

TS=$(date +%Y%m%d_%H%M%S)
tar czf /root/company_backup_$TS.tgz -C "$ROOT" . 2>/dev/null || true
echo "backup: /root/company_backup_$TS.tgz"

find "$ROOT" -maxdepth 1 -mindepth 1 -exec rm -rf {} +
cp -a /tmp/company_new/. "$ROOT"/

# 权限归一：站点只需读，禁止其他人写（历史上出现过 777，任何进程都能改首页）
chmod 755 "$ROOT"
find "$ROOT" -maxdepth 1 -mindepth 1 -exec chmod -R u+rwX,go+rX,go-w {} +

echo "DEPLOYED company to $ROOT"
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' "$ROOT/index.html" || true
ls "$ROOT"
