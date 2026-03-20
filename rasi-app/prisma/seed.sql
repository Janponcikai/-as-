-- ─── SEED DATA — RASI Process Manager ───────────────────────────────────────
-- Spusť v: Supabase Dashboard → SQL Editor → New query → paste → Run

-- ── Tenant ────────────────────────────────────────────────────────────────────
INSERT INTO "Tenant" ("id", "name", "slug", "plan", "createdAt", "updatedAt")
VALUES ('tenant-interconnect', 'Interconnect Division', 'interconnect', 'FREE', now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- ── Users (hesla: Admin123! / Editor123! / Viewer123!) ────────────────────────
INSERT INTO "User" ("id", "tenantId", "email", "passwordHash", "name", "role", "isActive", "createdAt", "updatedAt")
VALUES
  ('user-admin',  'tenant-interconnect', 'admin@company.com',  '$2b$12$20aQpweGHydLHwJ59EUZz.vGXZKDcF8gWIIdzpn0rzLfwAbXeku42', 'System Admin',   'ADMIN',  true, now(), now()),
  ('user-editor', 'tenant-interconnect', 'editor@company.com', '$2b$12$wrFUYNsiOB2rw8HDblVRcutvPh.zt06ZWj6bnqWI0qNzpJQRWvX/2', 'Process Editor', 'EDITOR', true, now(), now()),
  ('user-viewer', 'tenant-interconnect', 'viewer@company.com', '$2b$12$x.eGXSuPmARM/BquFDwAe.hQsN9EoQWDaE81mUl2XoFpieKH/NfOe', 'View Only',      'VIEWER', true, now(), now())
ON CONFLICT ("tenantId", "email") DO NOTHING;

-- ── Positions ─────────────────────────────────────────────────────────────────
INSERT INTO "Position" ("id", "tenantId", "name", "code", "department")
VALUES
  ('pos-ct',   'tenant-interconnect', 'Costing Technician',      'CT',   'Engineering'),
  ('pos-pm',   'tenant-interconnect', 'Process Manager',         'PM',   'Engineering'),
  ('pos-pql',  'tenant-interconnect', 'Project Quality Leader',  'PQL',  'Quality'),
  ('pos-pmgr', 'tenant-interconnect', 'Project Manager',         'PMGR', 'Management'),
  ('pos-pe',   'tenant-interconnect', 'Process Engineer',        'PE',   'Engineering'),
  ('pos-plm',  'tenant-interconnect', 'Plant Manager',           'PLM',  'Management')
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- ── Process Maps (Level 1) ────────────────────────────────────────────────────
INSERT INTO "ProcessMap" ("id", "tenantId", "name", "type", "order", "isActive")
VALUES
  ('pm-FP1', 'tenant-interconnect', 'Management responsibility',    'MANAGING',   0, true),
  ('pm-FP2', 'tenant-interconnect', 'Quality management system',    'MANAGING',   1, true),
  ('pm-FP3', 'tenant-interconnect', 'Controlling',                  'MANAGING',   2, true),
  ('pm-FP4', 'tenant-interconnect', 'EHS',                          'MANAGING',   3, true),
  ('pm-KP1', 'tenant-interconnect', 'Production',                   'CORE',       0, true),
  ('pm-KP2', 'tenant-interconnect', 'Project Engineering',          'CORE',       1, true),
  ('pm-UP1', 'tenant-interconnect', 'Material Management',          'SUPPORTING', 0, true),
  ('pm-UP2', 'tenant-interconnect', 'Quality',                      'SUPPORTING', 1, true),
  ('pm-UP3', 'tenant-interconnect', 'Human Resources',              'SUPPORTING', 2, true),
  ('pm-UP4', 'tenant-interconnect', 'Total productive maintenance', 'SUPPORTING', 3, true),
  ('pm-UP5', 'tenant-interconnect', 'Process Engineer',             'SUPPORTING', 4, true),
  ('pm-UP6', 'tenant-interconnect', 'Purchasing',                   'SUPPORTING', 5, true)
ON CONFLICT ("id") DO NOTHING;

-- ── Processes (Level 2) under KP2 ────────────────────────────────────────────
INSERT INTO "Process" ("id", "tenantId", "processMapId", "name", "code", "order")
VALUES
  ('proc-kp21', 'tenant-interconnect', 'pm-KP2', 'Project planning',           'KP2.1', 0),
  ('proc-kp22', 'tenant-interconnect', 'pm-KP2', 'Equipment duplication',      'KP2.2', 1),
  ('proc-kp23', 'tenant-interconnect', 'pm-KP2', 'New product implementation', 'KP2.3', 2),
  ('proc-kp24', 'tenant-interconnect', 'pm-KP2', 'Change management',          'KP2.4', 3)
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- ── Sub-processes (Level 3) ───────────────────────────────────────────────────
INSERT INTO "SubProcess" ("id", "tenantId", "processId", "name", "code", "order")
VALUES
  ('sp-kp211', 'tenant-interconnect', 'proc-kp21', 'IPP',                              'KP2.1.1', 0),
  ('sp-kp212', 'tenant-interconnect', 'proc-kp21', 'Sales',                            'KP2.1.2', 1),
  ('sp-kp213', 'tenant-interconnect', 'proc-kp21', 'Costing',                          'KP2.1.3', 2),
  ('sp-kp221', 'tenant-interconnect', 'proc-kp22', 'Machine/Line upgrade',             'KP2.2.1', 0),
  ('sp-kp222', 'tenant-interconnect', 'proc-kp22', 'Machine/Line implementation',      'KP2.2.2', 1),
  ('sp-kp23a', 'tenant-interconnect', 'proc-kp23', 'Final product',                    'KP2.3.A', 0),
  ('sp-kp23b', 'tenant-interconnect', 'proc-kp23', 'Semi-finish product',              'KP2.3.B', 1),
  ('sp-kp23c', 'tenant-interconnect', 'proc-kp23', 'Equipment',                        'KP2.3.C', 2),
  ('sp-kp23d', 'tenant-interconnect', 'proc-kp23', 'Product development',              'KP2.3.D', 3),
  ('sp-kp23e', 'tenant-interconnect', 'proc-kp23', 'Prototypes',                       'KP2.3.E', 4),
  ('sp-kp24a', 'tenant-interconnect', 'proc-kp24', 'Change in RFQ phase',              'KP2.4.A', 0),
  ('sp-kp24b', 'tenant-interconnect', 'proc-kp24', 'Change management (PCN, ICR, PTN)','KP2.4.B', 1),
  ('sp-kp24c', 'tenant-interconnect', 'proc-kp24', 'Change management in QMS',         'KP2.4.C', 2),
  ('sp-kp24d', 'tenant-interconnect', 'proc-kp24', 'Change in project phase',          'KP2.4.D', 3)
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- ── Process Step KP2.3.49 — RFQ Team Nomination (Level 4) ────────────────────
INSERT INTO "ProcessStep" ("id", "tenantId", "subProcessId", "name", "code", "order", "type", "input", "output")
VALUES (
  'step-kp2349',
  'tenant-interconnect',
  'sp-kp23a',
  'RFQ Team Nomination',
  'KP2.3.49',
  49,
  'STEP',
  'Customer drawing, customer norms, volumes, customer time planning, pre-process flow, calculation. Trigger: information from customer about start SCR.',
  'Nominated team listed in presentation from costing.'
)
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- Activity steps under KP2.3.49
INSERT INTO "ProcessStep" ("id", "tenantId", "subProcessId", "name", "code", "order", "type")
VALUES
  ('step-kp2349-1', 'tenant-interconnect', 'sp-kp23a', 'Short presentation',         'KP2.3.49.1', 0, 'STEP'),
  ('step-kp2349-2', 'tenant-interconnect', 'sp-kp23a', 'Ask for team member',         'KP2.3.49.2', 1, 'STEP'),
  ('step-kp2349-3', 'tenant-interconnect', 'sp-kp23a', 'Team member PE nomination',   'KP2.3.49.3', 2, 'STEP'),
  ('step-kp2349-4', 'tenant-interconnect', 'sp-kp23a', 'Team member QE nomination',   'KP2.3.49.4', 3, 'STEP'),
  ('step-kp2349-5', 'tenant-interconnect', 'sp-kp23a', 'Team member PL nomination',   'KP2.3.49.5', 4, 'STEP'),
  ('step-kp2349-6', 'tenant-interconnect', 'sp-kp23a', 'Share team information',      'KP2.3.49.6', 5, 'STEP')
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- ── RASI Matrix for KP2.3.49 ─────────────────────────────────────────────────
INSERT INTO "RasiMatrix" ("id", "tenantId", "stepId")
VALUES ('rasi-kp2349', 'tenant-interconnect', 'step-kp2349')
ON CONFLICT ("stepId") DO NOTHING;

-- RASI rows: CT=R, PM=S, PQL=S, PMGR=S (aggregate across activities)
INSERT INTO "RasiRow" ("id", "rasiMatrixId", "positionId", "responsible", "approve", "support", "inform")
VALUES
  ('rasirow-ct',   'rasi-kp2349', 'pos-ct',   true,  false, false, true),
  ('rasirow-pm',   'rasi-kp2349', 'pos-pm',   true,  false, true,  true),
  ('rasirow-pql',  'rasi-kp2349', 'pos-pql',  true,  false, true,  true),
  ('rasirow-pmgr', 'rasi-kp2349', 'pos-pmgr', true,  false, true,  true)
ON CONFLICT ("rasiMatrixId", "positionId") DO NOTHING;
