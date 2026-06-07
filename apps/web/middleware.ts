import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/onboarding',
  '/features(.*)',
  '/blog(.*)',
  '/tools(.*)',
  '/colleges(.*)',
  '/companies(.*)',
  '/interview-questions(.*)',
  '/salary(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/v1/auth/sync',
  '/api/v1/billing/webhook/(.*)',
  '/api/health',
  '/sitemap.xml',
  '/robots.txt',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const authObj = await auth();

  if (!isPublicRoute(req) && !authObj.userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute(req)) {
    const role = (authObj.sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
    if (role !== 'admin') {
      const url = new URL('/dashboard', req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
