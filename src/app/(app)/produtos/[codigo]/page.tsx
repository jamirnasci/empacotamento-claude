import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ProdutoForm from "../ProdutoForm";
import { atualizarProduto } from "../actions";

export default async function EditarProdutoPage({ params }: { params: Promise<{ codigo: string }> }) {
  await requireAdmin();
  const codigo = decodeURIComponent((await params).codigo);
  const rows = await query<{ codigo: string; descricao: string; ativo: boolean }>(
    "SELECT codigo, descricao, ativo FROM produtos WHERE codigo = @codigo",
    { codigo },
  );
  if (!rows[0]) notFound();
  return (
    <>
      <PageHeader title={`Editar produto ${codigo}`} />
      <ProdutoForm action={atualizarProduto.bind(null, codigo)} produto={rows[0]} />
    </>
  );
}
