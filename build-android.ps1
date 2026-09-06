$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    Write-Host '[1/4] Syncing web files ...' -ForegroundColor Cyan
    node sync-www.js
    if ($LASTEXITCODE -ne 0) { throw 'Web sync failed.' }

    Write-Host '[2/4] Copying Capacitor Android assets ...' -ForegroundColor Cyan
    & "$PSScriptRoot\node_modules\.bin\cap.cmd" copy android
    if ($LASTEXITCODE -ne 0) { throw 'Capacitor copy failed.' }

    Write-Host '[3/4] Building Debug APK (JDK 21 and Android SDK required) ...' -ForegroundColor Cyan
    Push-Location "$PSScriptRoot\android"
    try {
        & '.\gradlew.bat' assembleDebug --no-daemon
        if ($LASTEXITCODE -ne 0) { throw 'Gradle build failed; existing APKs were not replaced.' }
    } finally { Pop-Location }

    # The repository redirects Windows Gradle outputs to C:/temp to avoid path issues.
    $candidates = @(
        'C:\temp\escape_journey_build\android\app\outputs\apk\debug\app-debug.apk',
        "$PSScriptRoot\android\app\build\outputs\apk\debug\app-debug.apk"
    )
    $sourceApk = $candidates | Where-Object { Test-Path -LiteralPath $_ } |
        Get-Item | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if (!$sourceApk) { throw 'Gradle finished but no APK output was found.' }
    # Verify the embedded renderer matches this checkout, including incremental builds.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($sourceApk.FullName)
    try {
        $entry = $archive.GetEntry('assets/public/assets/pixel-room.js')
        if (!$entry) { throw 'Built APK is missing the pixel renderer.' }
        $reader = [System.IO.StreamReader]::new($entry.Open())
        try { $embedded = $reader.ReadToEnd() } finally { $reader.Dispose() }
        $expected = [System.IO.File]::ReadAllText("$PSScriptRoot\assets\pixel-room.js")
        if ($embedded -cne $expected) { throw 'Built APK contains an outdated pixel renderer.' }
    } finally { $archive.Dispose() }

    Write-Host '[4/4] Saving verified APK ...' -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\apk" | Out-Null
    Copy-Item -LiteralPath $sourceApk.FullName -Destination "$PSScriptRoot\The-Escape-Journey.apk" -Force
    Copy-Item -LiteralPath $sourceApk.FullName -Destination "$PSScriptRoot\apk\The-Escape-Journey.apk" -Force
    Write-Host "[SUCCESS] $PSScriptRoot\apk\The-Escape-Journey.apk" -ForegroundColor Green
} finally { Pop-Location }
