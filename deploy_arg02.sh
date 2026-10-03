#!/bin/sh
# ARG 第二部部署（服务器端）· /var/www/briandolph/arg_02
# 前置：把 arg02_dist.tar.gz 传到 /root/
set -e
cd /var/www/briandolph

# 1) 临时目录校验
rm -rf /tmp/arg02_new; mkdir -p /tmp/arg02_new
tar xzf /root/arg02_dist.tar.gz -C /tmp/arg02_new
test -f /tmp/arg02_new/index.html || { echo "ERR: 包内无 index.html"; exit 1; }

# 2) 备份旧 arg_02
TS=$(date +%Y%m%d_%H%M%S)
[ -d arg_02 ] && tar czf /root/arg02_backup_$TS.tgz arg_02 2>/dev/null || true
echo "backup: /root/arg02_backup_$TS.tgz"

# 3) 替换
rm -rf arg_02; mkdir -p arg_02
cp -a /tmp/arg02_new/. arg_02/

echo "DEPLOYED arg_02. index:"
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' arg_02/index.html || true
ls arg_02
