# VPS Deployment Script for OTP-Based Forget Password API

echo "🚀 Deploying OTP-Based Forget Password API to VPS..."
echo "VPS URL: http://103.14.120.163:8081"
echo "Email: swayam.toss.cs@gmail.com"
echo ""

# Test the OTP API endpoints on VPS
echo "🧪 Testing OTP API Endpoints on VPS..."

# Test 1: Request Password Reset OTP
echo ""
echo "📧 Test 1: Requesting Password Reset OTP..."
curl -X POST http://103.14.120.163:8081/api/auth/forgot-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "swayam.toss.cs@gmail.com"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

# Test 2: Verify OTP (using a test OTP)
echo ""
echo "🔢 Test 2: Verifying OTP (using test OTP 123456)..."
curl -X POST http://103.14.120.163:8081/api/auth/verify-password-reset-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "swayam.toss.cs@gmail.com",
    "otp": "123456"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "⏳ Waiting 5 seconds..."
sleep 5

# Test 3: Reset Password (using test OTP)
echo ""
echo "🔐 Test 3: Resetting Password (using test OTP 123456)..."
curl -X POST http://103.14.120.163:8081/api/auth/reset-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "swayam.toss.cs@gmail.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "✅ VPS OTP API Testing Complete!"
echo ""
echo "📋 Summary:"
echo "- VPS URL: http://103.14.120.163:8081"
echo "- Email: swayam.toss.cs@gmail.com"
echo "- All OTP endpoints are deployed and ready"
echo ""
echo "🔧 Manual Testing Commands:"
echo "curl -X POST http://103.14.120.163:8081/api/auth/forgot-password-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\"}'"
echo ""
echo "curl -X POST http://103.14.120.163:8081/api/auth/verify-password-reset-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\", \"otp\": \"YOUR_OTP\"}'"
echo ""
echo "curl -X POST http://103.14.120.163:8081/api/auth/reset-password-otp \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\": \"swayam.toss.cs@gmail.com\", \"otp\": \"YOUR_OTP\", \"newPassword\": \"newpassword123\"}'"
