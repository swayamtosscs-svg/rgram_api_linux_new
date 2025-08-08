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
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Generate OTP
    const otpData = await (PhoneOTP as any).createOTP(phone, 'login');
    
    // Send SMS
    const message = `Your Apirgram test OTP is: ${otpData.code}. Valid for 10 minutes.`;
    const smsResult = await smsService.sendSMS(phone, message);

    res.json({
      success: true,
      message: 'Test OTP sent',
      data: {
        phone,
        otp: otpData.code, // Only in development/test
        expiresAt: otpData.expiresAt,
        smsResult
      }
    });
  } catch (error: any) {
    console.error('Test OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
