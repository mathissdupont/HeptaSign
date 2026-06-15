import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";
import { writeAuditLog } from "@/lib/audit/audit";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const form = await request.formData();
  const title = String(form.get("title") || "").trim() || null;

  const user = await prisma.user.update({
    where: { id },
    data: { title }
  });

  await writeAuditLog({
    userId: admin.id,
    action: "user.title_updated",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email, title },
    ...requestMeta(request)
  });

  return redirectTo("/admin/users");
}
