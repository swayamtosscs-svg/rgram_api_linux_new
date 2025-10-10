# VPS Environment Setup Script for Forget Password (PowerShell)

Write-Host "🚀 Setting up VPS environment for Forget Password System..." -ForegroundColor Green

# Create .env.local file
$envContent = @"
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rgram

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@rgram.com

# App URL - VPS IP Address
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081

# Node Environment
NODE_ENV=production
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host "📧 Email reset links will now use: http://103.14.120.163:8081" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update EMAIL_USER and EMAIL_PASS with your actual email credentials" -ForegroundColor White
Write-Host "2. Restart your server: npm run dev" -ForegroundColor White
Write-Host "3. Test the forget password API" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test command:" -ForegroundColor Cyan
Write-Host 'Invoke-WebRequest -Uri "http://103.14.120.163:8081/api/auth/forgot-password" -Method POST -Headers @{"Content-Type"="application/json"} -Body ''{"email":"test@example.com"}''' -ForegroundColor White
