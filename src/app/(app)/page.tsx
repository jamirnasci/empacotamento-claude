import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Alert, PageHeader, Stat, Card } from "@/components/ui";
import { buscarEmpacotamentos, resumir } from "@/lib/empacotamentos";
import { fmtDate, fmtNum, hojeISO, inicioMesISO } from "@/lib/utils";

export default async function PainelPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const user = await requireUser();
  const { erro } = await searchParams;
  const mes = await buscarEmpacotamentos({ dataIni: inicioMesISO() }, 5000);
  const hoje = mes.filter((r) => r.data === hojeISO());
  const sHoje = resumir(hoje);
  const sMes = resumir(mes);

  return (
    <>
      <PageHeader title={`Olá, ${user.nome.split(" ")[0]}`} subtitle="Resumo do empacotamento" newHref="/empacotamentos/novo" newLabel="Novo empacotamento" />
      {erro === "acesso" && <Alert>Você não tem permissão para acessar essa área.</Alert>}

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Hoje</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registros" value={fmtNum(sHoje.registros)} />
        <Stat label="Caixas" value={fmtNum(sHoje.caixas)} />
        <Stat label="Unidades avulsas" value={fmtNum(sHoje.uni)} />
        <Stat label="Total (kg)" value={fmtNum(sHoje.kg, 2)} />
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Mês atual</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registros" value={fmtNum(sMes.registros)} />
        <Stat label="Caixas" value={fmtNum(sMes.caixas)} />
        <Stat label="Total (kg)" value={fmtNum(sMes.kg, 2)} />
        <Stat
          label="Atingimento da meta"
          value={sMes.atingimento == null ? "—" : `${fmtNum(sMes.atingimento, 1)}%`}
          hint={sMes.meta > 0 ? `Meta: ${fmtNum(sMes.meta, 2)} kg` : "Sem meta informada"}
        />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Últimos registros</h2>
          <Link href="/relatorio" className="text-sm text-indigo-600 hover:underline">Ver relatório →</Link>
        </div>
        {mes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Nenhum registro neste mês.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {mes.slice(0, 6).map((r) => (
              <li key={r.empacotamentoId} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <span className="text-slate-500">{fmtDate(r.data)}</span> · {r.produtoDescricao}
                </span>
                <span className="shrink-0 text-slate-500">{r.colaboradorNome}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
