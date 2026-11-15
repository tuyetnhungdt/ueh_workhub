@echo off
chcp 65001 >nul
echo Dang tat tien trinh Auto-Sync chay ngam...
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*scripts\auto_sync.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Da tat tien trinh ID: ' + $_.ProcessId) }"
echo Hoan tat! Auto-Sync da dung.
pause
