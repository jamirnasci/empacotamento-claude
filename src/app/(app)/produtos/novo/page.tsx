import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ProdutoForm from "../ProdutoForm";
import { criarProduto } from "../actions";

export default async function NovoProdutoPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Novo produto" />
      <ProdutoForm action={criarProduto} />
    </>
  );
}
