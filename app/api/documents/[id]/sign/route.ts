import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { signDocument } from "@/lib/documents/signing";
import { requestMeta } from "@/lib/request";
import { redirectTo } from "@/lib/redirect";
import { canSignDocument } from "@/lib/documents/access";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await context.params;

  try {
    if (!(await canSignDocument(user, id))) {
      return redirectTo("/documents?error=forbidden");
    }
    await signDocument({
      documentId: id,
      userId: user.id,
      signerName: user.name,
      signerRole: user.title || user.role,
      ...requestMeta(request)
    });
    return redirectTo(`/documents/${id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signing failed.";
    return redirectTo(`/documents/${id}/sign?error=${encodeURIComponent(message)}`);
  }
}
