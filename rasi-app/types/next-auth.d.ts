import { UserRole } from '@prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      tenantId: string
      tenantSlug: string
      positionId: string | null
    }
  }

  interface User {
    role: UserRole
    tenantId: string
    tenantSlug: string
    positionId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    tenantId: string
    tenantSlug: string
    positionId: string | null
  }
}
