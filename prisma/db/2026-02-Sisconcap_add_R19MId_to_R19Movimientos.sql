BEGIN;

-- 1) Agregar columna (nullable)
ALTER TABLE "R19Movimientos"
  ADD COLUMN IF NOT EXISTS "R19MId" TEXT;

-- 2) (Opcional recomendado) Comentario para auditoría interna
COMMENT ON COLUMN "R19Movimientos"."R19MId"
  IS 'Campo opcional agregado en producción: R19MId';

COMMIT;