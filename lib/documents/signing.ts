import { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getAppUrl } from "@/lib/env";
import { cryptoProvider } from "@/lib/crypto/provider";
import { readStoredFile, saveSignedPdf } from "@/lib/files/storage";
import { stampSignedPdf } from "@/lib/pdf/stamp";
import { writeAuditLog } from "@/lib/audit/audit";

type SignInput = {
  documentId: string;
  userId: string;
  signerName: string;
  signerRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function signDocument(input: SignInput) {
  const document = await prisma.document.findUnique({ where: { id: input.documentId } });
  if (!document) throw new Error("Document not found.");
  if (document.status !== DocumentStatus.DRAFT) throw new Error("Only draft documents can be signed.");

  const originalPdf = await readStoredFile(document.originalFilePath);
  const originalFileHash = cryptoProvider.hashSha256(originalPdf);
  const verificationToken = cryptoProvider.createVerificationToken();
  const verificationUrl = `${getAppUrl()}/verify/${verificationToken}`;
  const signedAt = new Date();

  const signedPdf = await stampSignedPdf({
    originalPdf,
    documentCode: document.documentCode,
    signerName: input.signerName,
    signerRole: input.signerRole,
    signedAt,
    verificationUrl
  });

  const signed = await saveSignedPdf(document.id, signedPdf);

  const result = await prisma.$transaction(async (tx) => {
    const updatedDocument = await tx.document.update({
      where: { id: document.id },
      data: {
        status: DocumentStatus.SIGNED,
        originalFileHash,
        signedFileHash: signed.hash,
        signedFilePath: signed.relativePath,
        verificationToken
      }
    });

    await tx.documentFile.create({
      data: {
        documentId: document.id,
        kind: "SIGNED",
        filePath: signed.relativePath,
        fileHash: signed.hash
      }
    });

    await tx.documentSignature.create({
      data: {
        documentId: document.id,
        signedById: input.userId,
        signedByName: input.signerName,
        signedByRole: input.signerRole,
        signedAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        originalFileHash,
        signedFileHash: signed.hash,
        verificationToken
      }
    });

    await tx.documentAssignment.updateMany({
      where: { documentId: document.id, userId: input.userId },
      data: { status: "SIGNED", signedAt }
    });

    return updatedDocument;
  });

  await writeAuditLog({
    userId: input.userId,
    action: "document.signed",
    entityType: "Document",
    entityId: document.id,
    metadata: { documentCode: document.documentCode, verificationToken },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return result;
}
