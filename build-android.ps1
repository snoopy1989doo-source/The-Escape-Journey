Write-Host "[1/4] Syncing web files to www/ ..." -ForegroundColor Cyan
if (!(Test-Path "$PSScriptRoot\www")) { New-Item -ItemType Directory -Path "$PSScriptRoot\www" | Out-Null }
Copy-Item -Force "$PSScriptRoot\index.html" "$PSScriptRoot\www\index.html"
Copy-Item -Force "$PSScriptRoot\manifest.json" "$PSScriptRoot\www\manifest.json"
Copy-Item -Force "$PSScriptRoot\sw.js" "$PSScriptRoot\www\sw.js"
Copy-Item -Force "$PSScriptRoot\app-logo.png" "$PSScriptRoot\www\app-logo.png"
if (Test-Path "$PSScriptRoot\assets") {
    Copy-Item -Recurse -Force "$PSScriptRoot\assets" "$PSScriptRoot\www\"
}

Write-Host "[2/4] Capacitor Copy Android..." -ForegroundColor Cyan
npx cap copy android

Write-Host "[3/4] Running Gradle Assemble Debug APK..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\android"
cmd.exe /c "gradlew.bat assembleDebug"
Pop-Location

$sourceApk = "C:\temp\escape_journey_build\android\app\outputs\apk\debug\app-debug.apk"
if (Test-Path $sourceApk) {
    if (!(Test-Path "$PSScriptRoot\apk")) { New-Item -ItemType Directory -Path "$PSScriptRoot\apk" | Out-Null }
    Copy-Item -Force $sourceApk "$PSScriptRoot\The-Escape-Journey.apk"
    Copy-Item -Force $sourceApk "$PSScriptRoot\apk\The-Escape-Journey.apk"
    Write-Host "[SUCCESS] APK built successfully at:" -ForegroundColor Green
    Write-Host "   - $PSScriptRoot\The-Escape-Journey.apk" -ForegroundColor Yellow
    Write-Host "   - $PSScriptRoot\apk\The-Escape-Journey.apk" -ForegroundColor Yellow
} else {
    Write-Host "[ERROR] Output APK file not found." -ForegroundColor Red
}