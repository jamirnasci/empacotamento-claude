import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ColaboradorForm from "../ColaboradorForm";
import { criarColaborador } from "../actions";

export default async function NovoColaboradorPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Novo colaborador" />
      <ColaboradorForm action={criarColaborador} />
    </>
  );
}
