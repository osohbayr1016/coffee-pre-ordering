import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static export: middleware is disabled.
// Auth is handled client-side in each protected page component.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

