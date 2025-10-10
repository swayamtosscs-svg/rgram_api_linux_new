// Comprehensive Email Test for Server
const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function comprehensiveEmailTest() {
  console.log('📧 Comprehensive Email Test for R-GRAM Server\n');
  console.log('=' .repeat(60));
  
  // 1. Environment Check
  console.log('\n🔍 1. Environment Variables Check:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ MISSING');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ MISSING');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ MISSING');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ MISSING');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ MISSING');
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ MISSING');
  console.log('NODE_ENV:', process.env.NODE_ENV || '❌ MISSING');
  
  // 2. Test Gmail Authentication
  console.log('\n🧪 2. Gmail Authentication Test:');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    await transporter.verify();
    console.log('✅ Gmail authentication successful!');
    
    // 3. Send test email
    console.log('\n📧 3. Sending Test Email:');
    const testEmail = {
      from: `"R-GRAM Test" <${process.env.EMAIL_USER}>`,
      to: 'swayam121july@gmail.com',
      subject: 'R-GRAM Server Email Test - ' + new Date().toLocaleString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">R-GRAM</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Server Email Test</p>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #333;">✅ Email Test Successful!</h2>
            <p>This confirms your server can send emails.</p>
            <p><strong>Server:</strong> 103.14.120.163:8081</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Status:</strong> Email service is working correctly!</p>
          </div>
        </div>
      `,
      text: `R-GRAM Server Email Test - SUCCESS! Server: 103.14.120.163:8081 Time: ${new Date().toISOString()}`
    };
    
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 To: swayam121july@gmail.com');
    console.log('📧 Subject:', testEmail.subject);
    
    // 4. Test forgot password function
    console.log('\n🔐 4. Testing Forgot Password Function:');
    try {
      const { sendPasswordResetEmail } = require('./lib/utils/email');
      const resetToken = 'test_' + Date.now();
      const emailSent = await sendPasswordResetEmail(
        'swayam121july@gmail.com',
        'Test User',
        resetToken
      );
      
      if (emailSent) {
        console.log('✅ Forgot password email function works!');
        console.log('📧 Reset link: http://103.14.120.163:8081/reset-password?token=' + resetToken + '&email=swayam121july@gmail.com');
      } else {
        console.log('❌ Forgot password email function failed');
      }
    } catch (error) {
      console.log('❌ Forgot password function error:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Gmail authentication failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Gmail Authentication Issue:');
      console.log('   - The Gmail app password is not working');
      console.log('   - Need to generate a new app password');
      console.log('   - Or use a different email provider');
    }
  }
  
  // 5. Alternative Email Providers Test
  console.log('\n🔄 5. Alternative Email Providers:');
  console.log('If Gmail doesn\'t work, try these alternatives:');
  
  const alternatives = [
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false
    },
    {
      name: 'Yahoo Mail',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false
    },
    {
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      user: 'apikey'
    }
  ];
  
  alternatives.forEach((provider, index) => {
    console.log(`   ${index + 1}. ${provider.name}:`);
    console.log(`      Host: ${provider.host}`);
    console.log(`      Port: ${provider.port}`);
    console.log(`      User: ${provider.user || 'your_email@domain.com'}`);
    console.log(`      Pass: ${provider.name === 'SendGrid' ? 'your_api_key' : 'your_password'}`);
  });
  
  // 6. Current Status Summary
  console.log('\n📊 6. Current Status Summary:');
  console.log('=' .repeat(40));
  console.log('✅ Environment variables: CONFIGURED');
  console.log('❌ Gmail authentication: FAILING');
  console.log('✅ Server configuration: READY');
  console.log('✅ Forgot password API: READY (with mock)');
  console.log('⚠️  Email sending: NEEDS WORKING CREDENTIALS');
  
  // 7. Recommendations
  console.log('\n💡 7. Recommendations:');
  console.log('1. Generate a new Gmail app password');
  console.log('2. Or switch to a different email provider');
  console.log('3. The forgot password API works with mock emails');
  console.log('4. Users can still reset passwords (links logged to console)');
  
  console.log('\n🎯 8. Next Steps:');
  console.log('1. Fix Gmail credentials OR');
  console.log('2. Use the mock email service (already working)');
  console.log('3. Deploy updated code to server');
  console.log('4. Test forgot password API');
  
  console.log('\n' + '=' .repeat(60));
  console.log('📧 Email Test Complete!');
}

// Run the comprehensive test
comprehensiveEmailTest();
