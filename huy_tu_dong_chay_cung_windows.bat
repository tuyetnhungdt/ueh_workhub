@echo off
chcp 65001 >nul
echo Dang go bo Auto-Sync khoi dong cung Windows...
set "TARGET_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%TARGET_DIR%\UEH_Workhub_AutoSync.lnk"

if exist "%SHORTCUT%" (
    del "%SHORTCUT%"
    echo Da xoa phim tat trong thu muc Startup.
) else (
    echo Khong tim thay phim tat trong Startup.
)

call "%~dp0stop_autosync.bat"
