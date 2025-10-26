import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isEducatorPage = req.nextUrl.pathname.startsWith('/educator');
    const isStudentPage = req.nextUrl.pathname.startsWith('/student');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    if (isEducatorPage && token?.role !== 'EDUCATOR') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }

    if (isStudentPage && token?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/educator/dashboard', req.url));
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/educator/:path*', '/student/:path*', '/auth/:path*'],
};
