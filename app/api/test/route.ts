import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Test API is working',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries())
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await req.formData();
      const entries = Array.from(formData.entries()).map(([key, value]) => ({
        key,
        type: value instanceof File ? 'File' : 'Text',
        value: value instanceof File ? `${value.name} (${value.size} bytes)` : value
      }));
      
      return NextResponse.json({
        success: true,
        message: 'Form data received successfully',
        contentType,
        entries,
        timestamp: new Date().toISOString()
      });
    } else {
      const body = await req.text();
      return NextResponse.json({
        success: true,
        message: 'Text body received',
        contentType,
        body: body.substring(0, 100),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Error processing request',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
