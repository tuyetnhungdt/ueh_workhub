@echo off
chcp 65001 >nul
echo ========================================================
echo        UEH WORKHUB - DEPLOY LEN PRODUCTION (VERCEL)     
echo ========================================================
cd /d "%~dp0"

echo Dang build va deploy du an len Vercel Production...
call npx --yes vercel --prod --yes

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo  DEPLOY THANH CONG!
    echo  Website chinh: https://ueh-workhub.vercel.app
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  CO LOI KHI DEPLOY! Vui long kiem tra lai thong tin Vercel.
    echo ========================================================
)

pause
