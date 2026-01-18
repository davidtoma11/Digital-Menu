import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/adminPanel')) {
    
    const host = request.headers.get('host') || '';
    
    if (!host.includes('localhost')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/adminPanel/:path*',
};