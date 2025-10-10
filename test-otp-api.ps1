# Test OTP API - PowerShell Version
Write-Host "🧪 Testing OTP Email API..." -ForegroundColor Cyan

# Configuration
$BASE_URL = "http://localhost:3000"
$TEST_EMAIL = "test@example.com"  # Replace with your test email

Write-Host "📧 Sending OTP to: $TEST_EMAIL" -ForegroundColor Yellow

# Send OTP
$body = @{
    email = $TEST_EMAIL
    purpose = "signup"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/otp/send" -Method POST -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 3
    Write-Host "✅ Check your email for the OTP!" -ForegroundColor Green
    Write-Host "💡 The email should now show only the OTP without HTML comments" -ForegroundColor Blue
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
