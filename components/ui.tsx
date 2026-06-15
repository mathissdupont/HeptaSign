import Link from "next/link";

export function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageTitle(props: { title: string; description?: string }) {
  return <PageHeader {...props} />;
}

const buttonBase =
  "inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:pointer-events-none disabled:opacity-60";

const buttonVariants = {
  primary: "bg-brand text-white hover:bg-brandDark",
  secondary: "border border-line bg-white text-ink hover:bg-slate-50",
  danger: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
  dark: "bg-ink text-white hover:bg-slate-800"
};

export function Button({
  children,
  variant = "primary",
  type = "submit"
}: {
  children: React.ReactNode;
  variant?: keyof typeof buttonVariants;
  type?: "button" | "submit" | "reset";
}) {
  return <button type={type} className={`${buttonBase} ${buttonVariants[variant]}`}>{children}</button>;
}

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <Link href={href} className={`${buttonBase} ${buttonVariants[variant]}`}>
      {children}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export function Card({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-lg border border-line bg-panel shadow-sm ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function Alert({
  children,
  tone = "error"
}: {
  children: React.ReactNode;
  tone?: "error" | "warning" | "info" | "success";
}) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800"
  };

  return <div className={`rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-muted">
        HS
      </div>
      <h3 className="font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function MetaItem({
  label,
  value,
  wide
}: {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-all text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
