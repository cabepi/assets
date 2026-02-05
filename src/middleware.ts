
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

const protectedRoutes = ['/dashboard', '/inventory', '/assignments', '/users', '/reports', '/verify'];
const publicRoutes = ['/login'];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route)) || path === '/';

    const cookie = req.cookies.get('session_token')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    // 1. Redirect unauthenticated users to login
    if (isProtectedRoute && !session) {
        const redirectUrl = new URL('/login', req.nextUrl);
        redirectUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(redirectUrl);
    }

    // 2. Redirect authenticated users away from login
    if (path === '/login' && session) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
