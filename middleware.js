import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const isAuthenticated = req.cookies.get('auth-token'); // Check if the auth-token cookie is present

  // Debugging the token
  console.log('auth-token:', isAuthenticated);

  // Home page redirection
  if (url.pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/user', req.url)); // Redirect authenticated users to the user dashboard
    }
    return NextResponse.next(); // Allow unauthenticated users
  }

  // Allow access to /admin if authenticated
  if (url.pathname.startsWith('/admin')) {
    if (isAuthenticated) {
      return NextResponse.next(); // Allow access to /admin
    } else {
      return NextResponse.redirect(new URL('/', req.url)); // Redirect unauthenticated users to home
    }
  }

  // Login page handling
  if (url.pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/user', req.url)); // Redirect authenticated users
    }
    return NextResponse.next(); // Allow unauthenticated access to login
  }

  // Handle static files and internals
  if (
    url.pathname.startsWith('/_next') || // Static files and Next.js internals
    url.pathname.startsWith('/public') || // Files in /public folder
    url.pathname.includes('.') // Requests with file extensions (e.g., .css, .js, .png)
  ) {
    return NextResponse.next();
  }

  // Redirect all other routes to home if unauthenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow access to other routes if authenticated
  return NextResponse.next();
}

// Apply middleware to all paths except for /, /admin, /login, and static assets
export const config = {
  matcher: ['/((?!admin|login|$|_next|public).*)'],
};
