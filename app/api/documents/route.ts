import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { saveOriginalPdf, validatePdfUpload } from "@/lib/files/storage";
import { writeAuditLog } from "@/lib/audit/audit";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const form = await request.formData();
  const documentCode = String(form.get("documentCode") || "").trim();
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim() || null;
  const assignedUserIds = form.getAll("assignedUserIds").map((value) => String(value)).filter(Boolean);
  const file = form.get("file");

  if (!documentCode || !title || !(file instanceof File)) {
    return redirectTo("/documents/new?error=missing");
  }

  try {
    const buffer = await validatePdfUpload(file);
    const document = await prisma.document.create({
      data: {
        documentCode,
        title,
        description,
        originalFilePath: "pending",
        createdById: user.id,
        assignments: {
          create: assignedUserIds.map((assignedUserId) => ({
            userId: assignedUserId,
            assignedById: user.id
          }))
        }
      }
    });

    const saved = await saveOriginalPdf(document.id, buffer);
    await prisma.document.update({
      where: { id: document.id },
      data: {
        originalFilePath: saved.relativePath,
        originalFileHash: saved.hash,
        files: {
          create: {
            kind: "ORIGINAL",
            filePath: saved.relativePath,
            fileHash: saved.hash
          }
        }
      }
    });

    await writeAuditLog({
      userId: user.id,
      action: "document.created",
      entityType: "Document",
      entityId: document.id,
      metadata: { documentCode, title, assignedUserIds },
      ...requestMeta(request)
    });

    return redirectTo(`/documents/${document.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    if (message.includes("Unique constraint")) {
      return redirectTo("/documents/new?error=duplicate");
    }
    return redirectTo(`/documents/new?error=${encodeURIComponent(message)}`);
  }
}
