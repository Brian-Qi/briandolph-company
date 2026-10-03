#!/bin/sh
# 个人站部署（服务器端）· 子路径 /var/www/briandolph/self
# 前置：把 personal_dist.tgz 传到 /root/
set -e
cd /var/www/briandolph

# 1) 临时目录校验
rm -rf /tmp/self_new; mkdir -p /tmp/self_new
tar xzf /root/personal_dist.tgz -C /tmp/self_new
test -f /tmp/self_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }

# 2) 备份旧 self
TS=$(date +%Y%m%d_%H%M%S)
[ -d self ] && tar czf /root/self_backup_$TS.tgz self 2>/dev/null || true
echo "backup: /root/self_backup_$TS.tgz"

# 3) 替换
rm -rf self; mkdir -p self
cp -a /tmp/self_new/. self/

echo "DEPLOYED self. index:"
ls self
