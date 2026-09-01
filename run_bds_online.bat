@echo off
title OPC BDS — NGUYET LAND ONLINE 24/7 (bds.breaths.live)
color 0E

echo ========================================================
echo   🏡 NGUYET LAND (OPC-BDS) — BAT DONG SAN DONG TIEN DA NANG
echo   Domain Online: https://bds.breaths.live
echo   Local Web:     http://localhost:8088/
echo   AI Studio:     http://localhost:8088/studio
echo   News Portal:   http://localhost:8088/news
echo ========================================================
echo.

echo [1/3] Khoi dong Web Server port 8088 & Autonomous 24/7 Engine...
start "OPC-BDS Web Server" /min node "%~dp0serve_local.mjs"

timeout /t 3 >nul

echo [2/3] Chay kiem thu toan dien E2E Test Suite A-Z...
node "%~dp0scripts\run_full_az_test_and_deploy.mjs"

echo.
echo [3/3] Mo trinh duyet truc tiep he thong...
start http://localhost:8088/

echo.
echo ========================================================
echo   DA KHOI DONG THANH CONG HE THONG NGUYET LAND!
echo ========================================================
pause
