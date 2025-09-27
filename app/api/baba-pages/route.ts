import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import { verifyToken } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// Create a new Baba Ji page
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, location, religion, website } = body;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name is required and must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Check if page with same name already exists
    const existingPage = await BabaPage.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingPage) {
      return NextResponse.json(
        { success: false, message: 'A page with this name already exists' },
        { status: 409 }
      );
    }

    // Create new Baba Ji page
    const babaPage = new BabaPage({
      name: name.trim(),
      description: description?.trim() || '',
      location: location?.trim() || '',
      religion: religion?.trim() || '',
      website: website?.trim() || '',
      createdBy: new mongoose.Types.ObjectId(decoded.userId)
    });

    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Baba Ji page created successfully',
      data: babaPage
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all Baba Ji pages
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const religion = searchParams.get('religion') || '';

    const query: any = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (religion) {
      query.religion = { $regex: religion, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      BabaPage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BabaPage.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        pages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching Baba Ji pages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
