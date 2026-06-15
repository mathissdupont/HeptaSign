import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setSessionCookie, signSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit/audit";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/dashboard");
  const meta = requestMeta(request);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return redirectTo("/login?error=invalid");
  }

  const token = signSession({ userId: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  await writeAuditLog({
    userId: user.id,
    action: "user.login",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
    ...meta
  });

  return redirectTo(next.startsWith("/") ? next : "/dashboard");
}
