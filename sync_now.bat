@echo off
chcp 65001 >nul
echo ========================================================
echo        UEH WORKHUB - DONG BO DU LIEU LEN GITHUB        
echo ========================================================
cd /d "%~dp0"

echo [1/3] Dang kiem tra thay doi trong thu muc...
for /f %%i in ('git status --porcelain') do set HAS_CHANGES=1

if not defined HAS_CHANGES (
    echo.
    echo Khong co thay doi nao moi de day len GitHub.
    echo Thu muc da o trang thai moi nhat!
    echo ========================================================
    pause
    exit /b 0
)

echo [2/3] Dang dong goi cac thay doi...
git add -A

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%

git commit -m "Manual sync: %TIMESTAMP%"

echo [3/3] Dang day code len GitHub (origin main)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  THANH CONG! Toan bo thay doi da duoc day len GitHub!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  CO LOI XAY RA! Vui long kiem tra ket noi hoac quyen GitHub.
    echo ========================================================
)

pause
