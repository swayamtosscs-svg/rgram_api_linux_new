#!/bin/bash

# Test Posts Cloudinary Integration
# Make sure to replace PAGE_ID with your actual page ID

PAGE_ID="64a1b2c3d4e5f6789012345"
BASE_URL="http://localhost:3000/api/baba-pages"

echo "=== Testing Posts Cloudinary Integration ==="
echo "Page ID: $PAGE_ID"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Create post with text only
echo "1. Creating post with text only..."
curl -X POST "$BASE_URL/$PAGE_ID/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post with text only - Cloudinary integration test"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""

# Test 2: Create post with image (replace with actual image path)
echo "2. Creating post with image..."
echo "Note: Replace /path/to/test-image.jpg with actual image path"
# curl -X POST "$BASE_URL/$PAGE_ID/posts" \
#   -F "content=Test post with Cloudinary image upload" \
#   -F "media=@/path/to/test-image.jpg" \
#   -w "\nHTTP Status: %{http_code}\n" \
#   -s | jq '.'

echo "Skipping image test - please provide actual image path"
echo ""

# Test 3: Get all posts
echo "3. Getting all posts..."
curl -X GET "$BASE_URL/$PAGE_ID/posts" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""

# Test 4: Test with invalid page ID
echo "4. Testing with invalid page ID..."
curl -X GET "$BASE_URL/invalid-id/posts" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""

# Test 5: Test with missing content
echo "5. Testing with missing content..."
curl -X POST "$BASE_URL/$PAGE_ID/posts" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "=== Test Complete ==="
echo ""
echo "To test with actual files, run:"
echo "curl -X POST \"$BASE_URL/$PAGE_ID/posts\" \\"
echo "  -F \"content=Test post with image\" \\"
echo "  -F \"media=@/path/to/your-image.jpg\""
