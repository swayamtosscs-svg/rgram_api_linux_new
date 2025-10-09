const jwt = require('jsonwebtoken');

// Use the actual JWT_SECRET from the environment
const JWT_SECRET = '9vQNPH6kL1jZ2JVsla8czb0WiEngqT7tUuGoYpxwSKyeXhC3A4mMfRBrIDdO5F';
const userId = '68e71f01155fc80657067ac7';

console.log('🔑 Generating Token with Correct JWT_SECRET');
console.log('============================================');

const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });

console.log('✅ Token generated successfully');
console.log('Token:', token);
console.log('\n📋 Use this token in your API request:');
console.log(`Authorization: Bearer ${token}`);
console.log('\n🧪 Test with curl:');
console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:3000/api/user/following/${userId}?page=1&limit=20"`);

// Also generate for the other user
const otherUserId = '68e6b719cf8166aa4ebd1958';
const otherToken = jwt.sign({ userId: otherUserId }, JWT_SECRET, { expiresIn: '30d' });

console.log('\n🔑 Alternative Token (for user 68e6b719cf8166aa4ebd1958):');
console.log('=====================================================');
console.log(otherToken);
