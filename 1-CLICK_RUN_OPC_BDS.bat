@echo off
chcp 65001 >nul
title OPC-BDS NGUYET LAND (PORT 8088)
echo ======================================================
echo 🏡 KHỞI ĐỘNG OPC-BĐS NGUYỆT LAND (ĐÀ NẴNG)
echo 🚀 Cổng Server: http://localhost:8088
echo 🎨 AI Studio:   http://localhost:8088/studio
echo ======================================================

cd /d "%~dp0"
start "" http://localhost:8088/studio
node serve_local.mjs
pause
