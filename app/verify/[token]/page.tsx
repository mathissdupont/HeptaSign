import { notFound } from "next/navigation";
import { Card, CardHeader, MetaItem, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db/prisma";

export default async function VerifyTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const document = await prisma.document.findUnique({
    where: { verificationToken: token },
    include: { signatures: { orderBy: { signedAt: "desc" }, take: 1 } }
  });
  if (!document) notFound();

  const signature = document.signatures[0];

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader title="Verification Result" description="Heptapus internal document approval record." />
      <Card className="overflow-hidden">
        <CardHeader title={document.title} description={document.documentCode} actions={<StatusBadge status={document.status} />} />
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          <MetaItem label="Document code" value={document.documentCode} />
          <MetaItem label="Status" value={<StatusBadge status={document.status} />} />
          <MetaItem label="Signer" value={signature?.signedByName || "-"} />
          <MetaItem label="Title / role" value={signature?.signedByRole || "-"} />
          <MetaItem label="Signed date" value={signature?.signedAt.toLocaleString() || "-"} />
          <MetaItem label="Document hash" value={document.signedFileHash || "-"} wide />
        </dl>
        {document.signedFilePath ? (
          <div className="border-t border-line p-5">
            <a href={`/api/files/signed/${document.id}?token=${document.verificationToken}`} className="inline-flex min-h-10 items-center rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">View signed PDF</a>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
