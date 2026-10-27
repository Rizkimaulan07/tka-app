@echo off
title SiapTKA
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang.
  echo Silakan install Node.js dari https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Menginstall dependensi SiapTKA...
  call npm install
)

echo.
echo Menjalankan SiapTKA dan membuka browser...
echo Tutup jendela ini untuk menghentikan aplikasi.
echo.
call npm run dev -- --open
pause
