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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as 'image' | 'video' | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Media type is required. Please provide type=image or type=video in form data' },
        { status: 400 }
      );
    }

    if (!['image', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid media type. Type must be either "image" or "video"' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadOptions = {
        resource_type: type,
        tags: tags ? JSON.parse(tags) : undefined,
      };

      cloudinary.uploader.upload(
        dataURI,
        uploadOptions,
        (error, result: any) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
    });

    // Save to MongoDB
    const media = await Media.create({
      publicId: uploadResult.public_id,
      url: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      format: uploadResult.format,
      resourceType: type,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? JSON.parse(tags) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: media
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Error uploading file',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
