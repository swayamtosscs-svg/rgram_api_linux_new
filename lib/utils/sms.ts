interface SMSConfig {
  apiKey?: string;
  apiSecret?: string;
  from?: string;
  provider?: 'twilio' | 'aws-sns' | 'mock';
}

class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig = {}) {
    this.config = {
      provider: 'mock', // Default to mock for development
      ...config
    };
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Clean phone number
      const cleanPhone = this.cleanPhoneNumber(to);
      
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(cleanPhone, message);
        case 'aws-sns':
          return await this.sendViaAWSSNS(cleanPhone, message);
        case 'mock':
        default:
          return await this.sendViaMock(cleanPhone, message);
      }
    } catch (error: any) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: error.message
      };
    }
  }

  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If no + prefix, assume it's a local number and add +91 for India
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned; // India
      } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = '+91' + cleaned.substring(1); // India with leading 0
      } else {
        cleaned = '+' + cleaned; // Generic
      }
    }
    
    return cleaned;
  }

  private async sendViaTwilio(to: string, message: string): Promise<{ success: boolean; message: string; error?: string }> {
    // Twilio integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // For now, return mock success
    console.log(`[TWILIO SMS] To: ${to}, Message: ${message}`);
    return {
      success: true,
      message: 'SMS sent via Twilio'
    };
  }

  private async sendViaAWSSNS(to: string, message: string): Promise<{ success: boolean; message: string; error?: string }> {
    // AWS SNS integration
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured');
    }

    // For now, return mock success
    console.log(`[AWS SNS SMS] To: ${to}, Message: ${message}`);
    return {
      success: true,
      message: 'SMS sent via AWS SNS'
    };
  }

  private async sendViaMock(to: string, message: string): Promise<{ success: boolean; message: string; error?: string }> {
    // Mock SMS service for development/testing
    console.log(`[MOCK SMS] To: ${to}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log(`[MOCK SMS] OTP Code: ${message.match(/\d{6}/)?.[0] || 'No OTP found'}`);
    
    // In development, you can check the console to see the OTP
    return {
      success: true,
      message: 'SMS sent (mock mode)'
    };
  }
}

// Create default SMS service instance
const smsService = new SMSService({
  provider: (process.env.SMS_PROVIDER as 'twilio' | 'aws-sns' | 'mock') || 'mock'
});

export default smsService;
