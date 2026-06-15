import { AppShell } from "@/components/shell";
import { Alert, Button, ButtonLink, Card, CardHeader, Field, PageHeader, inputClass } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function NewDocumentPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const users = await prisma.user.findMany({
    where: { id: { not: user.id } },
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, email: true, title: true }
  });

  return (
    <AppShell>
      <PageHeader
        title="New Document"
        description="Upload the original PDF and enter the existing unique document code. HeptaSign validates uniqueness but does not generate document codes."
      />
      <Card className="max-w-3xl overflow-hidden">
        <CardHeader title="Draft metadata" description="The uploaded PDF is stored unchanged. Signing creates a separate stamped copy." />
        <form action="/api/documents" method="post" encType="multipart/form-data" className="space-y-5 p-5">
          {params.error ? <Alert>{decodeURIComponent(params.error)}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document code">
              <input name="documentCode" required className={inputClass} />
            </Field>
            <Field label="Title">
              <input name="title" required className={inputClass} />
            </Field>
          </div>
          <Field label="Description">
            <textarea name="description" rows={4} className={inputClass} />
          </Field>
          <Field label="PDF file">
            <input name="file" type="file" accept="application/pdf" required className={inputClass} />
          </Field>
          <div>
            <div className="mb-2 text-sm font-medium text-ink">Send for signature</div>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-line bg-slate-50 p-3">
              {users.length === 0 ? <p className="text-sm text-muted">No other users yet. Add users from Admin / Users.</p> : null}
              {users.map((item) => (
                <label key={item.id} className="flex items-start gap-3 rounded-md bg-white p-3 text-sm shadow-sm">
                  <input name="assignedUserIds" value={item.id} type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
                  <span>
                    <span className="block font-medium text-ink">{item.name}</span>
                    <span className="block text-muted">{item.title || "No title"} · {item.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>Create draft</Button>
            <ButtonLink href="/documents" variant="secondary">Cancel</ButtonLink>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
