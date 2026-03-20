import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProcessMapPage() {
  const session = await auth()
  if (!session) return null

  const maps = await prisma.processMap.findMany({
    where: { tenantId: session.user.tenantId, isActive: true },
    include: { processes: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })

  const managing = maps.filter((m) => m.type === 'MANAGING')
  const core = maps.filter((m) => m.type === 'CORE')
  const supporting = maps.filter((m) => m.type === 'SUPPORTING')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Process Map</h1>
        <p className="text-text-muted text-sm mt-1">
          Click a process to explore its hierarchy.
        </p>
      </div>

      {/* Visual process map */}
      <div className="relative bg-surface rounded-xl border border-slate-200 overflow-hidden">
        {/* Left arrow */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center -translate-x-16 z-10">
          <p className="text-xs font-medium text-text-muted bg-slate-100 px-3 py-1 rounded whitespace-nowrap">
            Legal requirements · Customer requirements · Risks
          </p>
        </div>
        {/* Right arrow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 origin-center translate-x-16 z-10">
          <p className="text-xs font-medium text-text-muted bg-slate-100 px-3 py-1 rounded whitespace-nowrap">
            Customer satisfaction
          </p>
        </div>

        <div className="ml-12 mr-12">
          <Band label="MANAGING PROCESSES" color="managing" maps={managing} />
          <Band label="CORE PROCESSES" color="core" maps={core} />
          <Band label="SUPPORTING PROCESSES" color="supporting" maps={supporting} />
        </div>

        {/* Feedback bar */}
        <div className="bg-slate-100 text-center text-xs font-medium text-text-muted py-2 tracking-wider uppercase">
          Feedback
        </div>
      </div>
    </div>
  )
}

const COLOR_MAP: Record<string, string> = {
  managing: 'bg-managing',
  core: 'bg-core',
  supporting: 'bg-supporting',
}

function Band({
  label,
  color,
  maps,
}: {
  label: string
  color: string
  maps: { id: string; name: string; processes: { id: string; code: string }[] }[]
}) {
  return (
    <div className="border-b border-white/20 last:border-0">
      <div className={`${COLOR_MAP[color]} px-6 py-4`}>
        <p className="text-white text-xs font-bold tracking-widest uppercase mb-3">
          {label}
        </p>
        <div className="flex flex-wrap gap-3">
          {maps.map((m) => (
            <ProcessCard key={m.id} map={m} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProcessCard({
  map,
}: {
  map: { id: string; name: string; processes: { id: string; code: string }[] }
}) {
  const firstProcess = map.processes[0]
  const href = firstProcess
    ? `/process-map/${firstProcess.id}`
    : `/process-map/${map.id}`

  return (
    <Link
      href={href}
      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 min-w-[120px] transition-colors cursor-pointer"
    >
      <p className="text-white font-mono font-bold text-sm">
        {map.processes[0]?.code ?? map.id.slice(3, 6)}
      </p>
      <p className="text-white/80 text-xs mt-0.5 leading-tight">{map.name}</p>
    </Link>
  )
}
