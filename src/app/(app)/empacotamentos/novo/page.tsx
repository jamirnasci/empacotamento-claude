import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { tiposDeCaixa } from "@/lib/empacotamentos";
import { opcoesColaboradores, opcoesProdutos } from "@/lib/opcoes";
import EmpacotamentoForm from "../EmpacotamentoForm";
import { criarEmpacotamento } from "../actions";

export default async function NovoEmpacotamentoPage() {
  await requireUser();
  const [produtos, colaboradores, tipos] = await Promise.all([opcoesProdutos(), opcoesColaboradores(), tiposDeCaixa()]);
  return (
    <>
      <PageHeader title="Novo empacotamento" />
      <EmpacotamentoForm action={criarEmpacotamento} produtos={produtos} colaboradores={colaboradores} tipos={tipos} />
    </>
  );
}
