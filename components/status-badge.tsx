const colors: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-800 border-amber-200",
  SIGNED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REVOKED: "bg-rose-50 text-rose-800 border-rose-200",
  SUPERSEDED: "bg-slate-100 text-slate-700 border-slate-200"
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[status] || colors.DRAFT}`}>
      {status}
    </span>
  );
}
