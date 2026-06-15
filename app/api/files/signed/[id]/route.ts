import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readStoredFile } from "@/lib/files/storage";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessDocument } from "@/lib/documents/access";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || !document.signedFilePath) return new NextResponse("Not found", { status: 404 });
  const user = await getCurrentUser();
  const url = new URL(request.url);
  const publicVerifyDownload =
    document.verificationToken &&
    document.status === "SIGNED" &&
    url.searchParams.get("token") === document.verificationToken;
  if (!publicVerifyDownload && (!user || !(await canAccessDocument(user, id)))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readStoredFile(document.signedFilePath);
  return new NextResponse(file, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${document.documentCode}-signed.pdf"`
    }
  });
}
