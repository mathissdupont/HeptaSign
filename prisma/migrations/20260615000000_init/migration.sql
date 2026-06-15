CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SIGNED', 'REVOKED', 'SUPERSEDED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Document" (
  "id" TEXT NOT NULL,
  "documentCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "originalFilePath" TEXT NOT NULL,
  "signedFilePath" TEXT,
  "originalFileHash" TEXT,
  "signedFileHash" TEXT,
  "verificationToken" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentFile" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentSignature" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "signedById" TEXT NOT NULL,
  "signedByName" TEXT NOT NULL,
  "signedByRole" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "originalFileHash" TEXT NOT NULL,
  "signedFileHash" TEXT NOT NULL,
  "verificationToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentSignature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Document_documentCode_key" ON "Document"("documentCode");
CREATE UNIQUE INDEX "Document_verificationToken_key" ON "Document"("verificationToken");
CREATE INDEX "Document_title_idx" ON "Document"("title");
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");
CREATE INDEX "DocumentFile_documentId_idx" ON "DocumentFile"("documentId");
CREATE UNIQUE INDEX "DocumentSignature_verificationToken_key" ON "DocumentSignature"("verificationToken");
CREATE INDEX "DocumentSignature_documentId_idx" ON "DocumentSignature"("documentId");
CREATE INDEX "DocumentSignature_signedAt_idx" ON "DocumentSignature"("signedAt");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentFile" ADD CONSTRAINT "DocumentFile_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentSignature" ADD CONSTRAINT "DocumentSignature_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
