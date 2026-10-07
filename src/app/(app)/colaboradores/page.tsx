import Link from "next/link";
import { Pencil } from "lucide-react";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Alert, Badge, PageHeader, Table } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { excluirColaborador } from "./actions";

type Row = { colaboradorId: number; nome: string; ativo: boolean };

export default async function ColaboradoresPage({ searchParams }: { searchParams: Promise<{ q?: string; erro?: string }> }) {
  await requireUser();
  const { q = "", erro } = await searchParams;
  const rows = await query<Row>(
    `SELECT colaboradorId, nome, ativo FROM colaboradores
     WHERE (@q = '' OR nome LIKE '%' + @q + '%') ORDER BY nome`,
    { q },
  );

  return (
    <>
      <PageHeader title="Colaboradores" subtitle="Cadastro de colaboradores" newHref="/colaboradores/novo" newLabel="Novo colaborador" />
      {erro && <Alert>{erro}</Alert>}
      <form className="mb-4 flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nome..." className="input" />
        <button className="btn-secondary">Buscar</button>
      </form>
      <Table
        empty={rows.length === 0}
        head={
          <>
            <th className="th w-20">ID</th>
            <th className="th">Nome</th>
            <th className="th">Status</th>
            <th className="th w-24"></th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.colaboradorId} className="hover:bg-slate-50">
            <td className="td text-slate-500">{r.colaboradorId}</td>
            <td className="td">{r.nome}</td>
            <td className="td"><Badge ativo={r.ativo} /></td>
            <td className="td">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/colaboradores/${r.colaboradorId}`} title="Editar" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                  <Pencil size={16} />
                </Link>
                <DeleteButton action={excluirColaborador.bind(null, r.colaboradorId)} message={`Excluir ${r.nome}?`} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
