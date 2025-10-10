import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Test endpoint error' },
      { status: 500 }
    );
  }
}