import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Check environment variables
    const mongodbUri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongodbUri ? 'Set' : 'Missing');
    
    if (!mongodbUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable not set',
        message: 'Please check your .env.local file'
      }, { status: 500 });
    }
    
    // Test database connection
    try {
      await connectDB();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }
    
    // Test User model
    try {
      const userCount = await User.countDocuments();
      console.log('✅ User model working, count:', userCount);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and User model working',
        data: {
          userCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (modelError) {
      console.error('❌ User model error:', modelError);
      return NextResponse.json({
        success: false,
        error: 'User model error',
        details: modelError instanceof Error ? modelError.message : 'Unknown model error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
