import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import PhoneOTP from '../../../lib/models/PhoneOTP';
import OTP from '../../../lib/models/OTP';
import { generateToken } from '../../../lib/middleware/auth';

const generateUsername = async (base: string) => {
  let cleaned = base.replace(/\D/g, '');
  if (!cleaned) cleaned = 'user';
  let candidate = `user${cleaned.slice(-4)}`;
  let suffix = 1;
  while (await (User as any).findOne({ username: candidate })) {
    candidate = `user${cleaned.slice(-4)}${suffix}`;
    suffix += 1;
  }
  return candidate;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await connectDB();
    const { purpose = 'login' } = req.body || {};

    const rawPhone = (req.body?.phone ?? req.body?.phoneNumber ?? req.body?.phone_number ?? req.body?.mobile) as string | undefined;
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
    const phoneCode = typeof req.body?.phoneCode === 'string' ? req.body.phoneCode.trim() : (typeof req.body?.code === 'string' && !req.body?.email ? req.body.code.trim() : '');

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const emailCode = typeof req.body?.emailCode === 'string' ? req.body.emailCode.trim() : (typeof req.body?.code === 'string' && !req.body?.phone && !req.body?.phoneNumber && !req.body?.phone_number && !req.body?.mobile ? req.body.code.trim() : '');

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Provide at least one of: phone or email' });
    }

    const result: any = { purpose };
    let user = null;

    // Verify phone OTP if provided
    if (phone && phoneCode) {
      const phoneVerification = await (PhoneOTP as any).verifyOTP(phone, phoneCode, purpose);
      result.phone = phoneVerification;
      result.phone.phone = phone;
      
      if (phoneVerification.valid) {
        // Try to find existing user by phone
        user = await (User as any).findOne({ phone });
        
        if (!user && purpose === 'login') {
          return res.status(404).json({ 
            success: false, 
            message: 'No user found with this phone number. Please sign up first.',
            data: { result }
          });
        }
        
        if (!user && purpose === 'signup') {
          // Create new user for phone signup
          const username = await generateUsername(phone);
          user = await (User as any).create({
            email: `user${phone.slice(-4)}@apirgram.com`,
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2),
            fullName: `User ${phone.slice(-4)}`,
            username,
            phone,
            isEmailVerified: false,
            isActive: true,
            createdAt: new Date(),
            lastActive: new Date()
          });
          console.log('✅ Created new user for phone:', phone);
        }
      }
    } else if (phone && !phoneCode) {
      result.phone = { valid: false, message: 'Missing phone OTP code' };
    }

    // Verify email OTP if provided
    if (email && emailCode) {
      const emailVerification = await (OTP as any).verifyOTP(email, emailCode, purpose === 'signup' ? 'signup' : purpose === 'login' ? 'login' : 'email_verification');
      result.email = emailVerification;
      result.email.email = email;
      
      if (emailVerification.valid) {
        // Try to find existing user by email
        const emailUser = await (User as any).findOne({ email });
        
        if (!emailUser && purpose === 'login') {
          return res.status(404).json({ 
            success: false, 
            message: 'No user found with this email. Please sign up first.',
            data: { result }
          });
        }
        
        if (!emailUser && purpose === 'signup') {
          // Create new user for email signup
          const username = await generateUsername(email.replace(/[^a-zA-Z0-9]/g, ''));
          const emailUser = await (User as any).create({
            email,
            password: Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2),
            fullName: email.split('@')[0],
            username,
            isEmailVerified: true,
            isActive: true,
            createdAt: new Date(),
            lastActive: new Date()
          });
          console.log('✅ Created new user for email:', email);
        }
        
        // If we don't have a user from phone verification, use email user
        if (!user && emailUser) {
          user = emailUser;
          // Mark email as verified
          user.isEmailVerified = true;
          await user.save();
        }
      }
    } else if (email && !emailCode) {
      result.email = { valid: false, message: 'Missing email OTP code' };
    }

    // If neither verification is valid
    if ((!result.phone || !result.phone.valid) && (!result.email || !result.email.valid)) {
      return res.status(400).json({ 
        success: false, 
        message: result.phone?.message || result.email?.message || 'Invalid or expired OTP', 
        data: { result } 
      });
    }

    // If we still don't have a user, something went wrong
    if (!user) {
      console.error('❌ No user established after verification:', { result, phone, email });
      return res.status(500).json({ 
        success: false, 
        message: 'Verification passed but no user context established. Please try again.',
        data: { result }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const token = generateToken(user._id);
    user.lastActive = new Date();
    await user.save();

    console.log('✅ Login successful for user:', user._id);

    return res.json({
      success: true,
      message: 'Verification successful',
      data: {
        result,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          religion: user.religion,
          isPrivate: user.isPrivate,
          isEmailVerified: user.isEmailVerified,
          isVerified: user.isVerified,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          postsCount: user.postsCount,
          reelsCount: user.reelsCount,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Verify combined OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
