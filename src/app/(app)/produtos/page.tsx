import Link from "next/link";
import { Pencil } from "lucide-react";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Alert, Badge, PageHeader, Table } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { excluirProduto } from "./actions";

type Row = { codigo: string; descricao: string; ativo: boolean };

export default async function ProdutosPage({ searchParams }: { searchParams: Promise<{ q?: string; erro?: string }> }) {
  await requireAdmin();
  const { q = "", erro } = await searchParams;
  const rows = await query<Row>(
    `SELECT codigo, descricao, ativo FROM produtos
     WHERE (@q = '' OR codigo LIKE '%' + @q + '%' OR descricao LIKE '%' + @q + '%')
     ORDER BY codigo`,
    { q },
  );

  return (
    <>
      <PageHeader title="Produtos" subtitle="Cadastro de produtos" newHref="/produtos/novo" newLabel="Novo produto" />
      {erro && <Alert>{erro}</Alert>}
      <form className="mb-4 flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por código ou descrição..." className="input" />
        <button className="btn-secondary">Buscar</button>
      </form>
      <Table
        empty={rows.length === 0}
        head={
          <>
            <th className="th">Código</th>
            <th className="th">Descrição</th>
            <th className="th">Status</th>
            <th className="th w-24"></th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.codigo} className="hover:bg-slate-50">
            <td className="td font-mono">{r.codigo}</td>
            <td className="td">{r.descricao}</td>
            <td className="td"><Badge ativo={r.ativo} /></td>
            <td className="td">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/produtos/${encodeURIComponent(r.codigo)}`} title="Editar" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                  <Pencil size={16} />
                </Link>
                <DeleteButton action={excluirProduto.bind(null, r.codigo)} message={`Excluir o produto ${r.codigo}?`} />
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
