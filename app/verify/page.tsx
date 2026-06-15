import { Alert, Button, Card, CardHeader, Field, MetaItem, PageHeader, inputClass } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db/prisma";

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ documentCode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const document = params.documentCode
    ? await prisma.document.findFirst({
        where: { documentCode: params.documentCode, verificationToken: { not: null } },
        include: { signatures: { orderBy: { signedAt: "desc" }, take: 1 } }
      })
    : null;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader title="Verify Document" description="Check a Heptapus internal approval record by document code." />
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="Manual verification" description="Enter the document code printed on the document or in your internal records." />
        <form action="/api/verify" method="post" className="flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-72 flex-1">
            <Field label="Document code">
              <input name="documentCode" defaultValue={params.documentCode || ""} className={inputClass} />
            </Field>
          </div>
          <Button>Verify</Button>
        </form>
      </Card>
      {params.error ? <Alert>Document code is required.</Alert> : null}
      {params.documentCode && !document ? <Alert tone="warning">No matching document found.</Alert> : null}
      {document ? <VerificationResult document={document} /> : null}
    </main>
  );
}

function VerificationResult({ document }: { document: NonNullable<Awaited<ReturnType<typeof prisma.document.findUnique>>> & { signatures: { signedByName: string; signedByRole: string; signedAt: Date }[] } }) {
  const signature = document.signatures[0];
  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader title={document.title} description={document.documentCode} actions={<StatusBadge status={document.status} />} />
      <dl className="grid gap-5 p-5 sm:grid-cols-2">
        <MetaItem label="Document code" value={document.documentCode} />
        <MetaItem label="Status" value={<StatusBadge status={document.status} />} />
        <MetaItem label="Signer" value={signature?.signedByName || "-"} />
        <MetaItem label="Title / role" value={signature?.signedByRole || "-"} />
        <MetaItem label="Signed date" value={signature?.signedAt.toLocaleString() || "-"} />
        <MetaItem label="Document hash" value={document.signedFileHash || document.originalFileHash || "-"} wide />
      </dl>
      {document.signedFilePath ? (
        <div className="border-t border-line p-5">
          <a href={`/api/files/signed/${document.id}?token=${document.verificationToken}`} className="inline-flex min-h-10 items-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">View signed PDF</a>
        </div>
      ) : null}
    </Card>
  );
}
