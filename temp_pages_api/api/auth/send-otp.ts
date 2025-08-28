import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import PhoneOTP from '../../../lib/models/PhoneOTP';
import smsService from '../../../lib/utils/sms';
import OTP from '../../../lib/models/OTP';
import { sendOTPEmail } from '../../../lib/utils/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await connectDB();
    const { purpose = 'login' } = req.body || {};
    const rawPhone = (req.body?.phone ?? req.body?.phoneNumber ?? req.body?.phone_number ?? req.body?.mobile) as string | undefined;
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Provide at least one of: phone or email' });
    }
    if (!['login', 'signup'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid purpose' });
    }

    const result: any = { purpose };

    // Send phone OTP if provided
    if (phone) {
      const phoneOtpData = await (PhoneOTP as any).createOTP(phone, purpose);
      const smsMessage = `Your Apirgram verification code is: ${phoneOtpData.code}. Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`;
      const smsResult = await smsService.sendSMS(phone, smsMessage);
      result.phone = {
        phone,
        sent: smsResult.success,
        message: smsResult.message,
        expiresAt: phoneOtpData.expiresAt
      };
      if (!smsResult.success) {
        result.phone.error = smsResult.error || 'Failed to send SMS';
      }
    }

    // Send email OTP if provided
    if (email) {
      const emailOtpData = await (OTP as any).createOTP(email, purpose === 'signup' ? 'signup' : purpose === 'login' ? 'login' : 'email_verification');
      const emailSent = await sendOTPEmail(email, emailOtpData.otp, purpose === 'signup' ? 'signup' : purpose === 'login' ? 'login' : 'email_verification');
      result.email = {
        email,
        sent: !!emailSent,
        message: emailSent ? 'Email sent' : 'Failed to send email',
        expiresAt: emailOtpData.expiresAt
      };
    }

    if ((result.phone && !result.phone.sent) && (result.email && !result.email.sent)) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP via both channels', data: result });
    }

    return res.json({ success: true, message: 'OTP dispatched', data: result });
  } catch (error: any) {
    console.error('Send OTP (combined) error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
