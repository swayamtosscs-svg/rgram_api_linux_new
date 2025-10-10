#!/bin/bash

# Test OTP API
echo "🧪 Testing OTP Email API..."

# Configuration
BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"  # Replace with your test email

echo "📧 Sending OTP to: $TEST_EMAIL"

# Send OTP
curl -X POST "$BASE_URL/api/auth/otp/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"purpose\": \"signup\"
  }" \
  | jq '.'

echo ""
echo "✅ Check your email for the OTP!"
echo "💡 The email should now show only the OTP without HTML comments"
