import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'admin'
    const isUser = token?.role === 'user'

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Protect user dashboard routes
    if (
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/resume') ||
      req.nextUrl.pathname.startsWith('/cover-letter') ||
      req.nextUrl.pathname.startsWith('/interview') ||
      req.nextUrl.pathname.startsWith('/subscription') ||
      req.nextUrl.pathname.startsWith('/downloads') ||
      req.nextUrl.pathname.startsWith('/profile')
    ) {
      if (!isUser && !isAdmin) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/resume/:path*',
    '/cover-letter/:path*',
    '/interview/:path*',
    '/subscription/:path*',
    '/downloads/:path*',
    '/profile/:path*',
  ],
}

