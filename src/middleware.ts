import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rotas de candidato
    if (path.startsWith('/candidato') && token?.role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Rotas de empresa
    if (path.startsWith('/empresa') && token?.role !== 'COMPANY') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Rotas de admin
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Rotas protegidas que precisam de autenticação
        const protectedRoutes = ['/candidato', '/empresa', '/admin'];
        const isProtected = protectedRoutes.some((route) => path.startsWith(route));
        
        if (isProtected && !token) {
          return false;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/candidato/:path*', '/empresa/:path*', '/admin/:path*'],
};
