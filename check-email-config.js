const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function checkEmailConfig() {
  console.log('🔍 Checking Email Configuration...\n');

  // Check environment variables
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT', 
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM'
  ];

  console.log('📋 Environment Variables:');
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('PASS') ? '***' : value}`);
    } else {
      console.log(`❌ ${varName}: MISSING`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('💡 Please set these variables in your .env file or environment.');
    return;
  }

  console.log('\n🧪 Testing Email Connection...');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');

    // Test sending email
    console.log('\n📧 Testing email sending...');
    
    const testEmail = {
      from: `"R-GRAM Test" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: 'swayam121july@gmail.com',
      subject: 'Email Configuration Test - R-GRAM',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your email configuration is working properly!
          </p>
        </div>
      `,
      text: `
Email Configuration Test - R-GRAM

This is a test email to verify your email configuration is working correctly.

Timestamp: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || 'development'}

If you received this email, your email configuration is working properly!
      `.trim()
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Your Gmail username and password');
      console.log('   - 2-Factor Authentication is enabled');
      console.log('   - App password is generated correctly');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   - Your internet connection');
      console.log('   - SMTP host and port settings');
      console.log('   - Firewall settings');
    }
  }
}

// Run the check
checkEmailConfig();
