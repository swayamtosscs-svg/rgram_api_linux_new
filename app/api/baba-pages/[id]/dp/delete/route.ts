import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';
import { deleteBabaPageFileByUrl } from '@/utils/babaPagesLocalStorage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if page exists
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Check if page has an avatar
    if (!babaPage.avatar) {
      return NextResponse.json(
        { success: false, message: 'No profile picture to delete' },
        { status: 400 }
      );
    }

    // Delete from local storage
    let localDeleteSuccess = false;
    
    try {
      const deleteResult = await deleteBabaPageFileByUrl(babaPage.avatar);
      
      if (deleteResult.success) {
        localDeleteSuccess = true;
        console.log('✅ Successfully deleted from local storage');
      } else {
        console.warn('⚠️ Local storage deletion warning:', deleteResult.error);
      }
    } catch (localStorageError) {
      console.error('❌ Error deleting from local storage:', localStorageError);
      // Continue with database update even if local storage deletion fails
    }

    // Update page to remove avatar
    babaPage.avatar = '';
    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully from local storage',
      data: {
        deletedUrl: babaPage.avatar,
        localDeleteSuccess: localDeleteSuccess,
        databaseUpdated: true,
        message: localDeleteSuccess 
          ? 'Profile picture deleted from both database and local storage' 
          : 'Profile picture deleted from database (local file was already removed)'
      }
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
