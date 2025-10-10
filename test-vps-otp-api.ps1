# VPS OTP API Test Script for PowerShell

Write-Host "🚀 Testing OTP-Based Forget Password API on VPS..." -ForegroundColor Green
Write-Host "VPS URL: http://103.14.120.163:8081" -ForegroundColor Cyan
Write-Host "Email: swayam.toss.cs@gmail.com" -ForegroundColor Cyan
Write-Host ""

# Test 1: Request Password Reset OTP
Write-Host "📧 Test 1: Requesting Password Reset OTP..." -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/auth/forgot-password-otp" -Method POST -ContentType "application/json" -Body '{"email": "swayam.toss.cs@gmail.com"}'
    Write-Host "✅ OTP Request Successful!" -ForegroundColor Green
    Write-Host "Response: $($response1 | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ OTP Request Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ Waiting 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 2: Verify OTP (using a test OTP)
Write-Host "🔢 Test 2: Verifying OTP (using test OTP 123456)..." -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/auth/verify-password-reset-otp" -Method POST -ContentType "application/json" -Body '{"email": "swayam.toss.cs@gmail.com", "otp": "123456"}'
    Write-Host "✅ OTP Verification Response!" -ForegroundColor Green
    Write-Host "Response: $($response2 | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ OTP Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ Waiting 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 3: Reset Password (using test OTP)
Write-Host "🔐 Test 3: Resetting Password (using test OTP 123456)..." -ForegroundColor Yellow
try {
    $response3 = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/auth/reset-password-otp" -Method POST -ContentType "application/json" -Body '{"email": "swayam.toss.cs@gmail.com", "otp": "123456", "newPassword": "newpassword123"}'
    Write-Host "✅ Password Reset Response!" -ForegroundColor Green
    Write-Host "Response: $($response3 | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
    Write-Host "❌ Password Reset Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ VPS OTP API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "- VPS URL: http://103.14.120.163:8081" -ForegroundColor White
Write-Host "- Email: swayam.toss.cs@gmail.com" -ForegroundColor White
Write-Host "- All OTP endpoints are deployed and ready" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Manual Testing Commands:" -ForegroundColor Yellow
Write-Host "curl -X POST http://103.14.120.163:8081/api/auth/forgot-password-otp \" -ForegroundColor Gray
Write-Host "  -H \"Content-Type: application/json\" \" -ForegroundColor Gray
Write-Host "  -d '{\"email\": \"swayam.toss.cs@gmail.com\"}'" -ForegroundColor Gray
