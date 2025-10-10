#!/bin/bash

# Test Cloudinary Deletion Fix
# This script tests the fixed Cloudinary deletion functionality

PAGE_ID="68bfcfa54850e28656f016db"  # Use your actual page ID
BASE_URL="http://localhost:3000/api/baba-pages"

echo "=== Testing Cloudinary Deletion Fix ==="
echo "Page ID: $PAGE_ID"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Create a post with image
echo "1. Creating post with image..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/$PAGE_ID/posts" \
  -F "content=Test post for Cloudinary deletion fix" \
  -F "media=@/path/to/test-image.jpg")

echo "Post created response:"
echo $POST_RESPONSE | jq '.'

# Extract post ID
POST_ID=$(echo $POST_RESPONSE | jq -r '.data._id')
echo "Created post ID: $POST_ID"

if [ "$POST_ID" = "null" ] || [ -z "$POST_ID" ]; then
  echo "Error: Could not create post or extract post ID"
  exit 1
fi

# Test 2: Get the post to verify Cloudinary URL
echo -e "\n2. Getting post to verify Cloudinary URL..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/$PAGE_ID/posts/$POST_ID")
echo "Post details:"
echo $GET_RESPONSE | jq '.'

# Extract media URLs and public IDs
MEDIA_URLS=$(echo $GET_RESPONSE | jq -r '.data.media[].url // empty')
PUBLIC_IDS=$(echo $GET_RESPONSE | jq -r '.data.media[].publicId // empty')

echo "Media URLs:"
echo $MEDIA_URLS
echo "Public IDs:"
echo $PUBLIC_IDS

# Test 3: Delete the post (this should delete from Cloudinary)
echo -e "\n3. Deleting post (should delete from Cloudinary)..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/$PAGE_ID/posts/$POST_ID")
echo "Delete response:"
echo $DELETE_RESPONSE | jq '.'

# Test 4: Verify post is deleted
echo -e "\n4. Verifying post is deleted..."
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/$PAGE_ID/posts/$POST_ID")
echo "Verify response:"
echo $VERIFY_RESPONSE | jq '.'

echo -e "\n=== Test Complete ==="
echo "Check your Cloudinary console to verify files are deleted from:"
echo "baba-pages/$PAGE_ID/posts/"

