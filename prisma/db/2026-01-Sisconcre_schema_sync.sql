-- ============================================================
-- SISCONCRE – Sincronización de esquema (UUID PK)
-- Escenario: tablas TRUNCADAS, columnas aún no creadas
-- ============================================================

-- ============================================================
-- 1) R01Prestamo – agregar R01Id
-- ============================================================

ALTER TABLE "R01Prestamo"
  ADD COLUMN IF NOT EXISTS "R01Id" uuid;

ALTER TABLE "R01Prestamo"
  ALTER COLUMN "R01Id" SET DEFAULT gen_random_uuid();

-- ============================================================
-- 2) Evaluaciones y Resúmenes – agregar *_P_id y *_Id
-- ============================================================

-- Fase 1
ALTER TABLE "R05EvaluacionFase1" ADD COLUMN IF NOT EXISTS "R05P_id" uuid;
ALTER TABLE "R06EvaluacionResumenFase1" ADD COLUMN IF NOT EXISTS "R06Id" uuid;
ALTER TABLE "R06EvaluacionResumenFase1" ADD COLUMN IF NOT EXISTS "R06P_id" uuid;

-- Fase 2
ALTER TABLE "R07EvaluacionFase2" ADD COLUMN IF NOT EXISTS "R07P_id" uuid;
ALTER TABLE "R08EvaluacionResumenFase2" ADD COLUMN IF NOT EXISTS "R08Id" uuid;
ALTER TABLE "R08EvaluacionResumenFase2" ADD COLUMN IF NOT EXISTS "R08P_id" uuid;

-- Fase 3
ALTER TABLE "R09EvaluacionFase3" ADD COLUMN IF NOT EXISTS "R09P_id" uuid;
ALTER TABLE "R10EvaluacionResumenFase3" ADD COLUMN IF NOT EXISTS "R10Id" uuid;
ALTER TABLE "R10EvaluacionResumenFase3" ADD COLUMN IF NOT EXISTS "R10P_id" uuid;

-- Fase 4
ALTER TABLE "R15EvaluacionFase4" ADD COLUMN IF NOT EXISTS "R15P_id" uuid;
ALTER TABLE "R16EvaluacionResumenFase4" ADD COLUMN IF NOT EXISTS "R16Id" uuid;
ALTER TABLE "R16EvaluacionResumenFase4" ADD COLUMN IF NOT EXISTS "R16P_id" uuid;
