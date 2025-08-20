import { NextResponse } from 'next/server';
import cloudinary from '@/utils/cloudinary';

// Use auto to let Next.js decide between static and dynamic based on the request
export const dynamic = 'auto';
export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

// This function will handle both static and dynamic requests
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Get details of the resource
    const result = await cloudinary.api.resource(publicId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Retrieve error:', error);
    return NextResponse.json(
      { error: 'Error retrieving file' },
      { status: 500 }
    );
  }
}
