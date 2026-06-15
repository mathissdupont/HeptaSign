import Link from "next/link";
import { DocumentStatus, Prisma } from "@prisma/client";
import { AppShell } from "@/components/shell";
import { Button, ButtonLink, Card, EmptyState, PageHeader, inputClass } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { visibleDocumentWhere } from "@/lib/documents/access";

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const q = params.q?.trim();
  const status = Object.values(DocumentStatus).includes(params.status as DocumentStatus) ? (params.status as DocumentStatus) : undefined;
  const where: Prisma.DocumentWhereInput = {
    AND: [visibleDocumentWhere(user)],
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { documentCode: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const documents = await prisma.document.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <AppShell>
      <PageHeader
        title="Documents"
        description="Find drafts, signed approvals, revoked records, and their verification metadata."
        actions={<ButtonLink href="/documents/new">New Document</ButtonLink>}
      />
      <form className="mb-5 flex flex-wrap gap-3 rounded-lg border border-line bg-white p-4 shadow-sm">
        <input name="q" defaultValue={q} placeholder="Search by document code or title" className={`${inputClass} min-w-64 flex-1`} />
        <select name="status" defaultValue={status || ""} className={`${inputClass} w-auto min-w-44`}>
          <option value="">All statuses</option>
          {Object.values(DocumentStatus).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <Button variant="dark">Search</Button>
      </form>
      <Card className="overflow-hidden">
        {documents.length === 0 ? (
          <EmptyState title="No documents found" description="Try a different search, clear the status filter, or create a new document draft." action={<ButtonLink href="/documents/new">New Document</ButtonLink>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Signed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-brand"><Link href={`/documents/${doc.id}`}>{doc.documentCode}</Link></td>
                    <td className="px-4 py-3 font-medium text-ink">{doc.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
                    <td className="px-4 py-3 text-muted">{doc.createdAt.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted">{doc.status === "SIGNED" ? doc.updatedAt.toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
