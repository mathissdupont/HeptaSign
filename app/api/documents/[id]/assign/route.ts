import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canAccessDocument } from "@/lib/documents/access";
import { redirectTo } from "@/lib/redirect";
import { requestMeta } from "@/lib/request";
import { writeAuditLog } from "@/lib/audit/audit";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await context.params;
  const document = await prisma.document.findUnique({ where: { id }, select: { id: true, createdById: true, documentCode: true } });

  if (!document || !(await canAccessDocument(user, id))) {
    return redirectTo("/documents");
  }

  if (user.role !== UserRole.ADMIN && document.createdById !== user.id) {
    return redirectTo(`/documents/${id}`);
  }

  const form = await request.formData();
  const assignedUserIds = form.getAll("assignedUserIds").map((value) => String(value)).filter(Boolean);

  if (assignedUserIds.length > 0) {
    await prisma.documentAssignment.createMany({
      data: assignedUserIds.map((assignedUserId) => ({
        documentId: id,
        userId: assignedUserId,
        assignedById: user.id
      })),
      skipDuplicates: true
    });

    await writeAuditLog({
      userId: user.id,
      action: "document.assigned",
      entityType: "Document",
      entityId: id,
      metadata: { documentCode: document.documentCode, assignedUserIds },
      ...requestMeta(request)
    });
  }

  return redirectTo(`/documents/${id}`);
}
