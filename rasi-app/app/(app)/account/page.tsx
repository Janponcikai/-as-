'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/lib/validators'
import { z } from 'zod'

type ChangeForm = z.infer<typeof changePasswordSchema>

export default function AccountPage() {
  const { data: session } = useSession()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeForm>({ resolver: zodResolver(changePasswordSchema) })

  async function onSubmit(data: ChangeForm) {
    setServerError(null)
    const res = await fetch('/api/account/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? 'Failed to update password.')
      return
    }

    setSuccess(true)
    reset()
  }

  if (!session) return null

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-primary">My Account</h1>

      {/* Profile info */}
      <div className="bg-surface rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          Profile
        </h2>
        <InfoRow label="Name" value={session.user.name} />
        <InfoRow label="Email" value={session.user.email} />
        <InfoRow label="Role" value={session.user.role} />
      </div>

      {/* Change password */}
      <div className="bg-surface rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Change Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Current password">
            <input
              {...register('currentPassword')}
              type="password"
              className="input"
            />
            {errors.currentPassword && (
              <p className="text-rasi-r text-xs mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </Field>

          <Field label="New password">
            <input
              {...register('newPassword')}
              type="password"
              className="input"
            />
            {errors.newPassword && (
              <p className="text-rasi-r text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </Field>

          <Field label="Confirm new password">
            <input
              {...register('confirmPassword')}
              type="password"
              className="input"
            />
            {errors.confirmPassword && (
              <p className="text-rasi-r text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </Field>

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-rasi-r">
              {serverError}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Password updated successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-secondary text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
