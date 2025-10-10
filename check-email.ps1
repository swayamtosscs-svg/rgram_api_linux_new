# Simple Email Fix Script
Write-Host "🔧 EMAIL SERVICE FIX" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

# Check current EMAIL_PASS
$content = Get-Content ".env.local"
$emailPassLine = $content | Where-Object { $_ -match "EMAIL_PASS=" }
Write-Host "Current EMAIL_PASS: $emailPassLine" -ForegroundColor Yellow

if ($emailPassLine -match "YOUR_GMAIL_APP_PASSWORD_HERE") {
    Write-Host "🚨 EMAIL_PASS needs to be updated!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📧 Get your Gmail app password from:" -ForegroundColor Cyan
    Write-Host "https://myaccount.google.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Then run: notepad .env.local" -ForegroundColor Yellow
    Write-Host "Replace: EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE" -ForegroundColor Red
    Write-Host "With: EMAIL_PASS=your_16_character_password" -ForegroundColor Green
} else {
    Write-Host "✅ EMAIL_PASS looks good!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Test with: node test-email-service.js" -ForegroundColor Cyan
