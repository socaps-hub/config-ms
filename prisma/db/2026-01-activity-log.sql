-- Activity Log (AL01AuditLog)

CREATE TYPE "AuditAction" AS ENUM (
  'CREATE','UPDATE','DELETE','LOGIN','LOGOUT',
  'PASSWORD_CHANGE','ASSIGN','UNASSIGN',
  'UPLOAD','MIGRATE','EXECUTE','ERROR'
);

CREATE TYPE "AuditResult" AS ENUM ('SUCCESS','FAILED');
CREATE TYPE "AuditSource" AS ENUM ('API','SYSTEM','JOB','MIGRATION');

CREATE TABLE "AL01AuditLog" (
  "AL01Id" BIGSERIAL PRIMARY KEY,

  "AL01Service" TEXT NOT NULL,
  "AL01Module" TEXT NOT NULL,
  "AL01Action" "AuditAction" NOT NULL,
  "AL01Source" "AuditSource" NOT NULL DEFAULT 'API',
  "AL01Result" "AuditResult" NOT NULL DEFAULT 'SUCCESS',
  "AL01EventName" TEXT,

  "AL01Entity" TEXT NOT NULL,
  "AL01EntityId" TEXT,

  "AL01UserId" TEXT,
  "AL01UserNombre" TEXT,
  "AL01UserRol" TEXT,

  "AL01CooperativaId" TEXT,
  "AL01SucursalId" TEXT,

  "AL01Before" JSONB,
  "AL01After" JSONB,

  "AL01Ip" TEXT,
  "AL01UserAgent" TEXT,
  "AL01RequestId" TEXT,
  "AL01CorrelationId" TEXT,

  "AL01Message" TEXT,
  "AL01Error" TEXT,

  "AL01CreatedAt" TIMESTAMP DEFAULT now()
);

CREATE INDEX ON "AL01AuditLog" ("AL01Service","AL01Module");
CREATE INDEX ON "AL01AuditLog" ("AL01Action");
CREATE INDEX ON "AL01AuditLog" ("AL01Entity","AL01EntityId");
CREATE INDEX ON "AL01AuditLog" ("AL01UserId");
CREATE INDEX ON "AL01AuditLog" ("AL01CooperativaId");
CREATE INDEX ON "AL01AuditLog" ("AL01CreatedAt");
CREATE INDEX ON "AL01AuditLog" ("AL01CooperativaId","AL01CreatedAt");
