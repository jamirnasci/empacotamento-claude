import Link from "next/link";
import { Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Alert, PageHeader, Table } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import CaixasChips from "@/components/CaixasChips";
import { buscarEmpacotamentos, totalCaixas } from "@/lib/empacotamentos";
import { fmtDate, fmtNum } from "@/lib/utils";
import { excluirEmpacotamento } from "./actions";

export default async function EmpacotamentosPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireUser();
  const { erro } = await searchParams;
  const rows = await buscarEmpacotamentos({}, 100);

  return (
    <>
      <PageHeader
        title="Empacotamentos"
        subtitle="Últimos 100 registros. Para filtrar e analisar, use o Relatório."
        newHref="/empacotamentos/novo"
        newLabel="Novo empacotamento"
      />
      {erro && <Alert>{erro}</Alert>}
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
            <th className="th w-24"></th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.empacotamentoId} className="hover:bg-slate-50">
            <td className="td whitespace-nowrap">{fmtDate(r.data)}</td>
            <td className="td">
              <span className="font-mono text-xs text-slate-500">{r.produtoCod}</span>
              <div>{r.produtoDescricao}</div>
            </td>
            <td className="td">{r.colaboradorNome}</td>
            <td className="td">
              <CaixasChips e={r} />
              <span className="text-xs text-slate-400">{totalCaixas(r)} no total</span>
            </td>
            <td className="td text-right">{fmtNum(r.uni)}</td>
            <td className="td text-right">{fmtNum(r.totalKg, 2)}</td>
            <td className="td">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/empacotamentos/${r.empacotamentoId}`} title="Editar" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                  <Pencil size={16} />
                </Link>
                <DeleteButton
                  action={excluirEmpacotamento.bind(null, r.empacotamentoId)}
                  message={`Excluir o empacotamento #${r.empacotamentoId}?`}
                />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
