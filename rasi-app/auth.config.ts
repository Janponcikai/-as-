import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config — no Prisma, no bcrypt
// Used only in middleware for JWT verification
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isPublic =
        pathname === '/login' ||
        pathname === '/forgot-password' ||
        pathname.startsWith('/reset-password')

      if (isPublic) return true
      if (!isLoggedIn) return false

      if (pathname.startsWith('/admin')) {
        const role = auth.user.role
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
      }

      return true
    },
  },
  session: { strategy: 'jwt' },
}
