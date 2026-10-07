import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ColaboradorForm from "../ColaboradorForm";
import { atualizarColaborador } from "../actions";

export default async function EditarColaboradorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const rows = await query<{ nome: string; ativo: boolean }>(
    "SELECT nome, ativo FROM colaboradores WHERE colaboradorId = @id",
    { id },
  );
  if (!rows[0]) notFound();
  return (
    <>
      <PageHeader title="Editar colaborador" />
      <ColaboradorForm action={atualizarColaborador.bind(null, id)} colaborador={rows[0]} />
    </>
  );
}
