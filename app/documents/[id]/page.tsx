import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AppShell } from "@/components/shell";
import { Button, ButtonLink, Card, CardHeader, EmptyState, Field, MetaItem, PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canAccessDocument } from "@/lib/documents/access";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!(await canAccessDocument(user, id))) notFound();
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      signatures: { orderBy: { signedAt: "desc" } },
      assignments: { include: { user: { select: { name: true, email: true, title: true } } }, orderBy: { createdAt: "asc" } }
    }
  });
  if (!document) notFound();
  const canManageAssignments = user.role === UserRole.ADMIN || document.createdById === user.id;
  const assignedIds = new Set(document.assignments.map((assignment) => assignment.userId));
  const assignableUsers = canManageAssignments
    ? await prisma.user.findMany({
        where: { id: { notIn: [user.id, ...assignedIds] } },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, title: true }
      })
    : [];

  return (
    <AppShell>
      <PageHeader
        title={document.title}
        description={document.documentCode}
        actions={
          <>
            <StatusBadge status={document.status} />
            {document.status === "DRAFT" ? <ButtonLink href={`/documents/${document.id}/sign`}>Sign</ButtonLink> : null}
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader title="Document details" description="Internal approval status, hashes, and file access." />
          <dl className="grid gap-5 p-5 sm:grid-cols-2">
            <MetaItem label="Document code" value={document.documentCode} />
            <MetaItem label="Status" value={<StatusBadge status={document.status} />} />
            <MetaItem label="Original hash" value={document.originalFileHash || "-"} wide />
            <MetaItem label="Signed hash" value={document.signedFileHash || "-"} wide />
            <MetaItem label="Verification token" value={document.verificationToken || "-"} wide />
            <MetaItem label="Description" value={document.description || "-"} wide />
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-line p-5">
            <a href={`/api/files/original/${document.id}`} className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">View original PDF</a>
            {document.signedFilePath ? <a href={`/api/files/signed/${document.id}`} className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">View signed PDF</a> : null}
            {document.status === "SIGNED" ? (
              <form action={`/api/documents/${document.id}/revoke`} method="post">
                <Button variant="danger">Revoke</Button>
              </form>
            ) : null}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader title="Signature history" description="Recorded signers and verification tokens." />
          {document.signatures.length === 0 ? (
            <EmptyState title="No signatures yet" description="This draft has not been approved. Sign it to create a verification record." />
          ) : (
            <div className="divide-y divide-line">
              {document.signatures.map((signature) => (
                <div key={signature.id} className="p-5">
                  <div className="font-medium">{signature.signedByName}</div>
                  <div className="text-sm text-muted">{signature.signedByRole}</div>
                  <div className="mt-1 text-sm">{signature.signedAt.toLocaleString()}</div>
                  <div className="mt-2 break-all text-xs text-muted">{signature.verificationToken}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="overflow-hidden lg:col-start-2">
          <CardHeader title="Assigned signers" description="People who can access this document for approval." />
          {document.assignments.length === 0 ? (
            <EmptyState title="No assigned signers" description="Only the creator and admins can access this draft." />
          ) : (
            <div className="divide-y divide-line">
              {document.assignments.map((assignment) => (
                <div key={assignment.id} className="p-5">
                  <div className="font-medium text-ink">{assignment.user.name}</div>
                  <div className="text-sm text-muted">{assignment.user.title || "No title"} · {assignment.user.email}</div>
                  <div className="mt-2 text-xs font-semibold text-muted">{assignment.status}</div>
                </div>
              ))}
            </div>
          )}
          {canManageAssignments ? (
            <form action={`/api/documents/${document.id}/assign`} method="post" className="border-t border-line p-5">
              <Field label="Add signers">
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border border-line bg-slate-50 p-3">
                  {assignableUsers.length === 0 ? <p className="text-sm text-muted">No available users to assign.</p> : null}
                  {assignableUsers.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 rounded-md bg-white p-3 text-sm shadow-sm">
                      <input name="assignedUserIds" value={item.id} type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
                      <span>
                        <span className="block font-medium text-ink">{item.name}</span>
                        <span className="block text-muted">{item.title || "No title"} · {item.email}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
              <div className="mt-3">
                <Button variant="secondary">Assign selected</Button>
              </div>
            </form>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
