import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';

interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  duration?: number;
  resource_type: string;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Find existing media
    const media = await Media.findById(id);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64String}`;

    // Delete old file from Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        media.publicId,
        { resource_type: media.resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Upload new file to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadOptions = {
        resource_type: media.resourceType,
        public_id: media.publicId,
      };

      cloudinary.uploader.upload(
        dataURI,
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
    });

    // Update MongoDB record
    const updatedMedia = await Media.findByIdAndUpdate(
      id,
      {
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedMedia
    });

  } catch (error: any) {
    console.error('Replace error:', error);
    return NextResponse.json(
      { 
        error: 'Error replacing media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
