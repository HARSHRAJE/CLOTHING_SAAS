import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Note: The accessToken cookie is set by the API backend (different domain).
    // Next.js middleware runs server-side and can only see cookies from its own domain.
    // Therefore, we cannot check for the accessToken cookie here.
    // Route protection is handled client-side by AuthContext.
    return NextResponse.next();
}
