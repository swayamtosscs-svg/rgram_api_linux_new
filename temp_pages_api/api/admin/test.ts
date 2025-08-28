import { NextApiRequest, NextApiResponse } from 'next';
import { adminMiddleware } from '../../../lib/middleware/adminAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Simple test endpoint
    res.json({
      success: true,
      message: 'Admin authentication successful',
      adminUser: req.adminUser
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export default async function wrappedHandler(req: NextApiRequest, res: NextApiResponse) {
  await adminMiddleware(req, res, async () => {
    await handler(req, res);
  });
}
