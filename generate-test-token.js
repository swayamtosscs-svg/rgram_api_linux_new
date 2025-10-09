const jwt = require('jsonwebtoken');

// Generate a test JWT token
function generateTestToken(userId) {
  const JWT_SECRET = 'your_jwt_secret_key_here_make_it_long_and_secure_at_least_32_characters_long';
  
  const token = jwt.sign(
    { userId: userId },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return token;
}

// Test token generation
const testUserId = '68e71f01155fc80657067ac7'; // The user ID from your request
const token = generateTestToken(testUserId);

console.log('🔑 Generated Test Token:');
console.log('========================');
console.log(token);
console.log('\n📋 How to use this token:');
console.log('1. Copy the token above');
console.log('2. Add it to your API request headers:');
console.log('   Authorization: Bearer ' + token);
console.log('\n🧪 Test your API with:');
console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3000/api/user/following/${testUserId}?page=1&limit=20"`);

// Also generate a token for the other user ID mentioned earlier
const otherUserId = '68e6b719cf8166aa4ebd1958';
const otherToken = generateTestToken(otherUserId);

console.log('\n🔑 Alternative Token (for user 68e6b719cf8166aa4ebd1958):');
console.log('=====================================================');
console.log(otherToken);
