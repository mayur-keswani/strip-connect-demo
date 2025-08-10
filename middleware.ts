import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the userId cookie
  const userId = request.cookies.get('userId');
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/api/webhook', '/api/stripe/webhook'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and trying to access any protected route (all routes except public ones)
  if (!isPublicRoute && (!userId || !userId.value)) {
    const loginUrl = new URL('/login', request.url);
    // Add the current path as a 'next' parameter to redirect after login
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login/signup, redirect to home
  if (isPublicRoute && userId && userId.value) {
    // Check if there's a 'next' parameter to redirect to after login
    const nextParam = request.nextUrl.searchParams.get('next');
    const redirectUrl = nextParam ? new URL(nextParam, request.url) : new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
