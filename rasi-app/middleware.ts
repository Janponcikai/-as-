import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/forgot-password']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  // Allow public paths and reset-password
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/reset-password')
  ) {
    return NextResponse.next()
  }

  // No session → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Admin routes — require ADMIN or SUPER_ADMIN
  if (pathname.startsWith('/admin')) {
    const role = session.user.role
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
