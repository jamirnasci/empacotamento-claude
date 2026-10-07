import Link from "next/link";
import { Filter } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Stat, Table } from "@/components/ui";
import CaixasChips from "@/components/CaixasChips";
import { agrupar, buscarEmpacotamentos, resumir } from "@/lib/empacotamentos";
import { fmtDate, fmtNum, hojeISO, inicioMesISO } from "@/lib/utils";
import { query } from "@/lib/db";

type SP = { colaboradorId?: string; produtoCod?: string; dataIni?: string; dataFim?: string };
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function RelatorioPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser();
  const sp = await searchParams;

  // Sem nenhum parâmetro => período padrão = mês atual
  const semFiltros = Object.keys(sp).length === 0;
  const dataIni = semFiltros ? inicioMesISO() : sp.dataIni && DATE_RE.test(sp.dataIni) ? sp.dataIni : "";
  const dataFim = semFiltros ? hojeISO() : sp.dataFim && DATE_RE.test(sp.dataFim) ? sp.dataFim : "";
  const colaboradorId = sp.colaboradorId ? Number(sp.colaboradorId) : null;
  const produtoCod = sp.produtoCod || "";

  // Para o filtro, lista TODOS (ativos e inativos), pois dados históricos podem ser deles
  const [prods, colabs, rows] = await Promise.all([
    query<{ codigo: string; descricao: string }>("SELECT codigo, descricao FROM produtos ORDER BY codigo"),
    query<{ colaboradorId: number; nome: string }>("SELECT colaboradorId, nome FROM colaboradores ORDER BY nome"),
    buscarEmpacotamentos({
      colaboradorId: colaboradorId && Number.isInteger(colaboradorId) ? colaboradorId : null,
      produtoCod,
      dataIni,
      dataFim,
    }, 5000),
  ]);

  const s = resumir(rows);
  const porColab = agrupar(rows, (r) => r.colaboradorNome);
  const porProd = agrupar(rows, (r) => `${r.produtoCod} — ${r.produtoDescricao}`);

  return (
    <>
      <PageHeader title="Relatório de empacotamento" subtitle="Filtre por colaborador, produto e período" />

      <Card className="mb-6 p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div>
            <label htmlFor="colaboradorId" className="label">Colaborador</label>
            <select id="colaboradorId" name="colaboradorId" defaultValue={colaboradorId ?? ""} className="input">
              <option value="">Todos</option>
              {colabs.map((c) => (
                <option key={c.colaboradorId} value={c.colaboradorId}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="produtoCod" className="label">Produto</label>
            <select id="produtoCod" name="produtoCod" defaultValue={produtoCod} className="input">
              <option value="">Todos</option>
              {prods.map((p) => (
                <option key={p.codigo} value={p.codigo}>{p.codigo} — {p.descricao}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="dataIni" className="label">Data inicial</label>
            <input id="dataIni" name="dataIni" type="date" defaultValue={dataIni} className="input" />
          </div>
          <div>
            <label htmlFor="dataFim" className="label">Data final</label>
            <input id="dataFim" name="dataFim" type="date" defaultValue={dataFim} className="input" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary"><Filter size={16} /> Filtrar</button>
            <Link href="/relatorio?colaboradorId=&produtoCod=&dataIni=&dataFim=" className="btn-secondary">Limpar</Link>
          </div>
        </form>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Registros" value={fmtNum(s.registros)} />
        <Stat label="Caixas" value={fmtNum(s.caixas)} />
        <Stat label="Unidades avulsas" value={fmtNum(s.uni)} />
        <Stat label="Total (kg)" value={fmtNum(s.kg, 2)} />
        <Stat
          label="Atingimento da meta"
          value={s.atingimento == null ? "—" : `${fmtNum(s.atingimento, 1)}%`}
          hint={s.meta > 0 ? `Meta: ${fmtNum(s.meta, 2)} kg` : "Sem meta informada"}
        />
      </div>

      {rows.length >= 5000 && (
        <p className="mb-4 text-sm text-amber-700">Exibindo os 5.000 registros mais recentes. Refine os filtros para ver o restante.</p>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold text-slate-900">Por colaborador</h2>
          <Table
            empty={porColab.length === 0}
            head={<><th className="th">Colaborador</th><th className="th text-right">Caixas</th><th className="th text-right">Unid.</th><th className="th text-right">Total kg</th></>}
          >
            {porColab.map((g) => (
              <tr key={g.nome}>
                <td className="td">{g.nome}</td>
                <td className="td text-right">{fmtNum(g.caixas)}</td>
                <td className="td text-right">{fmtNum(g.uni)}</td>
                <td className="td text-right">{fmtNum(g.kg, 2)}</td>
              </tr>
            ))}
          </Table>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-slate-900">Por produto</h2>
          <Table
            empty={porProd.length === 0}
            head={<><th className="th">Produto</th><th className="th text-right">Caixas</th><th className="th text-right">Unid.</th><th className="th text-right">Total kg</th></>}
          >
            {porProd.map((g) => (
              <tr key={g.nome}>
                <td className="td">{g.nome}</td>
                <td className="td text-right">{fmtNum(g.caixas)}</td>
                <td className="td text-right">{fmtNum(g.uni)}</td>
                <td className="td text-right">{fmtNum(g.kg, 2)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      <h2 className="mb-2 font-semibold text-slate-900">Detalhamento</h2>
      <Table
        empty={rows.length === 0}
        head={
          <>
            <th className="th">Data</th>
            <th className="th">Produto</th>
            <th className="th">Colaborador</th>
            <th className="th">Caixas</th>
            <th className="th text-right">Unid.</th>
            <th className="th text-right">Total kg</th>
            <th className="th text-right">Meta</th>
            <th className="th text-right">% Meta</th>
            <th className="th">Horário</th>
            <th className="th">Observação</th>
          </>
        }
      >
        {rows.map((r) => {
          const pct = r.meta && r.meta > 0 ? ((r.totalKg ?? 0) / r.meta) * 100 : null;
          return (
            <tr key={r.empacotamentoId} className="hover:bg-slate-50">
              <td className="td whitespace-nowrap">{fmtDate(r.data)}</td>
              <td className="td">
                <span className="font-mono text-xs text-slate-500">{r.produtoCod}</span>
                <div>{r.produtoDescricao}</div>
              </td>
              <td className="td">{r.colaboradorNome}</td>
              <td className="td"><CaixasChips e={r} /></td>
              <td className="td text-right">{fmtNum(r.uni)}</td>
              <td className="td text-right">{fmtNum(r.totalKg, 2)}</td>
              <td className="td text-right">{fmtNum(r.meta, 2)}</td>
              <td className={`td text-right ${pct == null ? "" : pct >= 100 ? "text-emerald-600" : "text-amber-600"}`}>
                {pct == null ? "—" : `${fmtNum(pct, 1)}%`}
              </td>
              <td className="td whitespace-nowrap">
                {r.horaInicio || r.horaFim ? `${r.horaInicio ?? "—"} – ${r.horaFim ?? "—"}` : "—"}
              </td>
              <td className="td max-w-xs truncate" title={r.observacao ?? ""}>{r.observacao ?? "—"}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
