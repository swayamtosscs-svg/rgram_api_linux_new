import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

// Test notification creation
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId, type = 'like' } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const user = await (User as any).findById(decoded.userId).select('username fullName');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Create test notification
    const notification = await Notification.create({
      recipient: decoded.userId, // Send to self for testing
      sender: decoded.userId,
      type: type,
      content: `Test ${type} notification for close story`,
      relatedStory: storyId
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification created', 
      data: { notification } 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Test notification error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create test notification', error: error.message }, { status: 500 });
  }
}
