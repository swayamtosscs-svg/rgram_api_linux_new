import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('DP Test: Testing basic API functionality...');
    
    // Test environment variables
    const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
    const mongodbUri = process.env.MONGODB_URI;
    
    console.log('DP Test: Environment variables check:', {
      cloudinaryName: cloudinaryName ? 'Set' : 'Missing',
      cloudinaryKey: cloudinaryKey ? 'Set' : 'Missing',
      cloudinarySecret: cloudinarySecret ? 'Set' : 'Missing',
      mongodbUri: mongodbUri ? 'Set' : 'Missing'
    });
    
    return NextResponse.json({
      success: true,
      message: 'DP API test endpoint working',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        cloudinaryConfigured: !!(cloudinaryName && cloudinaryKey && cloudinarySecret),
        mongodbConfigured: !!mongodbUri
      }
    });
    
  } catch (error) {
    console.error('DP Test: Error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
