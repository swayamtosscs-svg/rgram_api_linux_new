import nodemailer from 'nodemailer';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create optimized transporter for fast email sending
const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT || '465');
  const isSecure = port === 465;
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Optimize for speed
    pool: true, // Use connection pooling
    maxConnections: 5, // Maximum number of connections
    maxMessages: 100, // Maximum messages per connection
    rateLimit: 14, // Maximum messages per second
    // Timeout settings for faster response
    connectionTimeout: 8000, // 8 seconds (reduced from 10)
    greetingTimeout: 3000, // 3 seconds (reduced from 5)
    socketTimeout: 8000, // 8 seconds (reduced from 10)
    // Keep connection alive
    keepAlive: true,
    keepAliveInitialDelay: 20000, // 20 seconds (reduced from 30)
    // Additional optimizations
    tls: {
      rejectUnauthorized: false, // Faster TLS handshake
    },
  } as any);
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  purpose: string = 'signup'
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const subject = {
      signup: 'Verify Your Email - R-GRAM',
      login: 'Login OTP - R-GRAM',
      password_reset: 'Password Reset OTP - R-GRAM',
      email_verification: 'Email Verification - R-GRAM',
    }[purpose] || 'OTP - R-GRAM';

    const purposeText = {
      signup: 'Welcome to R-GRAM! Please verify your email to complete registration.',
      login: 'Use this OTP to login to your R-GRAM account.',
      password_reset: 'Use this OTP to reset your password.',
      email_verification: 'Please verify your email address.',
    }[purpose] || 'Your verification code';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">R-GRAM</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Spiritual & Religious Social Media</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">${subject}</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              ${purposeText}
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              Your verification code is:
            </p>
            
            <div style="background: #f8f9ff; border: 2px solid #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes. 
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-top: 30px;">
              For your security, never share this code with anyone. R-GRAM will never ask for your verification code.
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>The R-GRAM Team</strong>
              </p>
              <p style="color: #ccc; font-size: 12px; margin: 15px 0 0 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a simple text version for better compatibility
    const text = `
R-GRAM - Spiritual & Religious Social Media

${subject}

${purposeText}

Your verification code is: ${otp}

⚠️ Important: This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.
If you didn't request this code, please ignore this email.

For your security, never share this code with anyone. R-GRAM will never ask for your verification code.

Best regards,
The R-GRAM Team

This is an automated message, please do not reply to this email.
    `.trim();

    await transporter.sendMail({
      from: `"R-GRAM" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
      text,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  username: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to R-GRAM!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">R-GRAM</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Spiritual & Religious Social Media</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Welcome to R-GRAM! 🙏</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Hello <strong style="color: #667eea;">${username}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Welcome to R-GRAM! We're excited to have you join our community of spiritual and religious content creators and seekers.
            </p>
            
            <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">What you can do on R-GRAM:</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>Share spiritual insights and religious content</li>
                <li>Connect with like-minded individuals</li>
                <li>Discover inspiring posts and reels</li>
                <li>Build a community around your faith</li>
                <li>Engage in meaningful discussions</li>
                <li>Find peace and inspiration daily</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://103.14.120.163:8081'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px;">
                Start Exploring R-GRAM
              </a>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #2d5a2d; margin: 0; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Complete your profile by adding a bio and profile picture to help others connect with you!
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you have any questions or need help getting started, feel free to reach out to our support team at 
              <a href="mailto:${process.env.EMAIL_FROM || process.env.EMAIL_USER}" style="color: #667eea;">support@rgram.com</a>
            </p>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>The R-GRAM Team</strong>
              </p>
              <p style="color: #ccc; font-size: 12px; margin: 15px 0 0 0;">
                You're receiving this email because you signed up for R-GRAM.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"R-GRAM" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to R-GRAM! 🙏',
      html,
    });

    console.log(`✅ Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email sending error:', error);
    return false;
  }
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmationEmail = async (
  email: string,
  username: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - R-GRAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">R-GRAM</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Spiritual & Religious Social Media</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Password Reset Successful ✅</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Hello <strong style="color: #667eea;">${username}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Your password has been successfully reset. You can now login to your R-GRAM account with your new password.
            </p>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <p style="color: #2d5a2d; margin: 0; font-size: 14px;">
                <strong>🔒 Security Tip:</strong> If you didn't reset your password, please contact our support team immediately.
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://103.14.120.163:8081'}/auth/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px;">
                Login to R-GRAM
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>The R-GRAM Team</strong>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"R-GRAM" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - R-GRAM',
      html,
    });

    console.log(`✅ Password reset confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset confirmation email error:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetToken: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    // Determine the correct base URL for the reset link
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // If NEXT_PUBLIC_APP_URL is not set, try to determine from other environment variables
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        // Use Vercel's auto-generated URL
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        // In production or on Vercel, use the Vercel domain
        baseUrl = 'https://api-rgram1.vercel.app';
      } else {
        // Use server IP instead of localhost for development
        baseUrl = 'http://103.14.120.163:8081';
      }
    }
    
    // Force server IP for production deployment
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      baseUrl = 'http://103.14.120.163:8081';
    }
    
    // Force Vercel domain only if we're actually on Vercel
    if (process.env.VERCEL || process.env.VERCEL_URL) {
      baseUrl = 'https://api-rgram1.vercel.app';
    }
    
    // Include email in the reset URL for direct password reset
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - R-GRAM</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">R-GRAM</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Spiritual & Religious Social Media</p>
            </div>
            
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Password Reset Request 🔐</h2>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Hello <strong style="color: #667eea;">${fullName}</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                You have requested to reset your password for your R-GRAM account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #333; margin: 0; font-size: 14px;">
                  <strong>🔗 Alternative:</strong> Copy and paste this link into your browser:
                </p>
                <p style="word-break: break-all; color: #667eea; margin: 10px 0 0 0; font-size: 12px;">${resetUrl}</p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px; margin-top: 30px;">
                For your security, never share this link with anyone. R-GRAM will never ask for your password reset link.
              </p>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The R-GRAM Team</strong>
                </p>
                <p style="color: #ccc; font-size: 12px; margin: 15px 0 0 0;">
                  This is an automated message, please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
R-GRAM - Spiritual & Religious Social Media

Password Reset Request

Hello ${fullName},

You have requested to reset your password for your R-GRAM account.

Click this link to reset your password: ${resetUrl}

⚠️ Important: This link will expire in 15 minutes.
If you didn't request this password reset, please ignore this email.

For your security, never share this link with anyone. R-GRAM will never ask for your password reset link.

Best regards,
The R-GRAM Team

This is an automated message, please do not reply to this email.
    `.trim();

    await transporter.sendMail({
      from: `"R-GRAM" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - R-GRAM',
      html,
      text,
    });

    console.log(`✅ Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset email sending error:', error);
    return false;
  }
};

