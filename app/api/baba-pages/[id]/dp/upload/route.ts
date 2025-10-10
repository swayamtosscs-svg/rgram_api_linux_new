import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';
import { uploadBabaPageFileToLocal, deleteBabaPageFileByUrl } from '@/utils/babaPagesLocalStorage';

export async function POST(
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

    // No external service configuration needed for local storage

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('dp') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Upload to local storage
    const uploadResult = await uploadBabaPageFileToLocal(file, id, 'dp');
    
    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload profile picture to local storage', details: uploadResult.error },
        { status: 500 }
      );
    }

    // Delete old avatar if exists
    if (babaPage.avatar && babaPage.avatar.startsWith('/uploads/')) {
      try {
        await deleteBabaPageFileByUrl(babaPage.avatar);
      } catch (error) {
        console.warn('Error deleting old avatar:', error);
      }
    }

    // Update page with new avatar
    babaPage.avatar = uploadResult.data.publicUrl;
    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully to local storage',
      data: {
        avatar: uploadResult.data.publicUrl,
        fileName: uploadResult.data.fileName,
        filePath: uploadResult.data.filePath,
        fileSize: uploadResult.data.fileSize,
        mimeType: uploadResult.data.mimeType,
        dimensions: uploadResult.data.dimensions,
        storageType: 'local'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
