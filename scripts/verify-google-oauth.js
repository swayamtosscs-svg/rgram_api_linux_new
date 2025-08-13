/**
 * Google OAuth Configuration Verification Script
 * 
 * This script helps verify your Google OAuth configuration by:
 * 1. Checking environment variables
 * 2. Validating redirect URIs
 * 3. Testing DNS resolution to Google APIs
 */

const dns = require('dns');
const { promisify } = require('util');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Promisify DNS lookup
const dnsLookup = promisify(dns.lookup);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Print colored message to console
 */
function print(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if required environment variables are set
 */
async function checkEnvironmentVariables() {
  print('\n🔍 Checking environment variables...', 'cyan');
  
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL'
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      print(`❌ Missing ${varName}`, 'red');
      allPresent = false;
    } else {
      print(`✅ ${varName} is set`, 'green');
    }
  }
  
  return allPresent;
}

/**
 * Check DNS resolution to Google APIs
 */
async function checkGoogleApiAccess() {
  print('\n🔍 Checking access to Google APIs...', 'cyan');
  
  const domains = [
    'accounts.google.com',
    'oauth2.googleapis.com',
    'www.googleapis.com'
  ];
  
  for (const domain of domains) {
    try {
      await dnsLookup(domain);
      print(`✅ DNS resolution successful for ${domain}`, 'green');
    } catch (error) {
      print(`❌ DNS resolution failed for ${domain}: ${error.message}`, 'red');
    }
  }
}

/**
 * Validate redirect URIs
 */
async function validateRedirectUris() {
  print('\n🔍 Validating redirect URIs...', 'cyan');
  
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  
  if (!callbackUrl) {
    print('❌ GOOGLE_CALLBACK_URL is not set', 'red');
    return;
  }
  
  print(`Current callback URL: ${callbackUrl}`, 'yellow');
  
  // Check for common issues
  if (callbackUrl.endsWith('/')) {
    print('⚠️ Warning: Callback URL ends with a trailing slash, which might cause issues', 'yellow');
  }
  
  if (!callbackUrl.includes('/callback')) {
    print('⚠️ Warning: Callback URL does not contain "/callback"', 'yellow');
  }
  
  // Suggest additional URIs to add to Google Cloud Console
  print('\n📋 Recommended redirect URIs to add to Google Cloud Console:', 'magenta');
  
  const baseUrl = callbackUrl.split('/api/')[0];
  const suggestedUris = [
    callbackUrl,
    `${baseUrl}/api/auth/google/callback`,
    'http://localhost:3000/api/auth/google/callback',
    'https://api-rgram1.vercel.app/api/auth/google/callback'
  ];
  
  // Remove duplicates
  const uniqueUris = [...new Set(suggestedUris)];
  
  uniqueUris.forEach(uri => {
    print(`- ${uri}`, 'white');
  });
}

/**
 * Main function
 */
async function main() {
  print('\n🔐 Google OAuth Configuration Verification', 'cyan');
  print('===========================================', 'cyan');
  
  const envVarsOk = await checkEnvironmentVariables();
  await checkGoogleApiAccess();
  await validateRedirectUris();
  
  print('\n📝 Next Steps:', 'magenta');
  
  if (!envVarsOk) {
    print('1. Set all required environment variables', 'yellow');
  }
  
  print('1. Go to https://console.cloud.google.com/apis/credentials', 'white');
  print('2. Find your OAuth 2.0 Client ID', 'white');
  print('3. Add all the recommended redirect URIs', 'white');
  print('4. Save your changes', 'white');
  print('5. Test the authentication flow using /public/google-oauth-test.html', 'white');
  
  print('\n✨ Verification complete!', 'green');
}

// Run the main function
main().catch(error => {
  print(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});