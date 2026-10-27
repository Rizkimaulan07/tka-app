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
echo [1/3] Menyiapkan PostgreSQL lokal...
call npm run db:start
if errorlevel 1 (
  echo.
  echo Database gagal dijalankan. Periksa pesan di atas.
  pause
  exit /b 1
)

echo.
echo [2/3] Menyiapkan tabel dan data awal...
call npm run db:setup
if errorlevel 1 (
  echo.
  echo Penyiapan database gagal. Periksa pesan di atas.
  pause
  exit /b 1
)

echo.
echo [3/3] Menjalankan web + API dan membuka browser...
echo Tutup jendela ini untuk menghentikan aplikasi.
echo.
call npm run dev:open
pause
