import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/database';
import PhoneOTP from '../../lib/models/PhoneOTP';
import smsService from '../../lib/utils/sms';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { phone, purpose = 'login' } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    console.log('📱 Sending OTP to phone:', phone, 'for purpose:', purpose);

    // Generate OTP
    const otpData = await (PhoneOTP as any).createOTP(phone, purpose);
    
    // Send SMS
    const message = `Your Apirgram verification code is: ${otpData.code}. Valid for 10 minutes.`;
    const smsResult = await smsService.sendSMS(phone, message);

    console.log('📤 SMS Result:', smsResult);
    console.log('🔢 OTP Code:', otpData.code);

    res.json({
      success: true,
      message: 'Phone OTP sent successfully',
      data: {
        phone,
        purpose,
        otp: otpData.code, // Only in development/test
        expiresAt: otpData.expiresAt,
        smsResult
      }
    });
  } catch (error: any) {
    console.error('❌ Test phone OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
