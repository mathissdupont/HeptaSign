import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Alert, Button, ButtonLink, Card, CardHeader, MetaItem, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canSignDocument } from "@/lib/documents/access";

export default async function SignDocumentPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) notFound();
  if (!(await canSignDocument(user, id))) notFound();

  return (
    <AppShell>
      <PageHeader
        title="Sign / Approve Document"
        description={`${document.documentCode} - ${document.title}`}
        actions={<StatusBadge status={document.status} />}
      />
      <Card className="max-w-3xl overflow-hidden">
        <CardHeader title="Approval confirmation" description="Signing creates a separate stamped PDF and public verification record. The original upload remains unchanged." />
        <div className="space-y-5 p-5">
          {query.error ? <Alert>{decodeURIComponent(query.error)}</Alert> : null}
          <dl className="grid gap-5 sm:grid-cols-2">
            <MetaItem label="Document code" value={document.documentCode} />
            <MetaItem label="Title" value={document.title} />
            <MetaItem label="Current status" value={<StatusBadge status={document.status} />} />
            <MetaItem label="Original hash" value={document.originalFileHash || "Will be recalculated during signing"} wide />
          </dl>
        </div>
        <form action={`/api/documents/${document.id}/sign`} method="post" className="flex flex-wrap gap-3 border-t border-line p-5">
          <Button>Sign / Approve Document</Button>
          <ButtonLink href={`/documents/${document.id}`} variant="secondary">Cancel</ButtonLink>
        </form>
      </Card>
    </AppShell>
  );
}
