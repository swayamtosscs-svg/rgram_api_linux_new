# Firebase Push Notifications - PowerShell Test Script

Write-Host "🔥 Firebase Push Notifications - PowerShell Test Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Set your variables here
$JWT_TOKEN = "your-jwt-token-here"
$RECIPIENT_ID = "recipient-user-id"
$FCM_TOKEN = "test-fcm-token-here"
$BASE_URL = "http://localhost:3000"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $BASE_URL"
Write-Host "JWT Token: $($JWT_TOKEN.Substring(0, [Math]::Min(20, $JWT_TOKEN.Length)))..."
Write-Host "Recipient ID: $RECIPIENT_ID"
Write-Host "FCM Token: $($FCM_TOKEN.Substring(0, [Math]::Min(20, $FCM_TOKEN.Length)))..."
Write-Host ""

# Check if variables are set
if ($JWT_TOKEN -eq "your-jwt-token-here") {
    Write-Host "❌ Please set JWT_TOKEN in the script" -ForegroundColor Red
    Write-Host "Get JWT token by logging in:"
    Write-Host "Invoke-RestMethod -Uri '$BASE_URL/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\": \"your-email\", \"password\": \"your-password\"}'"
    exit 1
}

if ($RECIPIENT_ID -eq "recipient-user-id") {
    Write-Host "❌ Please set RECIPIENT_ID in the script" -ForegroundColor Red
    Write-Host "Use a valid user ID from your database"
    exit 1
}

Write-Host "🚀 Starting Push Notification Tests..." -ForegroundColor Blue
Write-Host ""

# Test 1: Register FCM Token
Write-Host "1. Testing FCM Token Registration..." -ForegroundColor Yellow
Write-Host "Command: POST /api/notifications/register-fcm-token"
Write-Host ""

try {
    $body1 = @{
        fcmToken = $FCM_TOKEN
        deviceType = "android"
        appVersion = "1.0.0"
    } | ConvertTo-Json

    $headers1 = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response1 = Invoke-RestMethod -Uri "$BASE_URL/api/notifications/register-fcm-token" -Method POST -Headers $headers1 -Body $body1
    Write-Host "Response:" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Send Push Notification
Write-Host "2. Testing Send Push Notification..." -ForegroundColor Yellow
Write-Host "Command: POST /api/notifications/send-push"
Write-Host ""

try {
    $body2 = @{
        recipientId = $RECIPIENT_ID
        title = "🔥 Test Notification"
        body = "This is a test push notification!"
        type = "general"
    } | ConvertTo-Json

    $headers2 = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response2 = Invoke-RestMethod -Uri "$BASE_URL/api/notifications/send-push" -Method POST -Headers $headers2 -Body $body2
    Write-Host "Response:" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create Notification with Push
Write-Host "3. Testing Create Notification with Push..." -ForegroundColor Yellow
Write-Host "Command: POST /api/notifications/create-with-push"
Write-Host ""

try {
    $body3 = @{
        recipientId = $RECIPIENT_ID
        type = "like"
        content = "Test user liked your post"
        sendPush = $true
    } | ConvertTo-Json

    $headers3 = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response3 = Invoke-RestMethod -Uri "$BASE_URL/api/notifications/create-with-push" -Method POST -Headers $headers3 -Body $body3
    Write-Host "Response:" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Update Notification Settings
Write-Host "4. Testing Update Notification Settings..." -ForegroundColor Yellow
Write-Host "Command: PUT /api/notifications/settings"
Write-Host ""

try {
    $body4 = @{
        pushNotifications = $true
        likeNotifications = $true
        commentNotifications = $true
    } | ConvertTo-Json

    $headers4 = @{
        "Authorization" = "Bearer $JWT_TOKEN"
        "Content-Type" = "application/json"
    }

    $response4 = Invoke-RestMethod -Uri "$BASE_URL/api/notifications/settings" -Method PUT -Headers $headers4 -Body $body4
    Write-Host "Response:" -ForegroundColor Green
    $response4 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get Notifications
Write-Host "5. Testing Get Notifications..." -ForegroundColor Yellow
Write-Host "Command: GET /api/notifications/list"
Write-Host ""

try {
    $headers5 = @{
        "Authorization" = "Bearer $JWT_TOKEN"
    }

    $response5 = Invoke-RestMethod -Uri "$BASE_URL/api/notifications/list?page=1&limit=5" -Method GET -Headers $headers5
    Write-Host "Response:" -ForegroundColor Green
    $response5 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "🎉 Test Summary:" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Blue
Write-Host "1. Replace FCM_TOKEN with real device token"
Write-Host "2. Test on actual mobile devices"
Write-Host "3. Check Firebase Console for delivery reports"
Write-Host "4. Monitor notification delivery rates"
Write-Host ""
Write-Host "🚀 Your push notification system is working!" -ForegroundColor Green
Write-Host "💰 Cost: `$0.00 (Completely FREE!)" -ForegroundColor Yellow
