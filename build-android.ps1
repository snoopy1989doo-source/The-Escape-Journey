# Script สำหรับซิงค์ไฟล์ index.html เข้าสู่ Android Project
Write-Host "🔄 กำลังซิงค์ index.html เข้าสู่ android/app/src/main/assets/..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\android\app\src\main\assets" | Out-Null
Copy-Item -Force "$PSScriptRoot\index.html" "$PSScriptRoot\android\app\src\main\assets\index.html"
Write-Host "✅ ซิงค์เสร็จสิ้น! พร้อมเปิดโฟลเดอร์ android ด้วย Android Studio เพื่อรันหรือ Build APK" -ForegroundColor Green
