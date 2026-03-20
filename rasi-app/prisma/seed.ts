import { PrismaClient, UserRole, ProcessMapType, StepType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Tenant ────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'interconnect' },
    update: {},
    create: { name: 'Interconnect Division', slug: 'interconnect', plan: 'FREE' },
  })

  // ── Users ────────────────────────────────────────────────
  const users = [
    { email: 'admin@company.com', password: 'Admin123!', name: 'System Admin', role: UserRole.ADMIN },
    { email: 'editor@company.com', password: 'Editor123!', name: 'Process Editor', role: UserRole.EDITOR },
    { email: 'viewer@company.com', password: 'Viewer123!', name: 'View Only', role: UserRole.VIEWER },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12)
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: u.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: u.email,
        passwordHash: hash,
        name: u.name,
        role: u.role,
      },
    })
  }

  // ── Positions ─────────────────────────────────────────────
  const positionData = [
    { code: 'CT', name: 'Costing Technician', department: 'Engineering' },
    { code: 'PM', name: 'Process Manager', department: 'Engineering' },
    { code: 'PQL', name: 'Project Quality Leader', department: 'Quality' },
    { code: 'PMGR', name: 'Project Manager', department: 'Management' },
    { code: 'PE', name: 'Process Engineer', department: 'Engineering' },
    { code: 'PLM', name: 'Plant Manager', department: 'Management' },
  ]

  const positions: Record<string, { id: string }> = {}
  for (const p of positionData) {
    const pos = await prisma.position.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: p.code } },
      update: {},
      create: { tenantId: tenant.id, ...p },
    })
    positions[p.code] = pos
  }

  // ── Level 1: Process Maps ─────────────────────────────────
  const managingMaps = [
    { code: 'FP1', name: 'Management responsibility' },
    { code: 'FP2', name: 'Quality management system' },
    { code: 'FP3', name: 'Controlling' },
    { code: 'FP4', name: 'EHS' },
  ]
  const coreMaps = [
    { code: 'KP1', name: 'Production' },
    { code: 'KP2', name: 'Project Engineering' },
  ]
  const supportingMaps = [
    { code: 'UP1', name: 'Material Management' },
    { code: 'UP2', name: 'Quality' },
    { code: 'UP3', name: 'Human Resources' },
    { code: 'UP4', name: 'Total productive maintenance' },
    { code: 'UP5', name: 'Process Engineer' },
    { code: 'UP6', name: 'Purchasing' },
  ]

  const processMaps: Record<string, { id: string }> = {}

  for (let i = 0; i < managingMaps.length; i++) { const m = managingMaps[i]
    const pm = await prisma.processMap.upsert({
      where: { id: `pm-${m.code}` },
      update: {},
      create: {
        id: `pm-${m.code}`,
        tenantId: tenant.id,
        name: m.name,
        type: ProcessMapType.MANAGING,
        order: i,
      },
    })
    processMaps[m.code] = pm
  }
  for (let i = 0; i < coreMaps.length; i++) { const m = coreMaps[i]
    const pm = await prisma.processMap.upsert({
      where: { id: `pm-${m.code}` },
      update: {},
      create: {
        id: `pm-${m.code}`,
        tenantId: tenant.id,
        name: m.name,
        type: ProcessMapType.CORE,
        order: i,
      },
    })
    processMaps[m.code] = pm
  }
  for (let i = 0; i < supportingMaps.length; i++) { const m = supportingMaps[i]
    const pm = await prisma.processMap.upsert({
      where: { id: `pm-${m.code}` },
      update: {},
      create: {
        id: `pm-${m.code}`,
        tenantId: tenant.id,
        name: m.name,
        type: ProcessMapType.SUPPORTING,
        order: i,
      },
    })
    processMaps[m.code] = pm
  }

  // ── Level 2: Processes under KP2 ─────────────────────────
  const kp2Id = processMaps['KP2'].id

  const processData = [
    { code: 'KP2.1', name: 'Project planning', order: 0 },
    { code: 'KP2.2', name: 'Equipment duplication', order: 1 },
    { code: 'KP2.3', name: 'New product implementation', order: 2 },
    { code: 'KP2.4', name: 'Change management', order: 3 },
  ]

  const procs: Record<string, { id: string }> = {}
  for (const p of processData) {
    const proc = await prisma.process.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: p.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        processMapId: kp2Id,
        name: p.name,
        code: p.code,
        order: p.order,
      },
    })
    procs[p.code] = proc
  }

  // ── Level 3: Sub-processes ────────────────────────────────
  const subProcessData = [
    { code: 'KP2.1.1', name: 'IPP', processCode: 'KP2.1', order: 0 },
    { code: 'KP2.1.2', name: 'Sales', processCode: 'KP2.1', order: 1 },
    { code: 'KP2.1.3', name: 'Costing', processCode: 'KP2.1', order: 2 },
    { code: 'KP2.2.1', name: 'Machine/Line upgrade', processCode: 'KP2.2', order: 0 },
    { code: 'KP2.2.2', name: 'Machine/Line implementation', processCode: 'KP2.2', order: 1 },
    { code: 'KP2.3.A', name: 'Final product', processCode: 'KP2.3', order: 0 },
    { code: 'KP2.3.B', name: 'Semi-finish product', processCode: 'KP2.3', order: 1 },
    { code: 'KP2.3.C', name: 'Equipment', processCode: 'KP2.3', order: 2 },
    { code: 'KP2.3.D', name: 'Product development', processCode: 'KP2.3', order: 3 },
    { code: 'KP2.3.E', name: 'Prototypes', processCode: 'KP2.3', order: 4 },
    { code: 'KP2.4.A', name: 'Change in RFQ phase', processCode: 'KP2.4', order: 0 },
    { code: 'KP2.4.B', name: 'Change management (PCN, ICR, PTN)', processCode: 'KP2.4', order: 1 },
    { code: 'KP2.4.C', name: 'Change management in QMS', processCode: 'KP2.4', order: 2 },
    { code: 'KP2.4.D', name: 'Change in project phase', processCode: 'KP2.4', order: 3 },
  ]

  const subProcs: Record<string, { id: string }> = {}
  for (const sp of subProcessData) {
    const sub = await prisma.subProcess.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: sp.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        processId: procs[sp.processCode].id,
        name: sp.name,
        code: sp.code,
        order: sp.order,
      },
    })
    subProcs[sp.code] = sub
  }

  // ── Level 4: Steps for KP2.3.A (demo RASI) ───────────────
  const activities = [
    'Short presentation',
    'Ask for team member',
    'Team member PE nomination',
    'Team member QE nomination',
    'Team member PL nomination',
    'Share team information',
  ]

  const steps: { id: string }[] = []
  for (let i = 0; i < activities.length; i++) { const name = activities[i]
    const step = await prisma.processStep.upsert({
      where: {
        tenantId_code: { tenantId: tenant.id, code: `KP2.3.49.${i + 1}` },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        subProcessId: subProcs['KP2.3.A'].id,
        name,
        code: `KP2.3.49.${i + 1}`,
        order: i,
        type: StepType.STEP,
      },
    })
    steps.push(step)
  }

  // ── Parent step for RASI (KP2.3.49) ─────────────────────
  const parentStep = await prisma.processStep.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'KP2.3.49' } },
    update: {},
    create: {
      tenantId: tenant.id,
      subProcessId: subProcs['KP2.3.A'].id,
      name: 'RFQ Team Nomination',
      code: 'KP2.3.49',
      order: 49,
      type: StepType.STEP,
      input:
        'Customer drawing, customer norms, volumes, customer time planning, pre-process flow, calculation. Trigger: information from customer about start SCR.',
      output: 'Nominated team listed in presentation from costing.',
    },
  })

  // ── RASI Matrix ───────────────────────────────────────────
  const existingMatrix = await prisma.rasiMatrix.findUnique({
    where: { stepId: parentStep.id },
  })

  if (!existingMatrix) {
    const matrix = await prisma.rasiMatrix.create({
      data: { tenantId: tenant.id, stepId: parentStep.id },
    })

    // CT: R R I I I R
    // PM: I S R I I I  (Note: R here means responsible for activity 3 = PE nom)
    // PQL: I S I R I I
    // PMGR: I S I I R I

    const rasiData = [
      {
        positionCode: 'CT',
        rows: [
          { r: true, a: false, s: false, i: false },
          { r: true, a: false, s: false, i: false },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
          { r: true, a: false, s: false, i: false },
        ],
      },
      {
        positionCode: 'PM',
        rows: [
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: true, i: false },
          { r: true, a: false, s: false, i: false },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
        ],
      },
      {
        positionCode: 'PQL',
        rows: [
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: true, i: false },
          { r: false, a: false, s: false, i: true },
          { r: true, a: false, s: false, i: false },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
        ],
      },
      {
        positionCode: 'PMGR',
        rows: [
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: true, i: false },
          { r: false, a: false, s: false, i: true },
          { r: false, a: false, s: false, i: true },
          { r: true, a: false, s: false, i: false },
          { r: false, a: false, s: false, i: true },
        ],
      },
    ]

    // For RASI we store one row per position (aggregated across all activities)
    // Use the dominant role (R > A > S > I) per position
    for (const pd of rasiData) {
      const pos = positions[pd.positionCode]
      const hasR = pd.rows.some((r) => r.r)
      const hasA = pd.rows.some((r) => r.a)
      const hasS = pd.rows.some((r) => r.s)
      const hasI = pd.rows.some((r) => r.i)

      await prisma.rasiRow.create({
        data: {
          rasiMatrixId: matrix.id,
          positionId: pos.id,
          responsible: hasR,
          approve: hasA,
          support: hasS,
          inform: hasI,
        },
      })
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
