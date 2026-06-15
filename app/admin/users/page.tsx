import { AppShell } from "@/components/shell";
import { Alert, Button, Card, CardHeader, Field, PageHeader, inputClass } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AppShell>
      <PageHeader title="Users" description="Create internal accounts and assign business titles used on signature records." />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Create user" description="System role controls access; title appears on signed documents." />
          <form action="/api/admin/users" method="post" className="space-y-4 p-5">
            {params.error ? <Alert>Could not create user. Check required fields and duplicate email.</Alert> : null}
            <Field label="Name">
              <input name="name" required className={inputClass} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" required className={inputClass} />
            </Field>
            <Field label="Title">
              <input name="title" placeholder="CEO, CFO, COO" className={inputClass} />
            </Field>
            <Field label="Password">
              <input name="password" type="password" minLength={8} required className={inputClass} />
            </Field>
            <Field label="System role">
              <select name="role" className={inputClass}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </Field>
            <Button>Create user</Button>
          </form>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader title="Current users" description={`${users.length} internal account${users.length === 1 ? "" : "s"}`} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <form action={`/api/admin/users/${user.id}/title`} method="post" className="flex gap-2">
                        <input name="title" defaultValue={user.title || ""} placeholder="CEO, CFO" className={`${inputClass} min-w-36`} />
                        <button className="rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50">Save</button>
                      </form>
                    </td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3 text-muted">{user.createdAt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
