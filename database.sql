-- Clinic AI Ops database flow
--
-- 1. User
--    Stores manager/operator accounts for JWT authentication.
--
-- 2. Branch
--    The central clinic entity. Most operational records belong to a branch.
--
-- 3. Staff
--    Clinic workers assigned to a branch. Staff can receive tasks and KPI records.
--
-- 4. PatientAppointment + Sale
--    Demand and revenue signals used by the dashboard and roster recommendation logic.
--
-- 5. Task
--    Daily operational work assigned to staff.
--
-- 6. KPIRecord
--    Performance records generated from completed tasks.
--
-- 7. RosterRecommendation + AISummary
--    AI/decision-support outputs for staffing and operations review.
--
-- Main data flow:
-- React Dashboard -> Express API -> Prisma ORM -> PostgreSQL
-- Branch -> Staff / Appointments / Sales / Tasks / KPI / AI Recommendations

CREATE SCHEMA IF NOT EXISTS public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StaffRole') THEN
    CREATE TYPE "StaffRole" AS ENUM ('DOCTOR', 'NURSE', 'RECEPTION', 'MANAGER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN
    CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'manager',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Branch" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "targetRevenue" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Staff" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "StaffRole" NOT NULL,
  "isWorking" BOOLEAN NOT NULL DEFAULT TRUE,
  "taskLoad" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Staff_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "PatientAppointment" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "patientName" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'confirmed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientAppointment_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Sale" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "service" TEXT NOT NULL,
  "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sale_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "queueCount" INTEGER NOT NULL DEFAULT 1,
  "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "Task_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "KPIRecord" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KPIRecord_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "KPIRecord_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "KPIRecord_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "RosterRecommendation" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "dayName" TEXT NOT NULL,
  "doctors" INTEGER NOT NULL,
  "nurses" INTEGER NOT NULL,
  "reception" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RosterRecommendation_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "AISummary" (
  "id" TEXT PRIMARY KEY,
  "branchId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AISummary_branchId_fkey"
    FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "Staff_branchId_idx" ON "Staff"("branchId");
CREATE INDEX IF NOT EXISTS "PatientAppointment_branchId_startsAt_idx" ON "PatientAppointment"("branchId", "startsAt");
CREATE INDEX IF NOT EXISTS "Sale_branchId_soldAt_idx" ON "Sale"("branchId", "soldAt");
CREATE INDEX IF NOT EXISTS "Task_branchId_status_idx" ON "Task"("branchId", "status");
CREATE INDEX IF NOT EXISTS "Task_staffId_idx" ON "Task"("staffId");
CREATE INDEX IF NOT EXISTS "KPIRecord_branchId_recordedAt_idx" ON "KPIRecord"("branchId", "recordedAt");
CREATE INDEX IF NOT EXISTS "RosterRecommendation_branchId_generatedAt_idx" ON "RosterRecommendation"("branchId", "generatedAt");
CREATE INDEX IF NOT EXISTS "AISummary_branchId_generatedAt_idx" ON "AISummary"("branchId", "generatedAt");

-- Demo manager account:
-- email: admin@clinicaiops.dev
-- password: password123
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "createdAt", "updatedAt")
VALUES
  (
    'user_demo_manager',
    'admin@clinicaiops.dev',
    '$2b$12$2dvdSEDz5NFBj63eOEBNyuEwMVGVWexpBTSfJM0IUb8TpYFKvuH5O',
    'Demo Manager',
    'manager',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("email") DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Branch" ("id", "name", "city", "targetRevenue", "createdAt", "updatedAt")
VALUES
  ('branch_bangkok', 'Bangkok Central Clinic', 'Bangkok', 150000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('branch_chiangmai', 'Chiang Mai Wellness Clinic', 'Chiang Mai', 90000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "city" = EXCLUDED."city",
  "targetRevenue" = EXCLUDED."targetRevenue",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Staff" ("id", "branchId", "name", "role", "isWorking", "taskLoad", "createdAt", "updatedAt")
VALUES
  ('staff_bkk_doctor_01', 'branch_bangkok', 'Dr. Narin', 'DOCTOR', TRUE, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff_bkk_nurse_01', 'branch_bangkok', 'Nurse Mali', 'NURSE', TRUE, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff_bkk_reception_01', 'branch_bangkok', 'Pim Reception', 'RECEPTION', TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff_cm_doctor_01', 'branch_chiangmai', 'Dr. Kanda', 'DOCTOR', TRUE, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff_cm_nurse_01', 'branch_chiangmai', 'Nurse Beam', 'NURSE', FALSE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('staff_cm_manager_01', 'branch_chiangmai', 'Anan Manager', 'MANAGER', TRUE, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "isWorking" = EXCLUDED."isWorking",
  "taskLoad" = EXCLUDED."taskLoad",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "PatientAppointment" ("id", "branchId", "patientName", "service", "startsAt", "status", "createdAt", "updatedAt")
VALUES
  ('appt_bkk_001', 'branch_bangkok', 'Patient A', 'Skin consultation', CURRENT_TIMESTAMP + INTERVAL '1 hour', 'confirmed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('appt_bkk_002', 'branch_bangkok', 'Patient B', 'Laser treatment', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'waiting', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('appt_bkk_003', 'branch_bangkok', 'Patient C', 'Follow-up', CURRENT_TIMESTAMP + INTERVAL '3 hours', 'confirmed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('appt_cm_001', 'branch_chiangmai', 'Patient D', 'Wellness check', CURRENT_TIMESTAMP + INTERVAL '1 hour', 'confirmed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('appt_cm_002', 'branch_chiangmai', 'Patient E', 'Aesthetic treatment', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'done', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "patientName" = EXCLUDED."patientName",
  "service" = EXCLUDED."service",
  "startsAt" = EXCLUDED."startsAt",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Sale" ("id", "branchId", "amount", "service", "soldAt")
VALUES
  ('sale_bkk_001', 'branch_bangkok', 45000, 'Laser treatment package', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
  ('sale_bkk_002', 'branch_bangkok', 82000, 'Aesthetic package', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
  ('sale_cm_001', 'branch_chiangmai', 28000, 'Wellness package', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
  ('sale_cm_002', 'branch_chiangmai', 36000, 'Skin care package', CURRENT_TIMESTAMP - INTERVAL '30 minutes')
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "amount" = EXCLUDED."amount",
  "service" = EXCLUDED."service",
  "soldAt" = EXCLUDED."soldAt";

INSERT INTO "Task" ("id", "branchId", "staffId", "title", "queueCount", "status", "startedAt", "completedAt", "createdAt", "updatedAt")
VALUES
  ('task_bkk_001', 'branch_bangkok', 'staff_bkk_doctor_01', 'Review high-value treatment cases', 3, 'IN_PROGRESS', CURRENT_TIMESTAMP - INTERVAL '25 minutes', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('task_bkk_002', 'branch_bangkok', 'staff_bkk_nurse_01', 'Prepare laser treatment room', 5, 'TODO', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('task_bkk_003', 'branch_bangkok', 'staff_bkk_reception_01', 'Confirm afternoon appointments', 8, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '70 minutes', CURRENT_TIMESTAMP - INTERVAL '35 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('task_cm_001', 'branch_chiangmai', 'staff_cm_doctor_01', 'Review wellness check queue', 2, 'TODO', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('task_cm_002', 'branch_chiangmai', 'staff_cm_manager_01', 'Check daily branch KPI', 1, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '90 minutes', CURRENT_TIMESTAMP - INTERVAL '50 minutes', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "staffId" = EXCLUDED."staffId",
  "title" = EXCLUDED."title",
  "queueCount" = EXCLUDED."queueCount",
  "status" = EXCLUDED."status",
  "startedAt" = EXCLUDED."startedAt",
  "completedAt" = EXCLUDED."completedAt",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "KPIRecord" ("id", "branchId", "staffId", "taskId", "durationMinutes", "score", "recordedAt")
VALUES
  ('kpi_bkk_001', 'branch_bangkok', 'staff_bkk_reception_01', 'task_bkk_003', 35, 92, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
  ('kpi_cm_001', 'branch_chiangmai', 'staff_cm_manager_01', 'task_cm_002', 40, 88, CURRENT_TIMESTAMP - INTERVAL '45 minutes')
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "staffId" = EXCLUDED."staffId",
  "taskId" = EXCLUDED."taskId",
  "durationMinutes" = EXCLUDED."durationMinutes",
  "score" = EXCLUDED."score",
  "recordedAt" = EXCLUDED."recordedAt";

INSERT INTO "RosterRecommendation" ("id", "branchId", "dayName", "doctors", "nurses", "reception", "reason", "generatedAt")
VALUES
  (
    'roster_bkk_sat',
    'branch_bangkok',
    'Saturday',
    3,
    4,
    2,
    'Peak demand from current appointments and revenue. Add nursing and reception coverage.',
    CURRENT_TIMESTAMP - INTERVAL '20 minutes'
  ),
  (
    'roster_cm_sat',
    'branch_chiangmai',
    'Saturday',
    2,
    2,
    1,
    'Current workload is stable. Standard staffing should be enough.',
    CURRENT_TIMESTAMP - INTERVAL '20 minutes'
  )
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "dayName" = EXCLUDED."dayName",
  "doctors" = EXCLUDED."doctors",
  "nurses" = EXCLUDED."nurses",
  "reception" = EXCLUDED."reception",
  "reason" = EXCLUDED."reason",
  "generatedAt" = EXCLUDED."generatedAt";

INSERT INTO "AISummary" ("id", "branchId", "summary", "generatedAt")
VALUES
  (
    'summary_bkk_today',
    'branch_bangkok',
    'Bangkok branch has strong afternoon demand. Prioritize laser room readiness and front desk appointment confirmation.',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
  ),
  (
    'summary_cm_today',
    'branch_chiangmai',
    'Chiang Mai branch is within normal workload. Keep doctor coverage steady and monitor walk-in volume.',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
  )
ON CONFLICT ("id") DO UPDATE SET
  "branchId" = EXCLUDED."branchId",
  "summary" = EXCLUDED."summary",
  "generatedAt" = EXCLUDED."generatedAt";
