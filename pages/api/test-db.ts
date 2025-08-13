import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('Database connection successful');
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}