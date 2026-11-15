# PowerShell Auto-Sync Script for ueh_workhub
param(
    [int]$IntervalSeconds = 30,
    [int]$DebounceSeconds = 10
)

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

$LogFile = Join-Path $ProjectDir ".git\auto_sync.log"

function Write-SyncLog($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] $message"
    Write-Output $entry
    try {
        Add-Content -Path $LogFile -Value $entry -ErrorAction SilentlyContinue
    } catch {}
}

Write-SyncLog "Auto-sync service started for $ProjectDir. Interval: ${IntervalSeconds}s."

while ($true) {
    try {
        # Check if there are modified, added or deleted files
        $status = git status --porcelain 2>&1
        if ($status) {
            Write-SyncLog "Detected changes. Waiting ${DebounceSeconds}s before syncing..."
            Start-Sleep -Seconds $DebounceSeconds

            # Stage all changes
            git add -A

            # Verify if there is anything to commit
            $staged = git status --porcelain 2>&1
            if ($staged) {
                $commitTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $commitMsg = "Auto-sync: $commitTime"
                $commitOut = git commit -m $commitMsg 2>&1
                Write-SyncLog "Committed: $commitMsg"

                # Push to GitHub
                $pushOut = git push origin main 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-SyncLog "Push successful to origin/main"
                } else {
                    Write-SyncLog "Push failed: $pushOut"
                }

                # Auto-deploy to Vercel Production
                Write-SyncLog "Deploying to Vercel Production (https://ueh-workhub.vercel.app)..."
                $deployOut = npx --yes vercel --prod --yes 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-SyncLog "Deploy successful: https://ueh-workhub.vercel.app"
                } else {
                    Write-SyncLog "Deploy failed: $deployOut"
                }

                # Deploy to Vercel Production
                Write-SyncLog "Deploying to Vercel Production (https://ueh-workhub.vercel.app)..."
                $deployOut = npx --yes vercel --prod --yes 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-SyncLog "Vercel deploy successful: https://ueh-workhub.vercel.app"
                } else {
                    Write-SyncLog "Vercel deploy failed: $deployOut"
                }
            }
        }
    } catch {
        Write-SyncLog "Error during sync cycle: $_"
    }

    Start-Sleep -Seconds $IntervalSeconds
}
