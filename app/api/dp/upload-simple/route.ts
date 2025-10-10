import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToLocal, validateFileType, validateFileSize } from '@/utils/localStorage';

export async function POST(request: NextRequest) {
  try {

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('dp') as File;
    const username = formData.get('username') as string || 'test_user'; // Use username instead of userId

    if (!file) {
      return NextResponse.json({ error: 'Profile picture file is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed',
        receivedType: file.type,
        allowedTypes: allowedTypes
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 5MB',
        receivedSize: file.size,
        maxSize: maxSize
      }, { status: 400 });
    }

    // Upload to local storage
    const uploadResult = await uploadFileToLocal(file, username, 'profile_pictures');
    
    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { error: 'Failed to upload profile picture to local storage', details: uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully to local storage',
      data: {
        avatar: uploadResult.data.publicUrl,
        fileName: uploadResult.data.fileName,
        filePath: uploadResult.data.filePath,
        width: uploadResult.data.dimensions?.width,
        height: uploadResult.data.dimensions?.height,
        format: file.name.split('.').pop() || 'unknown',
        size: uploadResult.data.fileSize,
        mimeType: uploadResult.data.mimeType,
        uploadedAt: new Date(),
        username: username,
        storageType: 'local'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
