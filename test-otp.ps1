# Test OTP functionality
Write-Host "🧪 Testing OTP functionality..." -ForegroundColor Green

try {
    # Test 1: Send OTP to phone
    Write-Host "1️⃣ Sending OTP to phone..." -ForegroundColor Yellow
    
    $body = @{
        phone = "9555363996"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test-phone-otp" -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "✅ Send Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success -and $response.data.otp) {
        $otpCode = $response.data.otp
        Write-Host "`n📱 OTP Code: $otpCode`n" -ForegroundColor Cyan
        
        # Test 2: Verify OTP
        Write-Host "2️⃣ Verifying OTP..." -ForegroundColor Yellow
        
        $verifyBody = @{
            phone = "9555363996"
            phoneCode = $otpCode
            purpose = "login"
        } | ConvertTo-Json
        
        $verifyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify-otp" -Method POST -ContentType "application/json" -Body $verifyBody
        
        Write-Host "✅ Verify Response:" -ForegroundColor Green
        $verifyResponse | ConvertTo-Json -Depth 10
    }
    
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
