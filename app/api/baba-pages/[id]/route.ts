import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';

// Get a specific Baba Ji page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const babaPage = await BabaPage.findById(id).lean();

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: babaPage
    });

  } catch (error) {
    console.error('Error fetching Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a Baba Ji page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const babaPage = await BabaPage.findById(id);

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) babaPage.name = body.name.trim();
    if (body.description !== undefined) babaPage.description = body.description.trim();
    if (body.location !== undefined) babaPage.location = body.location.trim();
    if (body.religion !== undefined) babaPage.religion = body.religion.trim();
    if (body.website !== undefined) babaPage.website = body.website.trim();

    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Baba Ji page updated successfully',
      data: babaPage
    });

  } catch (error) {
    console.error('Error updating Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a Baba Ji page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const babaPage = await BabaPage.findById(id);

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Soft delete
    babaPage.isActive = false;
    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Baba Ji page deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
