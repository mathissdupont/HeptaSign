import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { readStoredFile } from "@/lib/files/storage";
import { canAccessDocument } from "@/lib/documents/access";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await context.params;
  if (!(await canAccessDocument(user, id))) return new NextResponse("Not found", { status: 404 });
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) return new NextResponse("Not found", { status: 404 });

  const file = await readStoredFile(document.originalFilePath);
  return new NextResponse(file, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${document.documentCode}-original.pdf"`
    }
  });
}
