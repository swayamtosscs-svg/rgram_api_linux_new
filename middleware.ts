import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  // Static assets and public files
  if (
    path.startsWith('/_next') || 
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle API routes - Keep them dynamic
  if (path.startsWith('/api/')) {
    const response = NextResponse.next();
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    
    // Handle body parsing for POST requests
    if (request.method === 'POST') {
      response.headers.set('Accept', 'application/json, multipart/form-data');
    }
    
    return response;
  }

  return NextResponse.next();
}

// Configure the paths that should be handled by this middleware
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all page routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
