import { DocumentStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/audit";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await context.params;
  const document = await prisma.document.update({
    where: { id },
    data: { status: DocumentStatus.REVOKED }
  });

  await writeAuditLog({
    userId: user.id,
    action: "document.revoked",
    entityType: "Document",
    entityId: id,
    metadata: { documentCode: document.documentCode },
    ...requestMeta(request)
  });

  return redirectTo(`/documents/${id}`);
}
