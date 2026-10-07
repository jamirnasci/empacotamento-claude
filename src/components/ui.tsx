import Link from "next/link";
import { Plus } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  newHref,
  newLabel = "Novo",
}: {
  title: string;
  subtitle?: string;
  newHref?: string;
  newLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {newHref && (
        <Link href={newHref} className="btn-primary">
          <Plus size={16} /> {newLabel}
        </Link>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "info" }) {
  const cls =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function Badge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
      }`}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

export function Table({ head, children, empty }: { head: React.ReactNode; children: React.ReactNode; empty?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>{head}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
        {empty && <p className="px-4 py-10 text-center text-sm text-slate-500">Nenhum registro encontrado.</p>}
      </div>
    </Card>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
