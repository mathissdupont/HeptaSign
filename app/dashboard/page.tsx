import Link from "next/link";
import { DocumentStatus } from "@prisma/client";
import { AppShell } from "@/components/shell";
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { visibleDocumentWhere } from "@/lib/documents/access";

export default async function DashboardPage() {
  const user = await requireUser();
  const scope = visibleDocumentWhere(user);
  const [total, signed, draft, revoked, recent] = await Promise.all([
    prisma.document.count({ where: scope }),
    prisma.document.count({ where: { AND: [scope, { status: DocumentStatus.SIGNED }] } }),
    prisma.document.count({ where: { AND: [scope, { status: DocumentStatus.DRAFT }] } }),
    prisma.document.count({ where: { AND: [scope, { status: DocumentStatus.REVOKED }] } }),
    prisma.document.findMany({
      where: { AND: [scope, { status: DocumentStatus.SIGNED }] },
      orderBy: { updatedAt: "desc" },
      take: 6
    })
  ]);

  const stats = [
    ["Total documents", total],
    ["Signed", signed],
    ["Draft", draft],
    ["Revoked", revoked]
  ];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="A quick operational view of internal approval activity, open drafts, and recent signed records."
        actions={<ButtonLink href="/documents/new">New Document</ButtonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value], index) => (
          <Card key={label} className="p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div className="text-3xl font-semibold text-ink">{value}</div>
              <div className={`h-2 w-14 rounded-full ${index === 1 ? "bg-emerald-500" : index === 2 ? "bg-amber-500" : index === 3 ? "bg-rose-500" : "bg-brand"}`} />
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-8 overflow-hidden">
        <CardHeader title="Recent signed documents" description="Latest completed approvals with verification records." />
        <div className="divide-y divide-line">
          {recent.length === 0 ? (
            <EmptyState
              title="No signed documents yet"
              description="Create a draft document and approve it to see recent signatures here."
              action={<ButtonLink href="/documents/new">Create first document</ButtonLink>}
            />
          ) : null}
          {recent.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
              <div>
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-muted">{doc.documentCode}</div>
              </div>
              <StatusBadge status={doc.status} />
            </Link>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
