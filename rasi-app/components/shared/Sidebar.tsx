'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { UserRole } from '@prisma/client'

interface NavItem {
  href: string
  label: string
  icon: string
  minRole?: UserRole
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/process-map', label: 'Process Map', icon: '◈' },
  { href: '/job-description', label: 'Job Description', icon: '☰' },
  { href: '/checklist', label: 'Checklist', icon: '✓' },
  { href: '/search', label: 'Search', icon: '⌕' },
]

const ADMIN_NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Admin', icon: '⚙' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/bug-reports', label: 'Bug Reports', icon: '🐛' },
  { href: '/admin/import', label: 'Import', icon: '↑' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '📋' },
]

interface SidebarProps {
  role: UserRole
  userName: string
}

export default function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-64 bg-primary text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
            R
          </div>
          <span className="font-bold text-sm tracking-wide">
            RASI Process Manager
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-white/15 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                Admin
              </p>
            </div>
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-white/50 text-xs">{role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/account"
            className="flex-1 text-center text-xs py-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            Account
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex-1 text-center text-xs py-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
