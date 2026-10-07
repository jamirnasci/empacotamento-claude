import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import UsuarioForm from "../UsuarioForm";
import { atualizarUsuario } from "../actions";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const rows = await query<{ nome: string; email: string; role: string; ativo: boolean }>(
    "SELECT nome, email, role, ativo FROM usuarios WHERE usuarioId = @id",
    { id },
  );
  if (!rows[0]) notFound();
  return (
    <>
      <PageHeader title="Editar usuário" />
      <UsuarioForm action={atualizarUsuario.bind(null, id)} usuario={rows[0]} />
    </>
  );
}
