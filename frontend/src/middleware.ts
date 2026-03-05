import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Now that auth uses HttpOnly cookies, we CAN read the cookie in middleware.
    // Check for the accessToken cookie to guard protected routes.
    const token = request.cookies.get('accessToken')?.value;

    const protectedPaths = ['/owner', '/admin'];
    const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/owner/:path*', '/admin/:path*'],
};
