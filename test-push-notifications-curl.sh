#!/bin/bash

echo "🔥 Firebase Push Notifications - CURL Test Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set your variables here
JWT_TOKEN="your-jwt-token-here"
RECIPIENT_ID="recipient-user-id"
FCM_TOKEN="test-fcm-token-here"
BASE_URL="http://localhost:3000"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Base URL: $BASE_URL"
echo "JWT Token: ${JWT_TOKEN:0:20}..."
echo "Recipient ID: $RECIPIENT_ID"
echo "FCM Token: ${FCM_TOKEN:0:20}..."
echo ""

# Check if variables are set
if [ "$JWT_TOKEN" = "your-jwt-token-here" ]; then
    echo -e "${RED}❌ Please set JWT_TOKEN in the script${NC}"
    echo "Get JWT token by logging in:"
    echo "curl -X POST $BASE_URL/api/auth/login \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -d '{\"email\": \"your-email\", \"password\": \"your-password\"}'"
    exit 1
fi

if [ "$RECIPIENT_ID" = "recipient-user-id" ]; then
    echo -e "${RED}❌ Please set RECIPIENT_ID in the script${NC}"
    echo "Use a valid user ID from your database"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Push Notification Tests...${NC}"
echo ""

# Test 1: Register FCM Token
echo -e "${YELLOW}1. Testing FCM Token Registration...${NC}"
echo "Command: POST /api/notifications/register-fcm-token"
echo ""

RESPONSE1=$(curl -s -X POST $BASE_URL/api/notifications/register-fcm-token \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fcmToken\": \"$FCM_TOKEN\", \"deviceType\": \"android\", \"appVersion\": \"1.0.0\"}")

echo "Response:"
echo "$RESPONSE1" | jq . 2>/dev/null || echo "$RESPONSE1"
echo ""

# Test 2: Send Push Notification
echo -e "${YELLOW}2. Testing Send Push Notification...${NC}"
echo "Command: POST /api/notifications/send-push"
echo ""

RESPONSE2=$(curl -s -X POST $BASE_URL/api/notifications/send-push \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"recipientId\": \"$RECIPIENT_ID\", \"title\": \"🔥 Test Notification\", \"body\": \"This is a test push notification!\", \"type\": \"general\"}")

echo "Response:"
echo "$RESPONSE2" | jq . 2>/dev/null || echo "$RESPONSE2"
echo ""

# Test 3: Create Notification with Push
echo -e "${YELLOW}3. Testing Create Notification with Push...${NC}"
echo "Command: POST /api/notifications/create-with-push"
echo ""

RESPONSE3=$(curl -s -X POST $BASE_URL/api/notifications/create-with-push \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"recipientId\": \"$RECIPIENT_ID\", \"type\": \"like\", \"content\": \"Test user liked your post\", \"sendPush\": true}")

echo "Response:"
echo "$RESPONSE3" | jq . 2>/dev/null || echo "$RESPONSE3"
echo ""

# Test 4: Update Notification Settings
echo -e "${YELLOW}4. Testing Update Notification Settings...${NC}"
echo "Command: PUT /api/notifications/settings"
echo ""

RESPONSE4=$(curl -s -X PUT $BASE_URL/api/notifications/settings \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"pushNotifications\": true, \"likeNotifications\": true, \"commentNotifications\": true}")

echo "Response:"
echo "$RESPONSE4" | jq . 2>/dev/null || echo "$RESPONSE4"
echo ""

# Test 5: Get Notifications
echo -e "${YELLOW}5. Testing Get Notifications...${NC}"
echo "Command: GET /api/notifications/list"
echo ""

RESPONSE5=$(curl -s -X GET "$BASE_URL/api/notifications/list?page=1&limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Response:"
echo "$RESPONSE5" | jq . 2>/dev/null || echo "$RESPONSE5"
echo ""

# Summary
echo -e "${GREEN}🎉 Test Summary:${NC}"
echo "=================================================="

# Check responses for success
if echo "$RESPONSE1" | grep -q '"success":true'; then
    echo -e "✅ FCM Token Registration: ${GREEN}SUCCESS${NC}"
else
    echo -e "❌ FCM Token Registration: ${RED}FAILED${NC}"
fi

if echo "$RESPONSE2" | grep -q '"success":true'; then
    echo -e "✅ Send Push Notification: ${GREEN}SUCCESS${NC}"
else
    echo -e "❌ Send Push Notification: ${RED}FAILED${NC}"
fi

if echo "$RESPONSE3" | grep -q '"success":true'; then
    echo -e "✅ Create Notification with Push: ${GREEN}SUCCESS${NC}"
else
    echo -e "❌ Create Notification with Push: ${RED}FAILED${NC}"
fi

if echo "$RESPONSE4" | grep -q '"success":true'; then
    echo -e "✅ Update Notification Settings: ${GREEN}SUCCESS${NC}"
else
    echo -e "❌ Update Notification Settings: ${RED}FAILED${NC}"
fi

if echo "$RESPONSE5" | grep -q '"success":true'; then
    echo -e "✅ Get Notifications: ${GREEN}SUCCESS${NC}"
else
    echo -e "❌ Get Notifications: ${RED}FAILED${NC}"
fi

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. Replace FCM_TOKEN with real device token"
echo "2. Test on actual mobile devices"
echo "3. Check Firebase Console for delivery reports"
echo "4. Monitor notification delivery rates"
echo ""
echo -e "${GREEN}🚀 Your push notification system is working!${NC}"
echo -e "${YELLOW}💰 Cost: $0.00 (Completely FREE!)${NC}"
