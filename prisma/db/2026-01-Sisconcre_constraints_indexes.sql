-- ============================================================
-- SISCONCRE – Creación de constraints + índices
-- Escenario: tablas truncadas (sin datos)
-- ============================================================

BEGIN;

-- ============================================================
-- 1) R01Prestamo
-- ============================================================

-- PK técnica (UUID)
ALTER TABLE "R01Prestamo"
  ADD CONSTRAINT "pk_R01Prestamo"
  PRIMARY KEY ("R01Id");

-- Clave de negocio
ALTER TABLE "R01Prestamo"
  ADD CONSTRAINT "uq_R01Prestamo_NUM_COOP"
  UNIQUE ("R01NUM", "R01Coop_id");

COMMIT;

-- Índices de acceso frecuente
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R01Prestamo_Coop"
  ON "R01Prestamo" ("R01Coop_id");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R01Prestamo_Suc"
  ON "R01Prestamo" ("R01Suc_id");

-- ============================================================
-- 2) Fase 1
-- ============================================================

BEGIN;

ALTER TABLE "R05EvaluacionFase1"
  ADD CONSTRAINT "pk_R05EvaluacionFase1"
  PRIMARY KEY ("R05Id");

ALTER TABLE "R05EvaluacionFase1"
  ADD CONSTRAINT "uq_R05_Pid_Eid"
  UNIQUE ("R05P_id", "R05E_id");

ALTER TABLE "R05EvaluacionFase1"
  ADD CONSTRAINT "fk_R05_Prestamo"
  FOREIGN KEY ("R05P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R05_Pid"
  ON "R05EvaluacionFase1" ("R05P_id");

-- -------- Resumen F1 --------

BEGIN;

ALTER TABLE "R06EvaluacionResumenFase1"
  ADD CONSTRAINT "pk_R06EvaluacionResumenFase1"
  PRIMARY KEY ("R06Id");

ALTER TABLE "R06EvaluacionResumenFase1"
  ADD CONSTRAINT "uq_R06_Pid"
  UNIQUE ("R06P_id");

ALTER TABLE "R06EvaluacionResumenFase1"
  ADD CONSTRAINT "fk_R06_Prestamo"
  FOREIGN KEY ("R06P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R06_EvPor"
  ON "R06EvaluacionResumenFase1" ("R06Ev_por");

-- ============================================================
-- 3) Fase 2
-- ============================================================

BEGIN;

ALTER TABLE "R07EvaluacionFase2"
  ADD CONSTRAINT "pk_R07EvaluacionFase2"
  PRIMARY KEY ("R07Id");

ALTER TABLE "R07EvaluacionFase2"
  ADD CONSTRAINT "uq_R07_Pid_Eid"
  UNIQUE ("R07P_id", "R07E_id");

ALTER TABLE "R07EvaluacionFase2"
  ADD CONSTRAINT "fk_R07_Prestamo"
  FOREIGN KEY ("R07P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R07_Pid"
  ON "R07EvaluacionFase2" ("R07P_id");

-- -------- Resumen F2 --------

BEGIN;

ALTER TABLE "R08EvaluacionResumenFase2"
  ADD CONSTRAINT "pk_R08EvaluacionResumenFase2"
  PRIMARY KEY ("R08Id");

ALTER TABLE "R08EvaluacionResumenFase2"
  ADD CONSTRAINT "uq_R08_Pid"
  UNIQUE ("R08P_id");

ALTER TABLE "R08EvaluacionResumenFase2"
  ADD CONSTRAINT "fk_R08_Prestamo"
  FOREIGN KEY ("R08P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R08_EvPor"
  ON "R08EvaluacionResumenFase2" ("R08Ev_por");

-- ============================================================
-- 4) Fase 3
-- ============================================================

BEGIN;

ALTER TABLE "R09EvaluacionFase3"
  ADD CONSTRAINT "pk_R09EvaluacionFase3"
  PRIMARY KEY ("R09Id");

ALTER TABLE "R09EvaluacionFase3"
  ADD CONSTRAINT "uq_R09_Pid_Eid"
  UNIQUE ("R09P_id", "R09E_id");

ALTER TABLE "R09EvaluacionFase3"
  ADD CONSTRAINT "fk_R09_Prestamo"
  FOREIGN KEY ("R09P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R09_Pid"
  ON "R09EvaluacionFase3" ("R09P_id");

-- -------- Resumen F3 --------

BEGIN;

ALTER TABLE "R10EvaluacionResumenFase3"
  ADD CONSTRAINT "pk_R10EvaluacionResumenFase3"
  PRIMARY KEY ("R10Id");

ALTER TABLE "R10EvaluacionResumenFase3"
  ADD CONSTRAINT "uq_R10_Pid"
  UNIQUE ("R10P_id");

ALTER TABLE "R10EvaluacionResumenFase3"
  ADD CONSTRAINT "fk_R10_Prestamo"
  FOREIGN KEY ("R10P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R10_EvPor"
  ON "R10EvaluacionResumenFase3" ("R10Ev_por");

-- ============================================================
-- 5) Fase 4
-- ============================================================

BEGIN;

ALTER TABLE "R15EvaluacionFase4"
  ADD CONSTRAINT "pk_R15EvaluacionFase4"
  PRIMARY KEY ("R15Id");

ALTER TABLE "R15EvaluacionFase4"
  ADD CONSTRAINT "uq_R15_Pid_Eid"
  UNIQUE ("R15P_id", "R15E_id");

ALTER TABLE "R15EvaluacionFase4"
  ADD CONSTRAINT "fk_R15_Prestamo"
  FOREIGN KEY ("R15P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R15_Pid"
  ON "R15EvaluacionFase4" ("R15P_id");

-- -------- Resumen F4 --------

BEGIN;

ALTER TABLE "R16EvaluacionResumenFase4"
  ADD CONSTRAINT "pk_R16EvaluacionResumenFase4"
  PRIMARY KEY ("R16Id");

ALTER TABLE "R16EvaluacionResumenFase4"
  ADD CONSTRAINT "uq_R16_Pid"
  UNIQUE ("R16P_id");

ALTER TABLE "R16EvaluacionResumenFase4"
  ADD CONSTRAINT "fk_R16_Prestamo"
  FOREIGN KEY ("R16P_id")
  REFERENCES "R01Prestamo" ("R01Id")
  ON DELETE CASCADE;

COMMIT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_R16_EvPor"
  ON "R16EvaluacionResumenFase4" ("R16Ev_por");

-- ============================================================
-- FIN
-- ============================================================
