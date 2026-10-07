import { caixas, type Empacotamento } from "@/lib/empacotamentos";

export default function CaixasChips({ e }: { e: Empacotamento }) {
  const lista = caixas(e);
  if (!lista.length) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {lista.map((c) => (
        <span key={c.n} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
          <strong>{c.qtd}</strong> × {c.tipo}
        </span>
      ))}
    </div>
  );
}
