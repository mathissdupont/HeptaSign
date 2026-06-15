import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type CurrentUser = {
  id: string;
  role: UserRole;
};

export function visibleDocumentWhere(user: CurrentUser): Prisma.DocumentWhereInput {
  if (user.role === UserRole.ADMIN) return {};

  return {
    OR: [
      { createdById: user.id },
      { assignments: { some: { userId: user.id } } }
    ]
  };
}

export async function canAccessDocument(user: CurrentUser, documentId: string) {
  if (user.role === UserRole.ADMIN) return true;

  const count = await prisma.document.count({
    where: {
      id: documentId,
      OR: [
        { createdById: user.id },
        { assignments: { some: { userId: user.id } } }
      ]
    }
  });

  return count > 0;
}

export async function canSignDocument(user: CurrentUser, documentId: string) {
  if (user.role === UserRole.ADMIN) return true;

  const count = await prisma.document.count({
    where: {
      id: documentId,
      OR: [
        { createdById: user.id },
        { assignments: { some: { userId: user.id, status: "PENDING" } } }
      ]
    }
  });

  return count > 0;
}
