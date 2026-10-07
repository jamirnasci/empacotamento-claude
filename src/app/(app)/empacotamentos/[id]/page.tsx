import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { buscarEmpacotamento, tiposDeCaixa } from "@/lib/empacotamentos";
import { opcoesColaboradores, opcoesProdutos } from "@/lib/opcoes";
import EmpacotamentoForm from "../EmpacotamentoForm";
import { atualizarEmpacotamento } from "../actions";

export default async function EditarEmpacotamentoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const registro = await buscarEmpacotamento(id);
  if (!registro) notFound();
  const [produtos, colaboradores, tipos] = await Promise.all([
    opcoesProdutos(registro.produtoCod),
    opcoesColaboradores(registro.colaboradorId),
    tiposDeCaixa(),
  ]);
  return (
    <>
      <PageHeader title={`Editar empacotamento #${id}`} />
      <EmpacotamentoForm
        action={atualizarEmpacotamento.bind(null, id)}
        produtos={produtos}
        colaboradores={colaboradores}
        tipos={tipos}
        registro={registro}
      />
    </>
  );
}
