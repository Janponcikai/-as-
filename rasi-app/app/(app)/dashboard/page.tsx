import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const { tenantId, role } = session.user

  const [processMaps, processes, rasiMatrices, recentLogs, openBugs] =
    await Promise.all([
      prisma.processMap.count({ where: { tenantId } }),
      prisma.process.count({ where: { tenantId } }),
      prisma.rasiMatrix.count({ where: { tenantId } }),
      prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
      role === 'ADMIN' || role === 'SUPER_ADMIN'
        ? prisma.bugReport.count({ where: { tenantId, status: 'OPEN' } })
        : null,
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Welcome, {session.user.name}
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Here&apos;s an overview of your process landscape.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Process Maps" value={processMaps} />
        <StatCard label="Processes" value={processes} />
        <StatCard label="RASI Matrices" value={rasiMatrices} />
        {openBugs !== null && (
          <StatCard label="Open Bug Reports" value={openBugs} alert />
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Quick access
        </h2>
        <div className="flex gap-3 flex-wrap">
          <QuickLink href="/process-map" label="Process Map" />
          <QuickLink href="/job-description" label="Job Description" />
          <QuickLink href="/checklist" label="Checklist" />
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Recent changes
        </h2>
        <div className="bg-surface rounded-xl border border-slate-200 divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-text-muted text-center">
              No activity yet.
            </p>
          ) : (
            recentLogs.map((log: typeof recentLogs[0]) => (
              <div
                key={log.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {log.entityType}
                  </span>
                  <span className="text-sm text-slate-700">{log.action}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">{log.user.name}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string
  value: number
  alert?: boolean
}) {
  return (
    <div
      className={`bg-surface rounded-xl border p-4 ${alert ? 'border-orange-200' : 'border-slate-200'}`}
    >
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className={`text-sm mt-1 ${alert ? 'text-rasi-a' : 'text-text-muted'}`}>
        {label}
      </p>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-surface border border-slate-200 hover:border-accent hover:text-accent text-sm font-medium px-4 py-2 rounded-lg transition-colors"
    >
      {label} →
    </Link>
  )
}
