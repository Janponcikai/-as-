import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    // Find users with a non-expired reset token
    const users = await prisma.user.findMany({
      where: { resetToken: { not: null }, resetTokenExpiry: { gt: new Date() } },
    })

    let matchedUser = null
    for (const user of users) {
      if (user.resetToken && (await bcrypt.compare(token, user.resetToken))) {
        matchedUser = user
        break
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 400 }
      )
    }

    const newHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        passwordHash: newHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Server error', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
