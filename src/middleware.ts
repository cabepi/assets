
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';
import { Logger } from './lib/logger';

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

        // Log unauthorized attempt (non-blocking)
        // We use waitUntil if available to not block the response, or just fire and forget if runtime permits
        // For simplicity in this demo, just call it (Node runtime behavior) or wrap in safe block
        try {
            const ip = req.headers.get('x-forwarded-for') || 'unknown';
            Logger.warning(`Unauthorized access attempt to ${path}`, { ip, userAgent: req.headers.get('user-agent') });
        } catch (e) {
            console.error('Logger failed in middleware', e);
        }

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
