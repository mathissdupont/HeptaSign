import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { writeAuditLog } from "@/lib/audit/audit";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const role = String(form.get("role") || "USER") === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
  const title = String(form.get("title") || "").trim() || null;

  if (!name || !email || password.length < 8) {
    return redirectTo("/admin/users?error=missing");
  }

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role, title }
    });

    await writeAuditLog({
      userId: admin.id,
      action: "user.created",
      entityType: "User",
      entityId: user.id,
      metadata: { email, role, title },
      ...requestMeta(request)
    });

    return redirectTo("/admin/users");
  } catch {
    return redirectTo("/admin/users?error=duplicate");
  }
}
