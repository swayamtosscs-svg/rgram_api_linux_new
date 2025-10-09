require('dotenv').config();

console.log('🔍 Debugging JWT Secret Configuration');
console.log('====================================');

console.log('Environment variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test token generation with the same secret
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure_at_least_32_characters_long';
const userId = '68e71f01155fc80657067ac7';

console.log('\n🔑 Testing token generation:');
console.log('Using JWT_SECRET:', JWT_SECRET);

try {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  console.log('✅ Token generated successfully');
  console.log('Token:', token);
  
  // Test token verification
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification successful');
  console.log('Decoded:', decoded);
  
} catch (error) {
  console.error('❌ Token generation/verification failed:', error.message);
}

// Check if .env.local exists
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('\n📄 .env.local content:');
  console.log(envContent);
} catch (error) {
  console.log('\n❌ .env.local file not found or not readable');
  console.log('Error:', error.message);
}
