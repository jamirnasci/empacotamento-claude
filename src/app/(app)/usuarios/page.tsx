import Link from "next/link";
import { Pencil } from "lucide-react";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Alert, Badge, PageHeader, Table } from "@/components/ui";
import DeleteButton from "@/components/DeleteButton";
import { fmtDate } from "@/lib/utils";
import { excluirUsuario } from "./actions";

type Row = { usuarioId: number; nome: string; email: string; role: string; ativo: boolean; createdAt: string };

export default async function UsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string; erro?: string }> }) {
  const me = await requireAdmin();
  const { q = "", erro } = await searchParams;
  const rows = await query<Row>(
    `SELECT usuarioId, nome, email, role, ativo, CONVERT(varchar(10), createdAt, 23) AS createdAt
     FROM usuarios
     WHERE (@q = '' OR nome LIKE '%' + @q + '%' OR email LIKE '%' + @q + '%')
     ORDER BY nome`,
    { q },
  );

  return (
    <>
      <PageHeader title="Usuários" subtitle="Acesso restrito a administradores" newHref="/usuarios/novo" newLabel="Novo usuário" />
      {erro && <Alert>{erro}</Alert>}
      <form className="mb-4 flex max-w-md gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail..." className="input" />
        <button className="btn-secondary">Buscar</button>
      </form>
      <Table
        empty={rows.length === 0}
        head={
          <>
            <th className="th">Nome</th>
            <th className="th">E-mail</th>
            <th className="th">Perfil</th>
            <th className="th">Status</th>
            <th className="th">Criado em</th>
            <th className="th w-24"></th>
          </>
        }
      >
        {rows.map((r) => (
          <tr key={r.usuarioId} className="hover:bg-slate-50">
            <td className="td">{r.nome}{r.usuarioId === me.id && <span className="ml-2 text-xs text-slate-400">(você)</span>}</td>
            <td className="td">{r.email}</td>
            <td className="td">{r.role === "admin" ? "Administrador" : "Usuário"}</td>
            <td className="td"><Badge ativo={r.ativo} /></td>
            <td className="td">{fmtDate(r.createdAt)}</td>
            <td className="td">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/usuarios/${r.usuarioId}`} title="Editar" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600">
                  <Pencil size={16} />
                </Link>
                {r.usuarioId !== me.id && (
                  <DeleteButton action={excluirUsuario.bind(null, r.usuarioId)} message={`Excluir o usuário ${r.nome}?`} />
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
