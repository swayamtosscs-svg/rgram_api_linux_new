try {
    Write-Host "Testing VPS OTP API..." -ForegroundColor Green
    Write-Host "URL: http://103.14.120.163:8081/api/auth/forgot-password-otp" -ForegroundColor Cyan
    
    $body = @{
        email = "swayam.toss.cs@gmail.com"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/auth/forgot-password-otp" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "✅ OTP Request Successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ OTP Request Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*connection*") {
        Write-Host "🔧 Possible Issues:" -ForegroundColor Yellow
        Write-Host "1. VPS server might be down" -ForegroundColor White
        Write-Host "2. Port 8081 might be blocked" -ForegroundColor White
        Write-Host "3. API endpoints might not be deployed" -ForegroundColor White
    }
}
