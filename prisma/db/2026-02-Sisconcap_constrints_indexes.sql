-- =====================================================
-- INDICES EVALUACIONES FASE 1
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r20_folio
ON "R20EvaluacionFase1Sisconcap" ("R20Folio");


-- =====================================================
-- INDICES EVALUACIONES FASE 2
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r22_folio
ON "R22EvaluacionFase2Sisconcap" ("R22Folio");


-- =====================================================
-- INDICES EVALUACIONES FASE 3
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r24_folio
ON "R24EvaluacionFase3Sisconcap" ("R24Folio");

-- =====================================================
-- INDICES RESUMEN FASE 1
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r21_folio
ON "R21EvaluacionResumenFase1" ("R21Folio");


-- =====================================================
-- INDICES RESUMEN FASE 2
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r23_folio
ON "R23EvaluacionResumenFase2" ("R23Folio");


-- =====================================================
-- INDICES RESUMEN FASE 3
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r25_folio
ON "R25EvaluacionResumenFase3" ("R25Folio");

-- =====================================================
-- INDICE MOVIMIENTOS POR COOPERATIVA
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_r19_coop
ON "R19Movimientos" ("R19Coop_id");
