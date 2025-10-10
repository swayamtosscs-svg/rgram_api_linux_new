# PowerShell script to fix EMAIL_PASS in .env.local
# Run this script to update your email configuration

Write-Host "🔧 EMAIL SERVICE FIX SCRIPT" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
    
    # Read current content
    $content = Get-Content ".env.local"
    
    # Check current EMAIL_PASS
    $emailPassLine = $content | Where-Object { $_ -match "EMAIL_PASS=" }
    Write-Host "📋 Current EMAIL_PASS: $emailPassLine" -ForegroundColor Yellow
    
    if ($emailPassLine -match "YOUR_GMAIL_APP_PASSWORD_HERE") {
        Write-Host "🚨 ISSUE: EMAIL_PASS is still a placeholder!" -ForegroundColor Red
        Write-Host ""
        Write-Host "📧 TO FIX THIS:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://myaccount.google.com/" -ForegroundColor White
        Write-Host "2. Click 'Security' → '2-Step Verification' → 'App passwords'" -ForegroundColor White
        Write-Host "3. Generate a new app password for 'Mail'" -ForegroundColor White
        Write-Host "4. Copy the 16-character password" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 QUICK FIX:" -ForegroundColor Cyan
        Write-Host "Run this command to open .env.local:" -ForegroundColor White
        Write-Host "notepad .env.local" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Then replace:" -ForegroundColor White
        Write-Host "EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE" -ForegroundColor Red
        Write-Host "with:" -ForegroundColor White
        Write-Host "EMAIL_PASS=your_16_character_password" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Or enter your password below to update automatically:" -ForegroundColor Cyan
        
        $password = Read-Host "Enter your Gmail app password (16 characters)"
        
        if ($password -and $password.Length -eq 16) {
            # Update the content
            $newContent = $content -replace "EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE", "EMAIL_PASS=$password"
            $newContent | Set-Content ".env.local"
            Write-Host "✅ EMAIL_PASS updated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🧪 Testing email service..." -ForegroundColor Cyan
            Write-Host "Run: node test-email-service.js" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Invalid password format. Please enter a 16-character password." -ForegroundColor Red
        }
    } else {
        Write-Host "✅ EMAIL_PASS appears to be set correctly!" -ForegroundColor Green
        Write-Host "🧪 Testing email service..." -ForegroundColor Cyan
        Write-Host "Run: node test-email-service.js" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 TEST COMMANDS:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "1. Test email service: node test-email-service.js" -ForegroundColor White
Write-Host "2. Test API: Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/forgot-password' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"email\":\"swayam121july@gmail.com\"}'" -ForegroundColor White
Write-Host ""
Write-Host "✅ After fixing EMAIL_PASS, restart your server and test the API!" -ForegroundColor Green
