CREATE TABLE "DocumentAssignment" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assignedById" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "signedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentAssignment_documentId_userId_key" ON "DocumentAssignment"("documentId", "userId");
CREATE INDEX "DocumentAssignment_userId_idx" ON "DocumentAssignment"("userId");
CREATE INDEX "DocumentAssignment_documentId_idx" ON "DocumentAssignment"("documentId");

ALTER TABLE "DocumentAssignment" ADD CONSTRAINT "DocumentAssignment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentAssignment" ADD CONSTRAINT "DocumentAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
