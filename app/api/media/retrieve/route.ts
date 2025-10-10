import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = {};

    if (id) {
      query = { _id: id };
    } else if (type) {
      query = { resourceType: type };
    }

    const skip = (page - 1) * limit;

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: media,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error: any) {
    console.error('Retrieve error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
