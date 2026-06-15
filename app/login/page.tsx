import Image from "next/image";
import { Alert, Button, Card, Field, inputClass } from "@/components/ui";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="border-b border-line p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-line bg-white">
            <Image src="/logo.png" alt="Heptapus" width={44} height={44} className="h-11 w-11 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-ink">HeptaSign</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Internal document approval and verification for Heptapus Group.</p>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-4 p-8">
          <input type="hidden" name="next" value={params.next || "/dashboard"} />
          {params.error ? <Alert>Invalid email or password.</Alert> : null}
          <Field label="Email">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required className={inputClass} />
          </Field>
          <Button>Login</Button>
        </form>
      </Card>
    </main>
  );
}
