@echo off
chcp 65001 >nul
echo Dang cai dat Auto-Sync khoi dong cung Windows...
set "TARGET_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT=%TARGET_DIR%\UEH_Workhub_AutoSync.lnk"
set "VBS_SCRIPT=%~dp0start_autosync.vbs"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%VBS_SCRIPT%'; $s.WorkingDirectory = '%~dp0'; $s.Save()"

echo Da cai dat thanh cong! Tu gio moi khi mo may tinh, script dong bo GitHub se tu dong chay ngam.
echo.
echo Dang khoi dong Auto-Sync ngay bay gio...
cscript //nologo "%VBS_SCRIPT%"
echo Auto-Sync da bat dau chay ngam!
pause
