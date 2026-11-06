#!/bin/sh
# 已停用，保留作历史参考。
# 线上根当前为公司站（见 部署与备份_2026-11-05.md）。
# 请使用：
#   deploy_company_root.sh        线上根 /var/www/briandolph（保留 self / arg_01）
#   deploy_company_server.sh      独立目录 /var/www/briandolph-company（子域方案）
echo "REFUSED: deploy_company.sh 已停用。"
echo "请使用 deploy_company_root.sh 或 deploy_company_server.sh。"
exit 1
